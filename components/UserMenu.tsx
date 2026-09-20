"use client";
import Link from "next/link"; import {signOut,useSession} from "next-auth/react"; import {useEffect,useState} from "react"; import {messages,type Locale} from "@/lib/i18n";
export function UserMenu(){
 const {data:session,status}=useSession(); const [locale,setLocale]=useState<Locale>("id");
 useEffect(()=>{const c=document.cookie.split("; ").find(x=>x.startsWith("ncrp_locale="))?.split("=")[1] as Locale|undefined;if(c)setLocale(c)},[]);
 if(status==="loading")return <span className="nav-user-skeleton"/>;
 const t=messages[locale]||messages.id;
 if(!session)return <div className="account-actions"><Link className="btn btn-ghost btn-small" href="/login">{t.login}</Link><Link className="btn btn-primary btn-small" href="/register">{t.register}</Link></div>;
 return <div className="account-actions"><Link className="account-chip" href="/dashboard">{session.user.name||session.user.email}</Link><Link className="btn btn-primary btn-small" href="/settings">{t.settings}</Link><button className="btn btn-ghost btn-small" onClick={()=>signOut({callbackUrl:"/"})}>{t.logout}</button></div>
}