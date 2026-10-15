import {getChatGPTUser} from '../chatgpt-auth';
import {serverClient,publicClient} from './supabase';
import {membership} from './permissions';
export type ShopRecord={id:string;kind:string;name:string;[key:string]:any};
export async function allRecords():Promise<ShopRecord[]>{const db=await serverClient();const {data,error}=await db.from('meltec_records').select('*').order('created_at');if(error)throw Error('Não foi possível consultar os cadastros.');const {data:costs}=await db.from('meltec_product_costs').select('*');const map=new Map((costs||[]).map(r=>[r.product_id,r.cost]));return (data||[]).map(r=>({...r.data,id:r.id,kind:r.kind,...(map.has(r.id)?{cost:Number(map.get(r.id))}:{})}));}
export async function publicRecords():Promise<ShopRecord[]>{const db=publicClient();const {data,error}=await db.from('meltec_records').select('id,kind,data').in('kind',['products','settings']);if(error)throw Error('Não foi possível carregar a loja.');return (data||[]).map(r=>({...r.data,id:r.id,kind:r.kind}));}
export async function actor(){
 const user=await getChatGPTUser();
 if(!user)return null;
 const db=await serverClient();
 const {data:isAdmin,error}=await db.rpc('meltec_is_admin');
 if(error)throw Error('Não foi possível verificar sua permissão. Tente novamente.');
 if(isAdmin===true)return {role:'admin' as const,user,staff:null};
 const all=await allRecords();
 const found=membership(user.email,undefined,all);
 if(!found||found.role!=='staff')return null;
 return {role:'staff' as const,user,staff:all.find(r=>r.id===found.staffId)!};
}
