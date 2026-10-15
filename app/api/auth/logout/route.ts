import {NextResponse} from 'next/server';
import {serverClient} from '../../../lib/supabase';
export async function POST(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});const s=await serverClient();await s.auth.signOut();return NextResponse.redirect(new URL('/',req.url),303)}
