export function normalizedEmail(value: string) { return value.trim().toLowerCase(); }
export function isAssignedOrder(record: {kind:string;assignedTo?:string}, staffId:string) {return record.kind==='orders' && record.assignedTo===staffId;}
export const statuses=['Recebido','Em diagnóstico','Aguardando aprovação','Em manutenção','Pronto para retirada','Entregue'] as const;
export function publicProduct(r:Record<string,any>){return {id:r.id,kind:'products',name:r.name,sku:r.sku,category:r.category,price:r.price,stock:r.stock,image:r.image,description:r.description,featured:r.featured,isDemo:r.isDemo};}
export function publicSettings(r:Record<string,any>={}){return {name:r.name||'Meltec Informática',phone:r.phone||'',address:r.address||'',hours:r.hours||'',logo:r.logo||'',instagram:'https://www.instagram.com/meltec.info/'};}

export function membership(email:string,adminEmail:string|undefined,rows:Array<{id:string;kind:string;email?:string;active?:boolean}>){
 const normalized=normalizedEmail(email);if(!normalized)return null;
 if(adminEmail&&normalized===normalizedEmail(adminEmail))return {role:'admin' as const,staffId:null};
 const staff=rows.find(r=>r.kind==='staff'&&r.email&&normalizedEmail(r.email)===normalized&&r.active!==false);
 return staff?{role:'staff' as const,staffId:staff.id}:null;
}

export function canStaffWriteProduct(current:{kind:string;createdBy?:string}|null|undefined,staffId:string){return !current||(current.kind==='products'&&current.createdBy===staffId);}
