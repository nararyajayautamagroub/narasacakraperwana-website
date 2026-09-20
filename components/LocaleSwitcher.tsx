"use client";
import {useState} from "react";
import {getClientLocale,locales,type Locale} from "@/lib/i18n";
export function LocaleSwitcher({current="id"}:{current?:Locale}){
  const [value,setValue]=useState<Locale>(()=>getClientLocale(current));
  async function change(next:Locale){
    setValue(next);
    const r=await fetch("/api/locale",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale:next})});
    if(r.ok)window.location.reload();
  }
  return <select className="locale-select" aria-label="Language" value={value} onChange={e=>change(e.target.value as Locale)}>{locales.map(x=><option key={x.code} value={x.code}>{x.flag} {x.name}</option>)}</select>;
}