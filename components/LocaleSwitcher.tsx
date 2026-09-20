"use client";
import {useEffect,useState} from "react"; import {locales,type Locale} from "@/lib/i18n";
export function LocaleSwitcher({current="id"}:{current?:Locale}){
 const [value,setValue]=useState<Locale>(current);
 useEffect(()=>{const cookie=document.cookie.split("; ").find(x=>x.startsWith("ncrp_locale="))?.split("=")[1] as Locale|undefined;if(cookie&&locales.some(x=>x.code===cookie))setValue(cookie)},[]);
 async function change(next:Locale){setValue(next);document.cookie=`ncrp_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale:next})}).catch(()=>{});window.location.reload()}
 return <select className="locale-select" aria-label="Language" value={value} onChange={e=>change(e.target.value as Locale)}>{locales.map(x=><option key={x.code} value={x.code}>{x.flag} {x.name}</option>)}</select>
}