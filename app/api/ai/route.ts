import {NextResponse} from "next/server";
import {z} from "zod";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const schema=z.object({prompt:z.string().trim().min(1).max(4000)});

export async function POST(request:Request){
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return NextResponse.json({error:"Fitur AI belum aktif. Administrator perlu mengatur OPENAI_API_KEY di environment deployment."},{status:503});
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Format permintaan tidak valid."},{status:400});}
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Prompt wajib diisi dan maksimal 4000 karakter."},{status:400});
  try{
    const upstream=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||"gpt-4.1-mini",
        instructions:"Kamu adalah asisten digital NARASA CAKRA PERWANA. Jawab dengan jelas, praktis, aman, dan gunakan bahasa yang dipakai pengguna. Jangan mengarang data operasional atau mengaku memiliki akses ke data internal yang tidak diberikan.",
        input:parsed.data.prompt,max_output_tokens:1200
      }),
      signal:AbortSignal.timeout(30000),cache:"no-store"
    });
    const data=await upstream.json();
    if(!upstream.ok)return NextResponse.json({error:"Layanan AI sedang tidak dapat memproses permintaan."},{status:502});
    const answer=typeof data.output_text==="string"?data.output_text:
      Array.isArray(data.output)?data.output.flatMap((item:{content?:Array<{type?:string;text?:string}>})=>item.content||[]).filter(part=>part.type==="output_text").map(part=>part.text||"").join("\n"):"";
    if(!answer.trim())return NextResponse.json({error:"AI tidak mengembalikan jawaban. Coba lagi."},{status:502});
    return NextResponse.json({answer,projectId:"NCRP-WEB-2026-0001",generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Koneksi ke layanan AI timeout atau gagal."},{status:504});}
}
