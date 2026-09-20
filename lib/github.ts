type GitHubRepo={id:number;name:string;full_name:string;html_url:string;private:boolean;archived:boolean;fork:boolean;default_branch:string;description:string|null;language:string|null;stargazers_count:number;forks_count:number;open_issues_count:number;updated_at:string;pushed_at:string|null;size:number;last_commit?:{sha:string;message:string;author:string|null;date:string}|null;latest_workflow?:{status:string;conclusion:string|null;name:string|null;html_url:string|null;updated_at:string}|null};
const API="https://api.github.com"; const VERSION="2026-03-10"; const owner=process.env.GITHUB_OWNER||"nararyajayautamagroub";
async function githubFetch<T>(path:string):Promise<T|null>{const headers:Record<string,string>={Accept:"application/vnd.github+json","X-GitHub-Api-Version":VERSION};if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;try{const r=await fetch(API+path,{headers,next:{revalidate:60},signal:AbortSignal.timeout(8000)});if(!r.ok)return null;return await r.json() as T}catch{return null}}
function normalize(r:any):GitHubRepo{return{id:r.id,name:r.name,full_name:r.full_name,html_url:r.html_url,private:!!r.private,archived:!!r.archived,fork:!!r.fork,default_branch:r.default_branch,description:r.description||null,language:r.language||null,stargazers_count:r.stargazers_count||0,forks_count:r.forks_count||0,open_issues_count:r.open_issues_count||0,updated_at:r.updated_at,pushed_at:r.pushed_at||null,size:r.size||0};}
export async function getOwnedRepositories(includePrivate=false):Promise<GitHubRepo[]>{const token=process.env.GITHUB_TOKEN;let raw:any[]=token?(await githubFetch<any[]>(`/user/repos?affiliation=owner&per_page=100&sort=updated`)||[]):(await githubFetch<any[]>(`/users/${encodeURIComponent(owner)}/repos?per_page=100&sort=updated`)||[]);raw=raw.filter(r=>includePrivate||!r.private);if(!token)return raw.map(normalize);
const enriched=await Promise.all(raw.map(async r=>{const [commits,runs]=await Promise.all([githubFetch<any[]>(`/repos/${r.full_name}/commits?sha=${encodeURIComponent(r.default_branch)}&per_page=1`),githubFetch<any>(`/repos/${r.full_name}/actions/runs?per_page=1`)]);const c=commits?.[0],w=runs?.workflow_runs?.[0];return{...normalize(r),last_commit:c?{sha:c.sha,message:String(c.commit?.message||"").split("\n")[0],author:c.commit?.author?.name||null,date:c.commit?.author?.date||c.commit?.committer?.date||""}:null,latest_workflow:w?{status:w.status,conclusion:w.conclusion||null,name:w.name||null,html_url:w.html_url||null,updated_at:w.updated_at}:null}}));return enriched;}
export async function getGitHubOverview(){const repos=await getOwnedRepositories(false);const latest=[...repos].sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0]||null;return{owner,repoCount:repos.length,repos,latest};}
export type {GitHubRepo};

export async function getRepositoryPublic(name:string){
  const repo=await githubFetch<any>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
  if(!repo||repo.private)return null;
  return normalize(repo);
}

export async function getRepositoryTree(name:string){
  const repo=await getRepositoryPublic(name);
  if(!repo)return null;
  const tree=await githubFetch<any>(`/repos/${encodeURIComponent(repo.full_name.split("/")[0])}/${encodeURIComponent(repo.name)}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`);
  if(!tree)return {repo,files:[]};
  const files=Array.isArray(tree.tree)?tree.tree.filter((item:any)=>item.type==="blob").slice(0,200).map((item:any)=>({path:item.path,size:item.size||0,sha:item.sha,url:item.url})):[]; 
  return {repo,files,truncated:Boolean(tree.truncated)};
}