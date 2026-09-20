import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";

const schema=z.object({
  name:z.string().trim().min(2).max(80).optional(),
  locale:z.enum(["id","en","ms","zh","ja","ko","ar","es","fr","de"]).optional(),
  currentPassword:z.string().optional(),
  newPassword:z.string().min(8).max(72).optional()
});

async function currentUser(){
  const session=await getServerSession(authOptions);
  if(!session?.user?.id)return null;
  return db.user.findUnique({where:{id:session.user.id}});
}

export async function GET(){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  return NextResponse.json({user:{id:user.id,name:user.name,email:user.email,image:user.image,locale:user.locale,role:user.role,hasPassword:Boolean(user.passwordHash)}});
}

export async function PATCH(request:Request){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const p=schema.parse(await request.json());
    if(p.newPassword&&user.passwordHash){
      if(!p.currentPassword||!await bcrypt.compare(p.currentPassword,user.passwordHash)){
        return NextResponse.json({error:"Password saat ini salah."},{status:400});
      }
    }
    const data:{name?:string;locale?:string;passwordHash?:string}={};
    if(p.name!==undefined)data.name=p.name;
    if(p.locale!==undefined)data.locale=p.locale;
    if(p.newPassword){if(bcrypt.truncates(p.newPassword))return NextResponse.json({error:"Password terlalu panjang dalam format byte yang didukung."},{status:400});data.passwordHash=await bcrypt.hash(p.newPassword,12);}
    const updated=await db.user.update({where:{id:user.id},data,select:{id:true,name:true,email:true,image:true,locale:true,role:true}});
    const response=NextResponse.json({ok:true,user:updated});
    if(p.locale)response.cookies.set({name:"ncrp_locale",value:p.locale,httpOnly:false,sameSite:"lax",path:"/",maxAge:31536000});
    return response;
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Settings tidak valid."},{status:400});
  }
}