import type {Metadata} from "next";
import {cookies} from "next/headers";
import "./globals.css";
import {Navbar} from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import Providers from "@/app/providers";
import {locales,type Locale} from "@/lib/i18n";

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://narasacakraperwana.com";

export const metadata:Metadata={
  title:{default:"NARASA CAKRA PERWANA | Virtual Transportation Community",template:"%s | NARASA CAKRA PERWANA"},
  description:"Pusat informasi, recruitment, event, fleet, berita, galeri, akun, dan aktivitas virtual transportation NARASA CAKRA PERWANA.",
  metadataBase:new URL(siteUrl),
  openGraph:{title:"NARASA CAKRA PERWANA",description:"Virtual Transportation Community",type:"website",url:siteUrl},
  robots:{index:true,follow:true}
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const value=(await cookies()).get("ncrp_locale")?.value as Locale|undefined;
  const locale=locales.some(x=>x.code===value)?value!:"id";
  return <html lang={locale} dir={locale==="ar"?"rtl":"ltr"}><body><Providers><Navbar/>{children}<Footer/></Providers></body></html>;
}