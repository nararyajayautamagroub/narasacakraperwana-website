export type Division={slug:string,name:string,category:string,icon:string,platforms:string[],description:string,members:number};
export const divisions:Division[]=[
{slug:"cermata-indah",name:"CERMATA INDAH",category:"Pariwisata",icon:"🚌",platforms:["BUSSID","ETS2"],description:"Divisi pariwisata virtual untuk perjalanan, tour, dan convoy.",members:18},
{slug:"lencara-trans",name:"LENCARA TRANS",category:"Pariwisata",icon:"🚌",platforms:["BUSSID","ETS2"],description:"Divisi pariwisata virtual dengan fokus operasional perjalanan dan event.",members:14},
{slug:"cermata-abadi",name:"CERMATA ABADI",category:"AKAP/AKDP & Bus Karyawan",icon:"🚌",platforms:["BUSSID","ETS2"],description:"Operasional AKAP, AKDP, dan bus karyawan dalam ekosistem virtual.",members:21},
{slug:"nusamata-indah",name:"NUSAMATA INDAH",category:"AKAP/AKDP & Bus Karyawan",icon:"🚌",platforms:["BUSSID","ETS2"],description:"Divisi transportasi antarkota dan bus karyawan.",members:16},
{slug:"cermata-prima-airways",name:"CERMATA PRIMA AIRWAYS",category:"Pesawat",icon:"✈️",platforms:["Real Flight Simulator","Microsoft Flight Simulator"],description:"Operasi penerbangan virtual, flight planning, dan event aviasi.",members:11},
{slug:"cermata-utama-groub",name:"CERMATA UTAMA GROUB",category:"Kapal",icon:"🚢",platforms:["Ship Simulator Extremes","Build and Rescue"],description:"Divisi maritim untuk voyage, crew operation, dan kegiatan kapal virtual.",members:9},
{slug:"cermata-cargo-groub",name:"CERMATA CARGO GROUB",category:"Expedisi",icon:"🚚",platforms:["ETS2","ATS","TOE3","TSI","BUSSID"],description:"Divisi ekspedisi dan logistik virtual lintas simulator.",members:24}
];
export const recruitment=divisions.flatMap(d=>d.platforms.map(platform=>({division:d.name,platform,status:"OPEN",slug:d.slug})));
export const simulators=["BUSSID","ETS2","ATS","TOE3","TSI","Real Flight Simulator","Microsoft Flight Simulator","Ship Simulator Extremes","Build and Rescue"];