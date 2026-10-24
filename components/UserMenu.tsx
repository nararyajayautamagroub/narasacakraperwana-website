"use client";
import Link from "next/link";
import {signOut,useSession} from "next-auth/react";
import {messages,type Locale} from "@/lib/i18n";
export function UserMenu({locale="id"}:{locale?:Locale}){
  const {data:session,status}=useSession();
  const t=messages[locale]||messages.id;
  if(status==="loading")return <span className="nav-user-skeleton" aria-hidden="true"/>;
  if(!session)return <div className="account-actions"><Link className="btn btn-ghost btn-small" href="/login">{t.login}</Link><Link className="btn btn-primary btn-small" href="/register">{t.register}</Link></div>;
  return <div className="account-actions"><Link className="account-chip" href="/dashboard">{session.user.name||session.user.email}</Link><Link className="btn btn-primary btn-small" href="/settings">{t.settings}</Link><button className="btn btn-ghost btn-small" onClick={()=>signOut({callbackUrl:"/"})}>{t.logout}</button></div>;
}