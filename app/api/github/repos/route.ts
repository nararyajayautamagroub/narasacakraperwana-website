import {NextResponse} from "next/server"; import {getOwnedRepositories} from "@/lib/github";

export async function GET(request:Request){
  const {searchParams}=new URL(request.url);
  const includePrivate=searchParams.get("includePrivate")==="true";
  if(includePrivate){
    const expected=process.env.GITHUB_SYNC_KEY;
    const supplied=request.headers.get("x-github-sync-key");
    if(!expected||supplied!==expected)return NextResponse.json({error:"Akses sinkronisasi privat ditolak."},{status:401});
    if(!process.env.GITHUB_TOKEN)return NextResponse.json({error:"GITHUB_TOKEN belum dikonfigurasi."},{status:503});
  }
  const repos=await getOwnedRepositories(includePrivate);
  return NextResponse.json({owner:process.env.GITHUB_OWNER||"nararyajayautamagroub",count:repos.length,repositories:repos,generatedAt:new Date().toISOString(),scope:includePrivate?"all-owned":"public-only"},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}