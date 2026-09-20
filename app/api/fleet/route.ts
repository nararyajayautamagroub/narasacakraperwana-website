import {NextResponse} from "next/server";
import {FleetStatus} from "@/generated/prisma";
import {db} from "@/lib/db";

export async function GET(request:Request){
  const q=new URL(request.url).searchParams;
  const division=q.get("division")||undefined;
  const rawStatus=q.get("status")||undefined;
  const status=rawStatus&&Object.values(FleetStatus).includes(rawStatus as FleetStatus)?rawStatus as FleetStatus:undefined;
  const fleet=await db.fleet.findMany({
    where:{division:division?{slug:division}:undefined,status},
    include:{division:true},
    orderBy:{code:"asc"}
  });
  return NextResponse.json({fleet});
}