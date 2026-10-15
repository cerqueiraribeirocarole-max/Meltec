import {NextResponse} from 'next/server';
import {serverClient} from '../../../lib/supabase';
import {safePath} from '../../../chatgpt-auth';
export async function POST(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});const f=await req.formData();const email=String(f.get('email')||'').trim(),password=String(f.get('password')||''),next=safePath(String(f.get('next')||'/funcionario'));const s=await serverClient();const {error}=await s.auth.signInWithPassword({email,password});if(error)return NextResponse.redirect(new URL('/login?error=invalid&next='+encodeURIComponent(next),req.url),303);return NextResponse.redirect(new URL(next,req.url),303)}
