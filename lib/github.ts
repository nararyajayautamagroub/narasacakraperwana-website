type GitHubRepo={
  id:number;name:string;full_name:string;html_url:string;private:boolean;archived:boolean;fork:boolean;default_branch:string;
  description:string|null;language:string|null;stargazers_count:number;forks_count:number;open_issues_count:number;updated_at:string;
  pushed_at:string|null;size:number;last_commit?:{sha:string;message:string;author:string|null;date:string}|null;
  latest_workflow?:{status:string;conclusion:string|null;name:string|null;html_url:string|null;updated_at:string}|null;
};

type GitHubApiRepo={
  id:number;name:string;full_name:string;html_url:string;private?:boolean;archived?:boolean;fork?:boolean;default_branch:string;
  description?:string|null;language?:string|null;stargazers_count?:number;forks_count?:number;open_issues_count?:number;
  updated_at:string;pushed_at?:string|null;size?:number;
};
type GitHubApiCommit={
  sha:string;
  commit?:{
    message?:string;
    author?:{name?:string|null;date?:string|null}|null;
    committer?:{date?:string|null}|null;
  }|null;
};
type GitHubApiWorkflow={
  status?:string;
  conclusion?:string|null;
  name?:string|null;
  html_url?:string|null;
  updated_at?:string;
};
type GitHubApiRuns={workflow_runs?:GitHubApiWorkflow[]};
type GitHubApiTreeItem={type?:string;path?:string;size?:number;sha?:string;url?:string};
type GitHubApiTree={tree?:GitHubApiTreeItem[];truncated?:boolean};

const API="https://api.github.com";
const VERSION="2026-03-10";
const owner=process.env.GITHUB_OWNER||"nararyajayautamagroub";

async function githubFetch<T>(path:string):Promise<T|null>{
  const headers:Record<string,string>={Accept:"application/vnd.github+json","X-GitHub-Api-Version":VERSION};
  if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  try{
    const r=await fetch(API+path,{headers,next:{revalidate:60},signal:AbortSignal.timeout(8000)});
    if(!r.ok)return null;
    return await r.json() as T;
  }catch{return null}
}

function normalize(r:GitHubApiRepo):GitHubRepo{
  return {
    id:r.id,name:r.name,full_name:r.full_name,html_url:r.html_url,private:Boolean(r.private),archived:Boolean(r.archived),
    fork:Boolean(r.fork),default_branch:r.default_branch,description:r.description??null,language:r.language??null,
    stargazers_count:r.stargazers_count??0,forks_count:r.forks_count??0,open_issues_count:r.open_issues_count??0,
    updated_at:r.updated_at,pushed_at:r.pushed_at??null,size:r.size??0
  };
}

export async function getOwnedRepositories(includePrivate=false):Promise<GitHubRepo[]>{
  const token=process.env.GITHUB_TOKEN;
  const raw=token
    ? (await githubFetch<GitHubApiRepo[]>(`/user/repos?affiliation=owner&per_page=100&sort=updated`)||[])
    : (await githubFetch<GitHubApiRepo[]>(`/users/${encodeURIComponent(owner)}/repos?per_page=100&sort=updated`)||[]);
  const visible=raw.filter(r=>includePrivate||!r.private);
  if(!token)return visible.map(normalize);

  const enriched=await Promise.all(visible.map(async repo=>{
    const [commits,runs]=await Promise.all([
      githubFetch<GitHubApiCommit[]>(`/repos/${repo.full_name}/commits?sha=${encodeURIComponent(repo.default_branch)}&per_page=1`),
      githubFetch<GitHubApiRuns>(`/repos/${repo.full_name}/actions/runs?per_page=1`)
    ]);
    const commit=commits?.[0];
    const workflow=runs?.workflow_runs?.[0];
    return {
      ...normalize(repo),
      last_commit:commit?{
        sha:commit.sha,
        message:String(commit.commit?.message||"").split("\n")[0],
        author:commit.commit?.author?.name??null,
        date:commit.commit?.author?.date??commit.commit?.committer?.date??""
      }:null,
      latest_workflow:workflow?{
        status:workflow.status??"unknown",
        conclusion:workflow.conclusion??null,
        name:workflow.name??null,
        html_url:workflow.html_url??null,
        updated_at:workflow.updated_at??""
      }:null
    };
  }));
  return enriched;
}

export async function getGitHubOverview(){
  const repos=await getOwnedRepositories(false);
  const latest=[...repos].sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0]||null;
  return {owner,repoCount:repos.length,repos,latest};
}

export async function getRepositoryPublic(name:string){
  const repo=await githubFetch<GitHubApiRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
  if(!repo||repo.private)return null;
  return normalize(repo);
}

export async function getRepositoryTree(name:string){
  const repo=await getRepositoryPublic(name);
  if(!repo)return null;
  const branchCommit=await githubFetch<{commit?:{tree?:{sha?:string}}}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.name)}/commits/${encodeURIComponent(repo.default_branch)}`);
  const treeSha=branchCommit?.commit?.tree?.sha;
  if(!treeSha)return {repo,files:[] as Array<{path:string;size:number;sha:string;url:string}>};
  const tree=await githubFetch<GitHubApiTree>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.name)}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`);
  if(!tree)return {repo,files:[] as Array<{path:string;size:number;sha:string;url:string}>};
  const files=(tree.tree??[]).filter(item=>item.type==="blob"&&item.path&&item.sha).slice(0,200).map(item=>({
    path:item.path!,
    size:item.size??0,
    sha:item.sha!,
    url:item.url??""
  }));
  return {repo,files,truncated:Boolean(tree.truncated)};
}

export type {GitHubRepo};