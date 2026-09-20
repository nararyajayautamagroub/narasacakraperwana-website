"use client";
import Link from "next/link";
import {useState} from "react";
import {LocaleSwitcher} from "@/components/LocaleSwitcher";
import {UserMenu} from "@/components/UserMenu";
import {getClientLocale,messages,type Locale} from "@/lib/i18n";
const links=[["/","home"],["/divisions","divisions"],["/recruitment","recruitment"],["/events","events"],["/fleet","fleet"],["/github","projects"],["/news","news"],["/about","about"]] as const;
export function Navbar(){
  const [open,setOpen]=useState(false);
  const [locale]=useState<Locale>(()=>getClientLocale("id"));
  const t=messages[locale]||messages.id;
  const close=()=>setOpen(false);
  return <header className="nav">
    <div className="container nav-inner">
      <Link href="/" className="brand" onClick={close}><span className="brand-mark">N</span><span>NARASA CAKRA PERWANA</span></Link>
      <nav className="nav-links" aria-label="Navigasi utama">{links.slice(1).map(([href,key])=><Link key={href} href={href}>{t[key]}</Link>)}</nav>
      <div className="nav-actions"><LocaleSwitcher current={locale}/><UserMenu/><button className="hamburger btn btn-primary" type="button" aria-label={open?"Tutup menu":"Buka menu"} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>=</button></div>
    </div>
    <div className={"mobile-panel "+(open?"is-open":"")} aria-hidden={!open}>
      <div className="container mobile-panel-inner">
        {links.map(([href,key])=><Link key={href} href={href} onClick={close}>{t[key]}</Link>)}
        <div className="mobile-tools"><LocaleSwitcher current={locale}/><UserMenu/></div>
      </div>
    </div>
  </header>;
}