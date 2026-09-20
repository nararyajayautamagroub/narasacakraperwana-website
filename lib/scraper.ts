import {load} from "cheerio";
import {db} from "@/lib/db";
import {getOwnedRepositories} from "@/lib/github";

export type ScrapeKind="html"|"rss"|"json";
export type ScrapeSourceConfig={
  key:string;
  name:string;
  url:string;
  kind:ScrapeKind;
  selector?:string;
  titleSelector?:string;
  dateSelector?:string;
  linkSelector?:string;
  imageSelector?:string;
};

const USER_AGENT="NARASA-CAKRA-PERWANA-Scraper/1.0 (+https://narasacakraperwana.com)";
const timeoutMs=Number(process.env.SCRAPER_TIMEOUT_MS||10000);
const maxBytes=Number(process.env.SCRAPER_MAX_BYTES||2_000_000);

function allowedHost(url:string){
  const parsed=new URL(url);
  if(parsed.protocol!=="https:")throw new Error("Scraper hanya mengizinkan HTTPS.");
  const allowed=(process.env.SCRAPER_ALLOWED_HOSTS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(allowed.length && !allowed.some(host=>parsed.hostname===host||parsed.hostname.endsWith("."+host)))throw new Error("Host tidak masuk SCRAPER_ALLOWED_HOSTS.");
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

function asDate(value?:string|null){
  if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date;
}

async function scrapeSource(source:ScrapeSourceConfig){
  const started=Date.now();
  const run=await db.scrapeRun.create({data:{sourceKey:source.key,status:"RUNNING"}});
  try{
    const {response,text}=await getText(source.url);
    const items:Array<{externalKey:string;title:string;url?:string;publishedAt?:Date|null;imageUrl?:string;excerpt?:string;content?:string;payload?:unknown}>=[];
    if(source.kind==="json"){
      const data=JSON.parse(text) as unknown;
      const rows=Array.isArray(data)?data:(typeof data==="object"&&data!==null&&Array.isArray((data as any).items)?(data as any).items:[data]);
      for(const row of rows.slice(0,500)){
        if(!row||typeof row!=="object")continue;
        const r=row as Record<string,unknown>;
        const externalKey=String(r.id??r.url??r.slug??JSON.stringify(r));
        items.push({externalKey,title:String(r.title??r.name??externalKey),url:typeof r.url==="string"?r.url:undefined,publishedAt:asDate(String(r.publishedAt??r.date??""))||null,excerpt:typeof r.excerpt==="string"?r.excerpt:undefined,content:typeof r.content==="string"?r.content:undefined,payload:r});
      }
    }else{
      const $=load(text,source.kind==="rss"?"xml":undefined);
      const selector=source.selector||(source.kind==="rss"?"item":"article");
      $(selector).slice(0,500).each((_,el)=>{
        const root=$(el);
        const title=(source.titleSelector?root.find(source.titleSelector):root.find("title, h1, h2, h3, .title")).first().text().trim();
        const href=(source.linkSelector?root.find(source.linkSelector):root.find("link, a[href]")).first().attr("href");
        const rawDate=(source.dateSelector?root.find(source.dateSelector):root.find("pubDate, published, time, .date")).first().attr("datetime")||root.find("pubDate, published, time, .date").first().text().trim();
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
        update:{title:item.title,url:item.url,publishedAt:item.publishedAt,imageUrl:item.imageUrl,excerpt:item.excerpt,content:item.content,payload:item.payload as any,lastSeenAt:new Date()},
        create:{sourceKey:source.key,externalKey:item.externalKey,title:item.title,url:item.url,publishedAt:item.publishedAt,imageUrl:item.imageUrl,excerpt:item.excerpt,content:item.content,payload:item.payload as any}
      });
    }
    await db.scrapeSource.update({where:{key:source.key},data:{lastStatus:"OK",lastError:null,lastRunAt:new Date(),lastItemCount:items.length}});
    await db.scrapeRun.update({where:{id:run.id},data:{status:"SUCCESS",itemCount:items.length,finishedAt:new Date(),durationMs:Date.now()-started}});
    return {source:source.key,status:"SUCCESS",items:items.length,responseStatus:response.status};
  }catch(error){
    const message=error instanceof Error?error.message:"Unknown scraper error";
    await db.scrapeSource.update({where:{key:source.key},data:{lastStatus:"ERROR",lastError:message,lastRunAt:new Date()}});
    await db.scrapeRun.update({where:{id:run.id},data:{status:"ERROR",finishedAt:new Date(),durationMs:Date.now()-started,error:message}});
    return {source:source.key,status:"ERROR",items:0,error:message};
  }
}

function parseEnvSources():ScrapeSourceConfig[]{
  const raw=process.env.SCRAPER_SOURCES;
  if(!raw)return [];
  try{const parsed=JSON.parse(raw) as unknown[];return parsed.filter(Boolean).map((x:any)=>({key:String(x.key),name:String(x.name||x.key),url:String(x.url),kind:(x.kind||"html") as ScrapeKind,selector:x.selector,titleSelector:x.titleSelector,dateSelector:x.dateSelector,linkSelector:x.linkSelector,imageSelector:x.imageSelector}));}
  catch{throw new Error("SCRAPER_SOURCES bukan JSON yang valid.");}
}

async function syncGitHub(){
  const repos=await getOwnedRepositories(Boolean(process.env.GITHUB_TOKEN));
  for(const r of repos){
    await db.gitHubProject.upsert({
      where:{githubId:r.id},
      update:{name:r.name,fullName:r.full_name,htmlUrl:r.html_url,description:r.description,visibility:r.private?"private":"public",isPrivate:r.private,archived:r.archived,fork:r.fork,defaultBranch:r.default_branch,language:r.language,stars:r.stargazers_count,forks:r.forks_count,openIssues:r.open_issues_count,lastCommitSha:r.last_commit?.sha,lastCommitMsg:r.last_commit?.message,lastCommitAt:asDate(r.last_commit?.date),workflowStatus:r.latest_workflow?.status,workflowResult:r.latest_workflow?.conclusion,lastSyncedAt:new Date()},
      create:{githubId:r.id,name:r.name,fullName:r.full_name,htmlUrl:r.html_url,description:r.description,visibility:r.private?"private":"public",isPrivate:r.private,archived:r.archived,fork:r.fork,defaultBranch:r.default_branch,language:r.language,stars:r.stargazers_count,forks:r.forks_count,openIssues:r.open_issues_count,lastCommitSha:r.last_commit?.sha,lastCommitMsg:r.last_commit?.message,lastCommitAt:asDate(r.last_commit?.date),workflowStatus:r.latest_workflow?.status,workflowResult:r.latest_workflow?.conclusion}
    });
  }
  return repos.length;
}

export async function runScraper(){
  const envSources=parseEnvSources();
  for(const source of envSources){
    await db.scrapeSource.upsert({where:{key:source.key},update:{name:source.name,url:source.url,kind:source.kind,selector:source.selector,titleSelector:source.titleSelector,dateSelector:source.dateSelector,linkSelector:source.linkSelector,imageSelector:source.imageSelector},create:{key:source.key,name:source.name,url:source.url,kind:source.kind,selector:source.selector,titleSelector:source.titleSelector,dateSelector:source.dateSelector,linkSelector:source.linkSelector,imageSelector:source.imageSelector}});
  }
  const dbSources=await db.scrapeSource.findMany({where:{enabled:true},orderBy:{key:"asc"}});
  const results=[];for(const source of dbSources){results.push(await scrapeSource(source as ScrapeSourceConfig));}
  const githubCount=await syncGitHub();
  return {scraped:results,githubProjects:githubCount,completedAt:new Date().toISOString()};
}