"use client";
import Link from "next/link";
import {signOut,useSession} from "next-auth/react";
import {useState} from "react";
import {getClientLocale,messages,type Locale} from "@/lib/i18n";
export function UserMenu(){
  const {data:session,status}=useSession();
  const [locale]=useState<Locale>(()=>getClientLocale("id"));
  const t=messages[locale]||messages.id;
  if(status==="loading")return <span className="nav-user-skeleton"/>;
  if(!session)return <div className="account-actions"><Link className="btn btn-ghost btn-small" href="/login">{t.login}</Link><Link className="btn btn-primary btn-small" href="/register">{t.register}</Link></div>;
  return <div className="account-actions"><Link className="account-chip" href="/dashboard">{session.user.name||session.user.email}</Link><Link className="btn btn-primary btn-small" href="/settings">{t.settings}</Link><button className="btn btn-ghost btn-small" onClick={()=>signOut({callbackUrl:"/"})}>{t.logout}</button></div>;
}