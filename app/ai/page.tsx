"use client";

import {useState} from "react";

const PROJECT_ID="NCRP-WEB-2026-0001";

export default function AIPage(){
  const [prompt,setPrompt]=useState("");
  const [answer,setAnswer]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");setAnswer("");
    try{
      const response=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Permintaan AI gagal diproses.");
      setAnswer(data.answer);
    }catch(err){setError(err instanceof Error?err.message:"Terjadi kesalahan.");}
    finally{setBusy(false);}
  }

  return <main className="section"><div className="container" style={{maxWidth:900}}>
    <div className="eyebrow">NCRP DIGITAL ASSISTANT</div>
    <h1 className="title">AI Assistant</h1>
    <p className="lead">Asisten AI untuk membantu ide, dokumentasi, operasional komunitas, dan pengembangan website.</p>
    <div className="card" style={{marginTop:24}}>
      <p className="muted" style={{marginTop:0}}>Project ID</p>
      <p style={{fontWeight:700,fontSize:18,marginBottom:8}}>{PROJECT_ID}</p>
      <p className="muted" style={{fontSize:13,marginBottom:0}}>Status AI mengikuti konfigurasi server. Jangan masukkan kata sandi, token, atau data pribadi.</p>
    </div>
    <form className="card" onSubmit={submit} style={{marginTop:18,display:"grid",gap:14}}>
      <label htmlFor="ai-prompt" style={{fontWeight:700}}>Apa yang ingin dibantu?</label>
      <textarea id="ai-prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={4000} required rows={6} placeholder="Contoh: Buatkan rencana event komunitas bus virtual selama satu minggu." style={{width:"100%",padding:14,borderRadius:12,border:"1px solid var(--border, #e5dce3)",background:"var(--surface, #fff)",font:"inherit",resize:"vertical"}}/>
      <div className="muted" style={{fontSize:12}}>{prompt.length}/4000 karakter</div>
      <button className="btn btn-primary" type="submit" disabled={busy||!prompt.trim()}>{busy?"MEMPROSES...":"TANYA AI →"}</button>
      {error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}
      {answer&&<section aria-live="polite" style={{borderRadius:12,padding:16,background:"var(--surface, #fff)",border:"1px solid var(--border, #e5dce3)"}}><h2 style={{fontSize:20,marginTop:0}}>Jawaban AI</h2><p style={{whiteSpace:"pre-wrap",lineHeight:1.7,marginBottom:0}}>{answer}</p></section>}
    </form>
  </div></main>;
}
