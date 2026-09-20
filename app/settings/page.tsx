"use client";
import {useState} from "react";
import {useSession} from "next-auth/react";
import {locales,type Locale} from "@/lib/i18n";

export default function SettingsPage(){
  const {data:session,status}=useSession();
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  if(status==="loading")return <main><div className="container page-head"><h1 className="title">Memuat...</h1></div></main>;
  if(!session)return <main><div className="container page-head"><h1 className="title">Silakan masuk.</h1></div></main>;

  async function save(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setSaving(true);setMessage("");setError("");
    const form=new FormData(e.currentTarget);
    const body={
      name:String(form.get("name")||""),
      locale:String(form.get("locale")||"id") as Locale,
      currentPassword:String(form.get("currentPassword")||""),
      newPassword:String(form.get("newPassword")||"")
    };
    const r=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){setError(d.error||"Gagal menyimpan.");setSaving(false);return}
    setMessage("Pengaturan berhasil disimpan.");
    e.currentTarget.reset();
    setSaving(false);
    window.setTimeout(()=>window.location.reload(),350);
  }

  return <main>
    <div className="container page-head"><div className="eyebrow">Account Settings</div><h1 className="title">Pengaturan.</h1><p className="lead">Kelola profil, bahasa, dan keamanan akun.</p></div>
    <section className="section" style={{paddingTop:20}}>
      <div className="container">
        <form className="card form" onSubmit={save}>
          <div className="field"><label>Nama</label><input name="name" defaultValue={session.user.name||""} required minLength={2}/></div>
          <div className="field"><label>Bahasa</label><select name="locale" defaultValue={session.user.locale||"id"}>{locales.map(x=><option key={x.code} value={x.code}>{x.flag} {x.name}</option>)}</select></div>
          <div className="field"><label>Email</label><input value={session.user.email||""} disabled readOnly/></div>
          <div className="settings-divider"/>
          <div className="eyebrow">Change Password</div>
          {session.user.hasPassword&&<div className="field"><label>Password saat ini</label><input name="currentPassword" type="password" autoComplete="current-password"/></div>}
          <div className="field"><label>{session.user.hasPassword?"Password baru":"Buat password"}</label><input name="newPassword" type="password" minLength={8} autoComplete="new-password"/></div>
          {!session.user.hasPassword&&<p className="muted">Akun Google belum memiliki password lokal. Kamu bisa membuatnya di sini.</p>}
          {message&&<div className="notice success-notice">{message}</div>}
          {error&&<div className="notice">{error}</div>}
          <button className="btn btn-primary" disabled={saving}>{saving?"MENYIMPAN...":"SAVE SETTINGS →"}</button>
        </form>
      </div>
    </section>
  </main>;
}