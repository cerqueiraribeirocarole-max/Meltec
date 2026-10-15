import {serverClient} from '../../lib/supabase';
import {actor,allRecords} from '../../lib/data';
import {canStaffWriteProduct,isAssignedOrder,publicProduct,publicSettings,statuses,normalizedEmail} from '../../lib/permissions';
import {z} from 'zod';
const optional=z.string().max(3000).optional().default('');
const image=z.string().max(2000).refine(s=>!s||s.startsWith('/media/')||s.startsWith('/images/')||/^https:\/\//.test(s),'Use uma imagem enviada ou uma URL HTTPS.').optional().default('');
const nonnegative=z.coerce.number().finite().min(0).max(100000000).default(0);
const validators:Record<string,z.ZodTypeAny>={
 products:z.object({name:z.string().trim().min(1).max(200),sku:optional,category:optional,price:nonnegative,cost:nonnegative,stock:nonnegative.refine(Number.isInteger,'Estoque deve ser inteiro'),image,description:optional,published:z.boolean().default(true),featured:z.boolean().default(false),isDemo:z.boolean().default(false)}),
 staff:z.object({name:z.string().trim().min(1).max(200),email:z.string().email().transform(normalizedEmail),phone:optional,role:optional,active:z.boolean().default(true)}),
 clients:z.object({name:z.string().trim().min(1).max(200),phone:optional,email:z.union([z.string().email(),z.literal('')]).default('')}),
 orders:z.object({name:z.string().trim().min(1).max(200),device:z.string().trim().min(1).max(300),phone:optional,issue:optional,status:z.enum(statuses).default('Recebido'),value:nonnegative,notes:optional,assignedTo:optional}),
 groups:z.object({name:z.string().trim().min(1).max(200),url:z.string().regex(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+(?:\?[^\s]*)?$/,'Link de convite inválido'),description:optional}),
 settings:z.object({name:z.string().trim().min(1).max(200),phone:z.string().max(30).refine(s=>!s||/^\+?\d[\d\s()-]{9,25}$/.test(s),'Informe país e DDD'),address:optional,hours:optional,logo:image})};
export async function GET(){const a=await actor();if(!a)return json({error:'Acesso não autorizado'},{status:403});const rows=await allRecords();return json(a.role==='admin'?rows:rows.flatMap(r=>isAssignedOrder(r,a.staff!.id)?[r]:r.kind==='products'?[{...publicProduct(r),createdBy:r.createdBy,published:r.published}]:r.kind==='settings'?[{...publicSettings(r),kind:'settings',id:r.id}]:[]));}
export async function POST(req:Request){const a=await actor();if(!a)return json({error:'Acesso não autorizado'},{status:403});try{const b:any=await req.json();if(!b||JSON.stringify(b).length>50000)throw Error('Cadastro inválido');const current=b.id?(await allRecords()).find(r=>r.id===b.id):null;if(b.id&&!current)return json({error:'Cadastro não encontrado'},{status:404});let data:any;let kind=b.kind;
if(a.role==='staff'){
 if(kind==='products'){
  if(!canStaffWriteProduct(current,a.staff!.id))return json({error:'Você só pode editar produtos cadastrados por você.'},{status:403});
  const parsed=validators.products.parse({...b,cost:current?.cost||0,isDemo:current?.isDemo||false});
  data={...parsed,createdBy:a.staff!.id};
 }else{
  if(!current||!isAssignedOrder(current,a.staff!.id))return json({error:'Você só pode atualizar seus atendimentos ou cadastrar produtos.'},{status:403});
  const patch=z.object({status:z.enum(statuses),notes:z.string().max(3000)}).parse(b);data={...current,...patch};kind='orders';
 }
}else{if(!validators[kind])throw Error('Tipo inválido');if(current&&current.kind!==kind)throw Error('Tipo inválido');data={...validators[kind].parse(b),...(current?.createdBy?{createdBy:current.createdBy}:{})};const all=await allRecords();if(kind==='settings'&&!b.id&&all.some(r=>r.kind==='settings'))throw Error('Edite a configuração existente.');if(kind==='staff'&&all.some(r=>r.kind==='staff'&&r.id!==b.id&&r.email===data.email))throw Error('Esse e-mail já está cadastrado.');if(kind==='orders'&&data.assignedTo&&!all.some(r=>r.kind==='staff'&&r.id===data.assignedTo&&r.active!==false))throw Error('Selecione um funcionário ativo.');}
const id=b.id||crypto.randomUUID();data={...data,kind,id,createdAt:current?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const db=await serverClient();const {cost,...payload}=data;const {id:ignoredId,kind:ignoredKind,...clean}=payload;const result=current?await db.from('meltec_records').update({data:clean}).eq('id',id).select('id').single():await db.from('meltec_records').insert({id,kind,data:clean,created_by:a.user.userId}).select('id').single();if(result.error)throw Error('Não foi possível salvar este cadastro.');if(kind==='products'&&a.role==='admin'){const c=await db.from('meltec_product_costs').upsert({product_id:id,cost:Number(cost||0)});if(c.error)throw Error('Cadastro salvo, mas o custo não foi atualizado.');}return json({ok:true,id});}catch(e:any){return json({error:e instanceof z.ZodError?e.issues[0].message:e.message||'Confira os campos.'},{status:400});}}
export async function DELETE(req:Request){const a=await actor();if(a?.role!=='admin')return json({error:'Apenas o administrador pode excluir cadastros.'},{status:403});try{const b:any=await req.json();if(typeof b.id!=='string')throw Error();const all=await allRecords();if(all.some(r=>r.kind==='orders'&&r.assignedTo===b.id))return json({error:'Reatribua as ordens deste funcionário antes de excluí-lo.'},{status:400});const db=await serverClient();const {error}=await db.from('meltec_records').delete().eq('id',b.id);if(error)throw error;return json({ok:true});}catch{return json({error:'Solicitação inválida'},{status:400});}}

function json(body:unknown,init:ResponseInit={}){return Response.json(body,{...init,headers:{'Cache-Control':'private, no-store'}});}
