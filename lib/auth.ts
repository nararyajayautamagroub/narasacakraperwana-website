import NextAuth,{type NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import {db} from "@/lib/db";

const googleConfigured=Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET);

export const authOptions:NextAuthOptions={
  secret:process.env.NEXTAUTH_SECRET,
  session:{strategy:"jwt",maxAge:60*60*24*30},
  pages:{signIn:"/login"},
  providers:[
    CredentialsProvider({
      name:"Email & Password",
      credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},
      async authorize(credentials){
        const email=String(credentials?.email||"").trim().toLowerCase();
        const password=String(credentials?.password||"");
        if(!email||!password)return null;
        const user=await db.user.findUnique({where:{email}});
        if(!user?.passwordHash)return null;
        const valid=await bcrypt.compare(password,user.passwordHash);
        if(!valid)return null;
        await db.user.update({where:{id:user.id},data:{lastLoginAt:new Date()}});
        return {id:user.id,name:user.name,email:user.email,image:user.image,role:user.role,locale:user.locale};
      }
    }),
    ...(googleConfigured?[GoogleProvider({
      clientId:process.env.GOOGLE_CLIENT_ID!,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET!
    })]:[])
  ],
  callbacks:{
    async signIn({user,account,profile}){
      if(account?.provider==="google"){
        const googleProfile=profile as {email?:string;email_verified?:boolean}|undefined;const googleEmail=googleProfile?.email||user.email;
        if(!googleEmail||googleProfile?.email_verified===false)return false;
        const email=googleEmail.trim().toLowerCase();
        const existing=await db.user.findUnique({where:{email}});
        if(existing){
          await db.user.update({where:{id:existing.id},data:{name:user.name||existing.name,image:user.image||existing.image,emailVerified:new Date(),lastLoginAt:new Date()}});
        }else{
          await db.user.create({data:{email,name:user.name,image:user.image,locale:"id",role:"USER",emailVerified:new Date(),lastLoginAt:new Date()}});
        }
      }
      return true;
    },
    async jwt({token,user,account}){
      if(account?.provider==="google"&&token.email){
        const dbUser=await db.user.findUnique({where:{email:String(token.email).toLowerCase()}});
        if(dbUser)token.uid=dbUser.id;
      }else if(user?.id){token.uid=user.id}
      if(token.uid){
        const dbUser=await db.user.findUnique({where:{id:String(token.uid)},select:{id:true,name:true,email:true,image:true,role:true,locale:true,passwordHash:true}});
        if(dbUser){token.uid=dbUser.id;token.name=dbUser.name;token.email=dbUser.email;token.picture=dbUser.image||undefined;token.role=dbUser.role;token.locale=dbUser.locale;token.hasPassword=Boolean(dbUser.passwordHash);}
      }
      return token;
    },
    async session({session,token}){
      if(session.user){
        session.user.id=String(token.uid||"");
        session.user.role=String(token.role||"USER");
        session.user.locale=String(token.locale||"id");
        session.user.hasPassword=Boolean(token.hasPassword);
      }
      return session;
    }
  }
};

export const authHandler=NextAuth(authOptions);