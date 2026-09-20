import {load} from "cheerio";
import {Prisma} from "@/generated/prisma";
import {db} from "@/lib/db";
import {getOwnedRepositories} from "@/lib/github";

export type ScrapeKind="html"|"rss"|"json";
export type ScrapeSourceConfig={
  key:string; name:string; url:string; kind:ScrapeKind;
  selector?:string; titleSelector?:string; dateSelector?:string; linkSelector?:string; imageSelector?:string;
};

type JsonRecord=Record<string,unknown>;
const USER_AGENT="NARASA-CAKRA-PERWANA-Scraper/2.0 (+https://narasacakraperwana.com)";
const timeoutMs=Number(process.env.SCRAPER_TIMEOUT_MS||10000);
const maxBytes=Number(process.env.SCRAPER_MAX_BYTES||2_000_000);

function isRecord(value:unknown):value is JsonRecord{return typeof value==="object"&&value!==null&&!Array.isArray(value)}
function stringValue(value:unknown):string|undefined{return typeof value==="string"?value:undefined}

function allowedHost(url:string){
  const parsed=new URL(url);
  if(parsed.protocol!=="https:")throw new Error("Scraper hanya mengizinkan HTTPS.");
  const allowed=(process.env.SCRAPER_ALLOWED_HOSTS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!allowed.length)throw new Error("SCRAPER_ALLOWED_HOSTS wajib diisi sebelum scraper mengambil data.");
  if(!allowed.some(host=>parsed.hostname===host||parsed.hostname.endsWith("."+host)))throw new Error("Host tidak masuk SCRAPER_ALLOWED_HOSTS.");
  return parsed;
}

async function getText(url:string){
  allowedHost(url);
  const response=await fetch(url,{headers:{"user-agent":USER_AGENT,"accept":"text/html,application/json,application/xml,text/xml;q=0.9,*/*;q=0.8"},signal:AbortSignal.timeout(timeoutMs),cache:"no-store"});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const length=Number(response.headers.get("content-length")||0);
  if(length>maxBytes)throw new Error("Response terlalu besar.");
  const text=await response.text();
  if(new TextEncoder().encode(text).byteLength>maxBytes)throw new Error("Response melebihi batas ukuran.");
  return {response,text};
}

function asDate(value?:string|null){if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date}

async function scrapeSource(source:ScrapeSourceConfig){
  const started=Date.now();
  const run=await db.scrapeRun.create({data:{sourceKey:source.key,status:"RUNNING"}});
  try{
    const {response,text}=await getText(source.url);
    const items:Array<{externalKey:string;title:string;url?:string;publishedAt?:Date|null;imageUrl?:string;excerpt?:string;content?:string;payload?:Prisma.InputJsonValue}>=[];
    if(source.kind==="json"){
      const data=JSON.parse(text) as unknown;
      let rows:unknown[]=Array.isArray(data)?data:[data];
      if(isRecord(data)&&Array.isArray(data.items))rows=data.items;
      for(const row of rows.slice(0,500)){
        if(!isRecord(row))continue;
        const externalKey=String(row.id??row.url??row.slug??JSON.stringify(row));
        items.push({externalKey,title:String(row.title??row.name??externalKey),url:stringValue(row.url),publishedAt:asDate(stringValue(row.publishedAt??row.date)),excerpt:stringValue(row.excerpt),content:stringValue(row.content),payload:row as Prisma.InputJsonValue});
      }
    }else{
      const $=load(text,source.kind==="rss"?"xml":undefined);
      const selector=source.selector||(source.kind==="rss"?"item":"article");
      $(selector).slice(0,500).each((_,element)=>{
        const root=$(element);
        const title=(source.titleSelector?root.find(source.titleSelector):root.find("title, h1, h2, h3, .title")).first().text().trim();
        const href=(source.linkSelector?root.find(source.linkSelector):root.find("link, a[href]")).first().attr("href");
        const dateElement=source.dateSelector?root.find(source.dateSelector):root.find("pubDate, published, time, .date");
        const rawDate=dateElement.first().attr("datetime")||dateElement.first().text().trim();
        const image=(source.imageSelector?root.find(source.imageSelector):root.find("img[src]")).first().attr("src");
        const excerpt=root.find("description, summary, .excerpt, p").first().text().trim();
        const absoluteUrl=href?new URL(href,source.url).toString():undefined;
        const absoluteImage=image?new URL(image,source.url).toString():undefined;
        const externalKey=absoluteUrl||title;
        if(externalKey)items.push({externalKey,title:title||externalKey,url:absoluteUrl,publishedAt:asDate(rawDate),imageUrl:absoluteImage,excerpt});
      });
    }
    for(const item of items){
      await db.scrapedItem.upsert({
        where:{sourceKey_externalKey:{sourceKey:source.key,externalKey:item.externalKey}},
        update:{title:item.title,url:item.url,publishedAt:item.publishedAt,imageUrl:item.imageUrl,excerpt:item.excerpt,content:item.content,payload:item.payload,lastSeenAt:new Date()},
        create:{sourceKey:source.key,externalKey:item.externalKey,title:item.title,url:item.url,publishedAt:item.publishedAt,imageUrl:item.imageUrl,excerpt:item.excerpt,content:item.content,payload:item.payload}
      });
    }
    await db.scrapeSource.update({where:{key:source.key},data:{lastStatus:"OK",lastError:null,lastRunAt:new Date(),lastItemCount:items.length}});
    await db.scrapeRun.update({where:{id:run.id},data:{status:"SUCCESS",itemCount:items.length,finishedAt:new Date(),durationMs:Date.now()-started}});
    return {source:source.key,status:"SUCCESS",items:items.length,responseStatus:response.status};
  }catch(error){
    const message=error instanceof Error?error.message:"Unknown scraper error";
    await db.scrapeSource.update({where:{key:source.key},data:{lastStatus:"ERROR",lastError:message,lastRunAt:new Date()}});
    await db.scrapeRun.update({where:{id:run.id},data:{status:"ERROR",finishedAt:new Date(),durationMs:Date.now()-started,error:message,cause:undefined}});
    return {source:source.key,status:"ERROR",items:0,error:message};
  }
}

function parseEnvSources():ScrapeSourceConfig[]{
  const raw=process.env.SCRAPER_SOURCES;
  if(!raw)return [];
  try{
    const parsed=JSON.parse(raw) as unknown;
    if(!Array.isArray(parsed))throw new Error("SCRAPER_SOURCES harus berupa array JSON.");
    return parsed.filter(isRecord).map(item=>({
      key:String(item.key||""),name:String(item.name||item.key||""),url:String(item.url||""),kind:String(item.kind||"html") as ScrapeKind,
      selector:stringValue(item.selector),titleSelector:stringValue(item.titleSelector),dateSelector:stringValue(item.dateSelector),linkSelector:stringValue(item.linkSelector),imageSelector:stringValue(item.imageSelector)
    }));
  }catch(error){
    throw new Error("SCRAPER_SOURCES bukan JSON yang valid.",{cause:error});
  }
}

async function syncGitHub(){
  const repos=await getOwnedRepositories(Boolean(process.env.GITHUB_TOKEN));
  for(const repository of repos){
    await db.gitHubProject.upsert({
      where:{githubId:repository.id},
      update:{name:repository.name,fullName:repository.full_name,htmlUrl:repository.html_url,description:repository.description,visibility:repository.private?"private":"public",isPrivate:repository.private,archived:repository.archived,fork:repository.fork,defaultBranch:repository.default_branch,language:repository.language,stars:repository.stargazers_count,forks:repository.forks_count,openIssues:repository.open_issues_count,lastCommitSha:repository.last_commit?.sha,lastCommitMsg:repository.last_commit?.message,lastCommitAt:asDate(repository.last_commit?.date),workflowStatus:repository.latest_workflow?.status,workflowResult:repository.latest_workflow?.conclusion,lastSyncedAt:new Date()},
      create:{githubId:repository.id,name:repository.name,fullName:repository.full_name,htmlUrl:repository.html_url,description:repository.description,visibility:repository.private?"private":"public",isPrivate:repository.private,archived:repository.archived,fork:repository.fork,defaultBranch:repository.default_branch,language:repository.language,stars:repository.stargazers_count,forks:repository.forks_count,openIssues:repository.open_issues_count,lastCommitSha:repository.last_commit?.sha,lastCommitMsg:repository.last_commit?.message,lastCommitAt:asDate(repository.last_commit?.date),workflowStatus:repository.latest_workflow?.status,workflowResult:repository.latest_workflow?.conclusion}
    });
  }
  return repos.length;
}

export function validateScraperConfig(){
  const sources=parseEnvSources();
  if(sources.length&&!process.env.SCRAPER_ALLOWED_HOSTS)throw new Error("SCRAPER_ALLOWED_HOSTS wajib diisi ketika ada scraper source.");
  for(const source of sources){
    if(!source.key||!source.url)throw new Error("Setiap scraper source wajib memiliki key dan url.");
    allowedHost(source.url);
    if(!["html","rss","json"].includes(source.kind))throw new Error(`Jenis scraper tidak didukung: ${source.kind}`);
  }
  return {sources:sources.map(source=>({key:source.key,name:source.name,url:source.url,kind:source.kind}))};
}

export async function runScraper(){
  const envSources=parseEnvSources();
  for(const source of envSources){
    await db.scrapeSource.upsert({where:{key:source.key},update:{name:source.name,url:source.url,kind:source.kind,selector:source.selector,titleSelector:source.titleSelector,dateSelector:source.dateSelector,linkSelector:source.linkSelector,imageSelector:source.imageSelector},create:{key:source.key,name:source.name,url:source.url,kind:source.kind,selector:source.selector,titleSelector:source.titleSelector,dateSelector:source.dateSelector,linkSelector:source.linkSelector,imageSelector:source.imageSelector}});
  }
  const dbSources=await db.scrapeSource.findMany({where:{enabled:true},orderBy:{key:"asc"}});
  const results=[];
  for(const source of dbSources){
    results.push(await scrapeSource({key:source.key,name:source.name,url:source.url,kind:source.kind as ScrapeKind,selector:source.selector||undefined,titleSelector:source.titleSelector||undefined,dateSelector:source.dateSelector||undefined,linkSelector:source.linkSelector||undefined,imageSelector:source.imageSelector||undefined}));
  }
  const githubCount=await syncGitHub();
  return {scraped:results,githubProjects:githubCount,completedAt:new Date().toISOString()};
}