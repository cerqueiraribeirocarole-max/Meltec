import {NextResponse} from 'next/server';
import {serverClient} from '../../../lib/supabase';
export async function GET(req:Request){const url=new URL(req.url);const code=url.searchParams.get('code');if(code){const s=await serverClient();const {error}=await s.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/funcionario',url))}return NextResponse.redirect(new URL('/login?error=confirmation',url))}
