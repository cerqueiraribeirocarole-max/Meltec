import Panel from '../panel';
import {actor} from '../lib/data';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Admin(){await requireChatGPTUser('/admin');const a=await actor();if(a?.role!=='admin')return <div className="access-screen"><h1>Acesso restrito</h1><p>Esta área é exclusiva do administrador da Meltec.</p><a className="primary" href="/funcionario">Ir para a área do funcionário</a></div>;return <Panel/>;}
