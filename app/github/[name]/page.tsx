import {notFound} from "next/navigation";
import Link from "next/link";
import {getRepositoryTree} from "@/lib/github";

export const dynamic="force-dynamic";

function formatBytes(bytes:number){
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export default async function ProjectDetail({params}:{params:Promise<{name:string}>}){
  const {name}=await params;
  const data=await getRepositoryTree(name);
  if(!data?.repo)return notFound();
  return <main>
    <div className="container page-head">
      <Link href="/github" className="muted">← Project Monitor</Link>
      <div className="eyebrow" style={{marginTop:24}}>LIVE REPOSITORY</div>
      <h1 className="title">{data.repo.name}</h1>
      <p className="lead">{data.repo.description||"Repository publik tanpa deskripsi."}</p>
      <div className="chips" style={{marginTop:18}}>
        <span className="chip">{data.repo.language||"Project"}</span>
        <span className="chip">{data.repo.default_branch}</span>
        <span className="chip">★ {data.repo.stargazers_count}</span>
        <span className="chip">{data.files.length} indexed files{data.truncated?" +":" "}</span>
      </div>
    </div>
    <section className="section" style={{paddingTop:20}}>
      <div className="container">
        <div className="card">
          <div className="repo-file-head"><strong>Repository tree</strong><a className="btn btn-ghost btn-small" href={data.repo.html_url} target="_blank" rel="noreferrer">OPEN GITHUB ↗</a></div>
          <div className="table-wrap repo-tree"><table className="table"><thead><tr><th>Path</th><th>Size</th></tr></thead><tbody>{data.files.map(file=><tr key={file.sha}><td><code>{file.path}</code></td><td>{formatBytes(file.size)}</td></tr>)}</tbody></table></div>
          <p className="muted" style={{marginBottom:0}}>File tree dibaca dari GitHub API. Isi repository privat tidak ditampilkan di halaman publik.</p>
        </div>
      </div>
    </section>
  </main>;
}