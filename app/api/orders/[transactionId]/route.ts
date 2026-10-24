import {NextResponse} from "next/server";
import {db} from "@/lib/db";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(_request:Request,{params}:{params:Promise<{transactionId:string}>}){
  const {transactionId}=await params;
  if(!/^NCRP-[0-9]{8}-[A-F0-9]{8}$/.test(transactionId))return NextResponse.json({error:"ID transaksi tidak valid."},{status:400});
  try{
    const order=await db.order.findUnique({where:{transactionId}});
    if(!order)return NextResponse.json({error:"Transaksi tidak ditemukan."},{status:404});
    let status=order.status;
    if(status==="PENDING"&&order.paymentExpiresAt.getTime()<=Date.now()){
      const updated=await db.order.updateMany({where:{id:order.id,status:"PENDING",paymentExpiresAt:{lte:new Date()}},data:{status:"EXPIRED"}});
      if(updated.count)status="EXPIRED";
    }
    return NextResponse.json({transactionId:order.transactionId,status,total:order.total,items:order.items,paymentExpiresAt:order.paymentExpiresAt.toISOString(),createdAt:order.createdAt.toISOString(),paidAt:order.paidAt?.toISOString()||null},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Tidak dapat memuat status transaksi."},{status:503});}
}
