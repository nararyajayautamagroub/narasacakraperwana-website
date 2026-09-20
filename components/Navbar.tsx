"use client";
import Link from "next/link";
import {useState} from "react";

const links=[
  ["/divisions","Divisions"],
  ["/recruitment","Recruitment"],
  ["/events","Events"],
  ["/fleet","Fleet"],
  ["/github","Projects"],
  ["/news","News"],
  ["/about","About"]
] as const;

export function Navbar(){
  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);
  return <header className="nav">
    <div className="container nav-inner">
      <Link href="/" className="brand" onClick={close}>
        <span className="brand-mark">N</span>
        <span>NARASA CAKRA PERWANA</span>
      </Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        {links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="nav-actions">
        <Link className="btn btn-primary nav-cta" href="/recruitment">JOIN US</Link>
        <button className="hamburger btn btn-primary" type="button" aria-label={open?"Tutup menu":"Buka menu"} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>=</button>
      </div>
    </div>
    <div className={"mobile-panel "+(open?"is-open":"")} aria-hidden={!open}>
      <div className="container mobile-panel-inner">
        {links.map(([href,label])=><Link key={href} href={href} onClick={close}>{label}</Link>)}
        <Link className="btn btn-primary mobile-join" href="/recruitment" onClick={close}>JOIN US →</Link>
      </div>
    </div>
  </header>;
}