import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){
  let database="ok";
  try{await db.$queryRaw`SELECT 1`}catch{database="error"}
  const checks={
    database,
    nextAuth:Boolean(process.env.NEXTAUTH_SECRET),
    googleOAuth:Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET),
    github:process.env.GITHUB_TOKEN?"authenticated":"public-only",
    scraperSecret:Boolean(process.env.CRON_SECRET||process.env.SCRAPER_RUN_SECRET),
    scraperSources:Boolean(process.env.SCRAPER_SOURCES&&process.env.SCRAPER_SOURCES!=="[]")
  };
  const ok=database==="ok"&&checks.nextAuth;
  return NextResponse.json({status:ok?"ok":"degraded",timestamp:new Date().toISOString(),checks},{status:ok?200:503});
}