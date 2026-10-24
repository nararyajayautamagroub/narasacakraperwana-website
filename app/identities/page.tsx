"use client";
import {useState} from "react";

type Identity={publicId:string;type:string;name:string;status:string;createdAt:string};
export default function IdentitiesPage(){
 const [type,setType]=useState<"passenger"|"driver">("passenger");const [name,setName]=useState("");const [phone,setPhone]=useState("");const [email,setEmail]=useState("");const [simulator,setSimulator]=useState("BUSSID");const [licenseType,setLicenseType]=useState("VIRTUAL");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [identity,setIdentity]=useState<Identity|null>(null);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setIdentity(null);try{const r=await fetch("/api/identities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,name,phone,email,simulator,licenseType})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Pembuatan ID gagal.");setIdentity(d)}catch(e){setError(e instanceof Error?e.message:"Terjadi kesalahan.")}finally{setBusy(false)}}
 return <main className="section"><div className="container" style={{maxWidth:760}}><div className="eyebrow">MEMBER REGISTRY</div><h1 className="title">ID Supir & Penumpang</h1><p className="lead">Buat ID unik yang disimpan ke database produksi. ID supir baru berstatus menunggu verifikasi admin.</p>
 <form className="card" onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
 <label>Jenis ID<select value={type} onChange={e=>setType(e.target.value as "passenger"|"driver")} style={field}><option value="passenger">ID Penumpang</option><option value="driver">ID Supir</option></select></label>
 <label>Nama lengkap<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" style={field}/></label>
 <label>Nomor telepon<input required maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" style={field}/></label>
 <label>Email (opsional)<input type="email" maxLength={150} value={email} onChange={e=>setEmail(e.target.value)} style={field}/></label>
 {type==="driver"&&<><label>Simulator<select value={simulator} onChange={e=>setSimulator(e.target.value)} style={field}><option>BUSSID</option><option>ETS2</option><option>ATS</option><option>Roblox</option><option>Other</option></select></label><label>Tipe lisensi<select value={licenseType} onChange={e=>setLicenseType(e.target.value)} style={field}><option>VIRTUAL</option><option>BEGINNER</option><option>PRO</option></select></label></>}
 {error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}<button className="btn btn-primary" disabled={busy} type="submit">{busy?"MENYIMPAN...":"BUAT ID →"}</button>
 </form>
 {identity&&<section className="card" style={{marginTop:18}} aria-live="polite"><div className="eyebrow">ID BERHASIL DIBUAT</div><h2 style={{fontSize:24,overflowWrap:"anywhere"}}>{identity.publicId}</h2><p>Nama: <strong>{identity.name}</strong></p><p>Status: <strong>{identity.status}</strong></p><p className="muted" style={{fontSize:13}}>Simpan ID ini. Status dan data akan tersimpan pada database.</p><button className="btn btn-ghost" onClick={()=>navigator.clipboard?.writeText(identity.publicId)}>Salin ID</button></section>}
 <p className="muted" style={{fontSize:12,marginTop:20}}>Project ID: NCRP-WEB-2026-0001</p></div></main>
}
const field:React.CSSProperties={display:"block",width:"100%",padding:"12px 13px",marginTop:6,borderRadius:10,border:"1px solid var(--border, #e5dce3)",font:"inherit",background:"var(--surface, #fff)"};
