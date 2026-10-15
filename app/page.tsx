import Store from './store';
import {publicRecords} from './lib/data';
import {publicProduct,publicSettings} from './lib/permissions';
export const dynamic='force-dynamic';
export default async function Home(){const rows=await publicRecords();return <Store products={rows.filter(r=>r.kind==='products'&&r.published!==false).map(publicProduct)} settings={publicSettings(rows.find(r=>r.kind==='settings'))}/>;}
