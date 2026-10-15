import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
function config(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw Error('Configuração do Supabase ausente.');return {url,key}}
export function publicClient(){const {url,key}=config();return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function serverClient(){const store=await cookies();const {url,key}=config();return createServerClient(url,key,{cookies:{getAll(){return store.getAll()},setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options))}catch{}}}})}
