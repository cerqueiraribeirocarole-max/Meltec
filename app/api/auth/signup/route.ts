import {NextResponse} from 'next/server';
import {serverClient} from '../../../lib/supabase';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});
 const f=await req.formData();const customer=f.get('accountType')==='customer';const destination=customer?'/cadastro':'/login';
 const fail=(code:string)=>NextResponse.redirect(new URL(destination+'?error='+code,req.url),303);
 const email=String(f.get('email')||'').trim(),password=String(f.get('password')||'');
 if(password.length<12||password.length>128)return fail('password');
 const name=String(f.get('name')||'').trim(),phone=String(f.get('phone')||'').trim();
 if(customer&&password!==String(f.get('confirmPassword')||''))return fail('match');
 if(customer&&(name.length<2||name.length>100||phone.length>25||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15))return fail('profile');
 const s=await serverClient();const {data,error}=await s.auth.signUp({email,password,options:{emailRedirectTo:new URL('/api/auth/confirm',req.url).toString(),...(customer?{data:{name,phone}}:{})}});
 if(error)return fail('signup');
 return NextResponse.redirect(new URL(data.session?'/conta':'/login?message=check-email&next=%2Fconta',req.url),303);
}
