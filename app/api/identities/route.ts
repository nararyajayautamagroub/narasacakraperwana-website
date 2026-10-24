import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {db} from "@/lib/db";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const schema=z.object({type:z.enum(["driver","passenger"]),name:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^[0-9+(). -]{8,20}$/),email:z.union([z.string().trim().email().max(150),z.literal("")]).optional(),simulator:z.string().trim().max(40).optional(),licenseType:z.string().trim().max(40).optional()});

export async function POST(request:Request){
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:"Format data tidak valid."},{status:400})}
 const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Data tidak valid. Periksa nama, nomor telepon, dan jenis ID."},{status:400});
 const data=parsed.data;const suffix=randomUUID().replaceAll("-","").slice(0,8).toUpperCase();const year=new Date().getUTCFullYear();
 try{
  if(data.type==="driver"){
   const record=await db.driverProfile.create({data:{driverId:"NCRP-DRV-"+year+"-"+suffix,fullName:data.name,phone:data.phone,licenseType:data.licenseType||"VIRTUAL",simulator:data.simulator||"BUSSID",status:"PENDING"}});
   return NextResponse.json({id:record.id,publicId:record.driverId,type:"driver",name:record.fullName,status:record.status,createdAt:record.createdAt.toISOString()},{status:201,headers:{"Cache-Control":"no-store"}});
  }
  const record=await db.passengerProfile.create({data:{passengerId:"NCRP-PSG-"+year+"-"+suffix,fullName:data.name,phone:data.phone,email:data.email||null}});
  return NextResponse.json({id:record.id,publicId:record.passengerId,type:"passenger",name:record.fullName,status:record.status,createdAt:record.createdAt.toISOString()},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Database belum siap. Administrator perlu menjalankan migrasi Prisma."},{status:503})}
}
