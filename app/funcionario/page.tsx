import Employee from './employee';
import {actor} from '../lib/data';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Staff(){await requireChatGPTUser('/funcionario');const a=await actor();if(!a)return <div className="access-screen"><h1>Seu acesso ainda não está liberado.</h1><p>Peça ao administrador para cadastrar o mesmo e-mail usado no seu login.</p><a className="primary" href="/">Voltar à loja</a></div>;return <Employee name={a.staff?.name||a.user.displayName} admin={a.role==='admin'} staffId={a.staff?.id||''}/>;}
