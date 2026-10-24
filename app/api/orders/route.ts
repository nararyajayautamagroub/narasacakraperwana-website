import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {db} from "@/lib/db";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const catalog={
  "virtual-passenger":{name:"Passenger Virtual ID",price:10000},
  "driver-registration":{name:"Driver Registration ID",price:15000},
  "community-membership":{name:"Community Membership",price:25000},
  "digital-service":{name:"Digital Service",price:30000}
} as const;\ntype ProductId=keyof typeof catalog;
const schema=z.object({
  name:z.string().trim().min(2).max(100),
  phone:z.string().trim().regex(/^[0-9+(). -]{8,20}$/),
  email:z.union([z.string().trim().email().max(150),z.literal("")]).optional(),
  items:z.array(z.object({id:z.enum(["virtual-passenger","driver-registration","community-membership","digital-service"]),quantity:z.number().int().min(1).max(10)})).min(1).max(20)
});

export async function POST(request:Request){
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Format data tidak valid."},{status:400});}
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Data checkout tidak valid. Periksa nama, nomor telepon, dan keranjang."},{status:400});
  const merged=new Map<ProductId,number>();
  for(const item of parsed.data.items)merged.set(item.id,Math.min(10,(merged.get(item.id)||0)+item.quantity));
  const items=Array.from(merged.entries()).map(([id,quantity])=>({id,name:catalog[id].name,unitPrice:catalog[id].price,quantity,lineTotal:catalog[id].price*quantity}));
  const total=items.reduce((sum,item)=>sum+item.lineTotal,0);
  const transactionId="NCRP-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+randomUUID().replaceAll("-","").slice(0,8).toUpperCase();
  const expiresAt=new Date(Date.now()+10*60*1000);
  try{
    const order=await db.order.create({data:{
      transactionId,customerName:parsed.data.name,customerPhone:parsed.data.phone,
      customerEmail:parsed.data.email||null,items,subtotal:total,total,
      paymentExpiresAt:expiresAt
    }});
    return NextResponse.json({transactionId:order.transactionId,status:order.status,total:order.total,items:order.items,paymentExpiresAt:order.paymentExpiresAt.toISOString(),createdAt:order.createdAt.toISOString(),projectId:"NCRP-WEB-2026-0001"},{status:201,headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"Penyimpanan pesanan belum siap. Administrator perlu menjalankan migrasi database."},{status:503});
  }
}
