import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title:"NARASA CAKRA PERWANA | Virtual Transportation Community",
  description:"Pusat informasi, recruitment, event, fleet, dan aktivitas virtual transportation NARASA CAKRA PERWANA.",
  metadataBase:new URL("https://narasacakraperwana.com"),
  openGraph:{title:"NARASA CAKRA PERWANA",description:"Virtual Transportation Community",type:"website"}
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="id"><body><Navbar/>{children}<Footer/></body></html>;
}