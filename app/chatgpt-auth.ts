import {redirect} from 'next/navigation';
import {serverClient} from './lib/supabase';
export async function getChatGPTUser(){const s=await serverClient();const {data:{user},error}=await s.auth.getUser();if(error||!user||!user.email)return null;return {userId:user.id,email:user.email,displayName:user.user_metadata?.name||user.email,fullName:user.user_metadata?.name||null};}
export async function requireChatGPTUser(path:string){const user=await getChatGPTUser();if(!user)redirect('/login?next='+encodeURIComponent(safePath(path)));return user}
export function safePath(value:string){return value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')?value:'/funcionario'}
