import {publicRecords} from '../../lib/data';
import {publicProduct,publicSettings} from '../../lib/permissions';
export async function GET(){const rows=await publicRecords();return Response.json({products:rows.filter(r=>r.kind==='products'&&r.published!==false).map(publicProduct),settings:publicSettings(rows.find(r=>r.kind==='settings'))},{headers:{'Cache-Control':'no-store'}});}
