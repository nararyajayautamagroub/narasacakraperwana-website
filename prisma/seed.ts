import {PrismaClient} from "../generated/prisma";

const db=new PrismaClient();

const divisions=[
  ["cermata-indah","CERMATA INDAH","Pariwisata","🚌","Divisi pariwisata virtual untuk perjalanan, tour, dan convoy.",["BUSSID","ETS2"]],
  ["lencara-trans","LENCARA TRANS","Pariwisata","🚌","Divisi pariwisata virtual dengan fokus operasional perjalanan dan event.",["BUSSID","ETS2"]],
  ["cermata-abadi","CERMATA ABADI","AKAP/AKDP & Bus Karyawan","🚌","Operasional AKAP, AKDP, dan bus karyawan.",["BUSSID","ETS2"]],
  ["nusamata-indah","NUSAMATA INDAH","AKAP/AKDP & Bus Karyawan","🚌","Divisi transportasi antarkota dan bus karyawan.",["BUSSID","ETS2"]],
  ["cermata-prima-airways","CERMATA PRIMA AIRWAYS","Pesawat","✈️","Operasi penerbangan virtual dan event aviasi.",["Real Flight Simulator","Microsoft Flight Simulator"]],
  ["cermata-utama-groub","CERMATA UTAMA GROUB","Kapal","🚢","Divisi maritim untuk voyage dan crew operation.",["Ship Simulator Extremes","Build and Rescue"]],
  ["cermata-cargo-groub","CERMATA CARGO GROUB","Expedisi","🚚","Divisi ekspedisi dan logistik virtual lintas simulator.",["ETS2","ATS","TOE3","TSI","BUSSID"]]
] as const;

async function main(){
  for(const [slug,name,category,icon,description,platforms] of divisions){
    await db.division.upsert({
      where:{slug},
      update:{name,category,icon,description,platforms:[...platforms]},
      create:{slug,name,category,icon,description,members:0,platforms:[...platforms]}
    });
  }
}

main().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{await db.$disconnect()});