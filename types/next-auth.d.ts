import "next-auth"; import "next-auth/jwt";
declare module "next-auth" {
  interface Session {
    user:{id:string;name?:string|null;email?:string|null;image?:string|null;role:string;locale:string;hasPassword:boolean}
  }
  interface User {role?:string;locale?:string;hasPassword?:boolean}
}
declare module "next-auth/jwt" {
  interface JWT {uid?:string;role?:string;locale?:string}
}