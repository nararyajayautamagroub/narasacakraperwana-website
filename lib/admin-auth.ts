import {jwtVerify,SignJWT} from "jose"; import {cookies} from "next/headers"; import {redirect} from "next/navigation";
const COOKIE="ncrp_admin_session";
function secret(){const value=process.env.ADMIN_SECRET;if(!value)throw new Error("ADMIN_SECRET belum dikonfigurasi.");return new TextEncoder().encode(value);}
export async function createAdminSession(){return new SignJWT({role:"admin"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("12h").sign(secret());}
export async function isAdminAuthenticated(){const token=(await cookies()).get(COOKIE)?.value;if(!token)return false;try{await jwtVerify(token,secret());return true}catch{return false}}
export async function requireAdmin(){if(!await isAdminAuthenticated())redirect("/admin/login");}
export const adminCookieName=COOKIE;