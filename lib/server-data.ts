import {db} from "@/lib/db"; import {divisions as fallbackDivisions} from "@/lib/data";

export async function getLiveDivisions(){
  try{const rows=await db.division.findMany({orderBy:{name:"asc"}});return rows.length?rows:fallbackDivisions.map(d=>({...d,id:d.slug}));}
  catch{return fallbackDivisions.map(d=>({...d,id:d.slug}));}
}
export async function getLiveEvents(){
  try{return await db.event.findMany({include:{division:true},orderBy:{startsAt:"asc"}})}
  catch{return [];}
}
export async function getLiveFleet(){
  try{return await db.fleet.findMany({include:{division:true},orderBy:{code:"asc"}})}
  catch{return [];}
}