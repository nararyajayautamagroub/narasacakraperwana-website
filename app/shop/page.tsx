"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";

const catalog=[
 {id:"virtual-passenger",name:"Passenger Virtual ID",description:"Identitas penumpang komunitas virtual.",price:10000},
 {id:"driver-registration",name:"Driver Registration ID",description:"Pendaftaran identitas pengemudi virtual.",price:15000},
 {id:"community-membership",name:"Community Membership",description:"Paket keanggotaan komunitas.",price:25000},
 {id:"digital-service",name:"Digital Service",description:"Layanan digital komunitas.",price:30000}
] as const;
type Cart=Record<string,number>;
type Order={transactionId:string;status:string;total:number;items:{name:string;quantity:number;lineTotal:number}[];paymentExpiresAt:string;createdAt:string};
const rupiah=(value:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);

export default function ShopPage(){
 const [cart,setCart]=useState<Cart>({});
 const [name,setName]=useState("");const [phone,setPhone]=useState("");const [email,setEmail]=useState("");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [order,setOrder]=useState<Order|null>(null);const [now,setNow]=useState(0);
 const total=useMemo(()=>catalog.reduce((sum,item)=>sum+item.price*(cart[item.id]||0),0),[cart]);
 const qrUrl=process.env.NEXT_PUBLIC_QRIS_IMAGE_URL;
 const waNumber=(process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER||"").replace(/\D/g,"");
 useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const transactionId=order?.transactionId;const orderStatus=order?.status;\n useEffect(()=>{if(!transactionId||orderStatus!=="PENDING")return;let live=true;const poll=async()=>{try{const r=await fetch("/api/orders/"+transactionId,{cache:"no-store"});const d=await r.json();if(live&&r.ok)setOrder(old=>old?{...old,...d}:null)}catch{/* Keep the last known status while the network is unavailable. */}};const timer=setInterval(poll,5000);return()=>{live=false;clearInterval(timer)}},[transactionId,orderStatus]);
 const remaining=order?Math.max(0,Math.floor((new Date(order.paymentExpiresAt).getTime()-now)/1000)):0;
 const timerText=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");
 async function checkout(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  try{
   const items=Object.entries(cart).filter(([,quantity])=>quantity>0).map(([id,quantity])=>({id,quantity}));
   const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,email,items})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"Checkout gagal.");
   setOrder(d);setCart({});
  }catch(e){setError(e instanceof Error?e.message:"Checkout gagal.");}
  finally{setBusy(false);}
 }
 const waMessage=order?encodeURIComponent("Halo admin NARASA CAKRA PERWANA, saya ingin konfirmasi pembayaran.\nID Transaksi: "+order.transactionId+"\nTotal: "+rupiah(order.total)+"\nStatus: "+order.status):"";
 return <main className="section"><div className="container" style={{maxWidth:1000}}>
  <div className="eyebrow">NCRP DIGITAL STORE</div><h1 className="title">Layanan & Keranjang</h1>
  <p className="lead">Pilih layanan, periksa total, lalu buat transaksi. Harga dihitung ulang di server agar tidak bisa diubah dari browser.</p>
  {!order?<div className="grid grid-2" style={{marginTop:28,alignItems:"start"}}>
   <section className="grid" style={{gap:14}}>{catalog.map(item=><article className="card" key={item.id} style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center"}}>
    <div><h2 style={{fontSize:18,margin:"0 0 6px"}}>{item.name}</h2><p className="muted" style={{margin:"0 0 10px"}}>{item.description}</p><strong>{rupiah(item.price)}</strong></div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}><button className="btn btn-ghost" type="button" aria-label={"Kurangi "+item.name} onClick={()=>setCart(c=>({...c,[item.id]:Math.max(0,(c[item.id]||0)-1)}))}>−</button><span>{cart[item.id]||0}</span><button className="btn btn-primary" type="button" aria-label={"Tambah "+item.name} onClick={()=>setCart(c=>({...c,[item.id]:Math.min(10,(c[item.id]||0)+1)}))}>+</button></div>
   </article>)}</section>
   <form className="card" onSubmit={checkout} style={{display:"grid",gap:14,position:"sticky",top:20}}>
    <h2 style={{fontSize:22,margin:0}}>Ringkasan pesanan</h2>
    {catalog.filter(i=>(cart[i.id]||0)>0).map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:12}}><span>{i.name} × {cart[i.id]}</span><strong>{rupiah(i.price*(cart[i.id]||0))}</strong></div>)}
    <div style={{borderTop:"1px solid var(--border, #eee)",paddingTop:12,display:"flex",justifyContent:"space-between"}}><strong>Total</strong><strong>{rupiah(total)}</strong></div>
    <label>Nama lengkap<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" style={inputStyle}/></label>
    <label>Nomor WhatsApp<input value={phone} onChange={e=>setPhone(e.target.value)} required maxLength={20} autoComplete="tel" placeholder="08xxxxxxxxxx" style={inputStyle}/></label>
    <label>Email (opsional)<input value={email} onChange={e=>setEmail(e.target.value)} type="email" maxLength={150} autoComplete="email" style={inputStyle}/></label>
    {error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}
    <button className="btn btn-primary" disabled={busy||total===0} type="submit">{busy?"MEMBUAT TRANSAKSI...":"CHECKOUT →"}</button>
    <p className="muted" style={{fontSize:12,margin:0}}>Pembayaran berlaku 10 menit setelah transaksi dibuat. Pesanan baru tercatat jika database produksi sudah dikonfigurasi.</p>
   </form>
  </div>:<section className="card" style={{marginTop:24,maxWidth:720,marginInline:"auto"}}>
   <div className="eyebrow">TRANSACTION CREATED</div><h2 style={{fontSize:26,margin:"8px 0"}}>Selesaikan pembayaran</h2>
   <p className="muted">ID Transaksi</p><p style={{fontSize:20,fontWeight:800,overflowWrap:"anywhere"}}>{order.transactionId}</p>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><span>Status: <strong>{order.status}</strong></span><span style={{fontSize:24,fontWeight:800,color:remaining===0?"#b42318":"var(--accent, #b52d68)"}}>{order.status==="PENDING"?timerText:order.status==="EXPIRED"?"EXPIRED":order.status}</span></div>
   <p>Total pembayaran: <strong>{rupiah(order.total)}</strong></p>
   {qrUrl?<div style={{textAlign:"center",margin:"20px 0"}}><img src={qrUrl} alt="QRIS pembayaran resmi" style={{maxWidth:300,width:"100%",height:"auto",margin:"auto",borderRadius:12}}/><p className="muted" style={{fontSize:12}}>Pastikan nama merchant dan jumlah pembayaran benar sebelum membayar.</p></div>:<div style={{padding:16,borderRadius:12,background:"var(--surface, #fff5f8)",border:"1px solid var(--border, #f0dce5)"}}>QRIS belum dikonfigurasi. Admin harus mengatur <code>NEXT_PUBLIC_QRIS_IMAGE_URL</code> ke gambar QRIS merchant resmi sebelum pelanggan membayar.</div>}
   <p className="muted" style={{fontSize:13}}>Status akan diperbarui otomatis setiap 5 detik. Status pembayaran belum dapat diverifikasi otomatis tanpa integrasi payment gateway atau pemeriksaan admin.</p>
   {waNumber&&<a className="btn btn-primary" href={"https://wa.me/"+waNumber+"?text="+waMessage} target="_blank" rel="noreferrer">KONFIRMASI VIA WHATSAPP →</a>}
   <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}><button className="btn btn-ghost" onClick={()=>{setOrder(null);setError("")}}>Kembali ke toko</button><Link className="btn btn-ghost" href="/">Beranda</Link></div>
  </section>}
  <p className="muted" style={{fontSize:12,marginTop:24}}>Project ID: NCRP-WEB-2026-0001</p>
 </div></main>;
}
const inputStyle:React.CSSProperties={display:"block",width:"100%",padding:"12px 13px",marginTop:6,borderRadius:10,border:"1px solid var(--border, #e5dce3)",font:"inherit",background:"var(--surface, #fff)"};
