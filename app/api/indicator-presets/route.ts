import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db} from '../../../lib/db';
export const runtime='nodejs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function failure(e:unknown){if(typeof e==='object'&&e!==null&&'code' in e){if(e.code==='42P01')return NextResponse.json({error:'Primero ejecutá QUANTUM_V15_2_INDICATOR_PRESETS.sql en Neon',migration_required:true},{status:503});if(e.code==='23505')return NextResponse.json({error:'Ya existe un indicador con ese nombre o con esos parámetros'},{status:409});}console.error('Indicator presets',e);return NextResponse.json({error:'No se pudo acceder a la biblioteca de indicadores'},{status:500})}
const originOk=(req:NextRequest)=>!req.headers.get('origin')||req.headers.get('origin')===req.nextUrl.origin;
export async function GET(){try{const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});const r=await db().query('SELECT id,name,kind,code,params,updated_at FROM indicator_presets WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100',[user.id]);return NextResponse.json({items:r.rows})}catch(e){return failure(e)}}
export async function POST(req:NextRequest){try{
 if(!originOk(req))return NextResponse.json({error:'Origen inválido'},{status:403});
 const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});
 const data=await req.json();const name=typeof data.name==='string'?data.name.trim():'';const kind=typeof data.kind==='string'?data.kind.toUpperCase():'';
 if(name.length<2||name.length>75||!['MACD','EMA','SMA','RSI'].includes(kind))return NextResponse.json({error:'Ingresá nombre (2 a 75 caracteres) y tipo válido'},{status:400});
 let params:Record<string,number>;let code:string;
 if(kind==='MACD'){
  const [fast,slow,signal]=[Number(data.fast),Number(data.slow),Number(data.signal)];
  if(![fast,slow,signal].every(v=>Number.isInteger(v)&&v>=2&&v<=500)||fast>=slow)return NextResponse.json({error:'MACD: fast < slow y períodos entre 2 y 500'},{status:400});
  params={fast,slow,signal};code=`MACD_${fast}_${slow}_${signal}`;
 }else{
  const period=Number(data.period);
  if(!Number.isInteger(period)||period<2||period>500)return NextResponse.json({error:'Período entre 2 y 500'},{status:400});
  params={period};code=`${kind}${period}`;
 }
 const result=await db().query('INSERT INTO indicator_presets(user_id,name,kind,code,params) VALUES($1,$2,$3,$4,$5) RETURNING id,name,kind,code,params,updated_at',[user.id,name,kind,code,JSON.stringify(params)]);
 return NextResponse.json({item:result.rows[0]}, {status:201});
 }catch(e){return failure(e)}}
export async function DELETE(req:NextRequest){try{if(!originOk(req))return NextResponse.json({error:'Origen inválido'},{status:403});const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});const id=req.nextUrl.searchParams.get('id');if(!id||!uuid.test(id))return NextResponse.json({error:'ID inválido'},{status:400});await db().query('DELETE FROM indicator_presets WHERE id=$1 AND user_id=$2',[id,user.id]);return NextResponse.json({ok:true})}catch(e){return failure(e)}}
