import {NextResponse} from "next/server"; import {runScraper} from "@/lib/scraper";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const expected=process.env.CRON_SECRET||process.env.SCRAPER_RUN_SECRET;
  if(!expected)return NextResponse.json({error:"CRON_SECRET atau SCRAPER_RUN_SECRET belum dikonfigurasi."},{status:503});
  const auth=request.headers.get("authorization");
  if(auth!==`Bearer ${expected}`)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{const result=await runScraper();return NextResponse.json({ok:true,...result})}
  catch(error){return NextResponse.json({ok:false,error:error instanceof Error?error.message:"Scraper gagal."},{status:500})}
}