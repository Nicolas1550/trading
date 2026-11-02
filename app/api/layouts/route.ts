import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db,transaction} from '../../../lib/db';
import {INDICATORS,validIndicator} from '../../../lib/indicators';
import {ranges} from '../../../lib/market';
import {safeSymbol} from '../../../lib/market-feed';
export const runtime='nodejs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');return !origin||origin===req.nextUrl.origin}
function error(err:unknown){console.error('Layouts API',err);return NextResponse.json({error:'No se pudo consultar Neon'},{status:500})}
export async function GET(req:NextRequest){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión para ver tus espacios'},{status:401});
  const listing=await db().query('SELECT id,name,is_default,updated_at,created_at FROM chart_layouts WHERE user_id=$1 ORDER BY is_default DESC,updated_at DESC LIMIT 50',[user.id]);
  const requested=req.nextUrl.searchParams.get('id');
  if(requested&&!uuid.test(requested))return NextResponse.json({error:'ID de espacio inválido'},{status:400});
  const chosen=requested?listing.rows.find(r=>r.id===requested):listing.rows[0];
  if(requested&&!chosen)return NextResponse.json({error:'Espacio no encontrado'},{status:404});
  if(!chosen)return NextResponse.json({layouts:[],layout:null,drawings:[],indicators:[]});
  const [layout,ind,draw]=await Promise.all([
   db().query('SELECT id,name,settings,is_default,updated_at FROM chart_layouts WHERE id=$1 AND user_id=$2',[chosen.id,user.id]),
   db().query('SELECT d.code,ui.params,ui.visible,ui.sort_order FROM user_indicators ui JOIN indicator_definitions d ON d.id=ui.indicator_id WHERE ui.layout_id=$1 AND ui.user_id=$2 ORDER BY ui.sort_order',[chosen.id,user.id]),
   db().query('SELECT id,drawing_type,points,style FROM chart_drawings WHERE layout_id=$1 AND user_id=$2 ORDER BY created_at LIMIT 150',[chosen.id,user.id])
  ]);
  return NextResponse.json({layouts:listing.rows,layout:layout.rows[0]??null,indicators:ind.rows,drawings:draw.rows.map((r:{id:string;drawing_type:string;points:unknown;style?:{panel?:number}})=>({id:r.id,kind:r.drawing_type,points:r.points,panel:Number(r.style?.panel)||0}))});
 }catch(e){return error(e)}
}
export async function POST(req:NextRequest){
 try{
  if(!sameOrigin(req))return NextResponse.json({error:'Origen inválido'},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});
  const body=await req.json();const s=body?.settings;
  if(!s||!Array.isArray(s.panels)||s.panels.length<1||s.panels.length>3||![1,2,3].includes(s.count)||!ranges.includes(s.range)||!['candle','line'].includes(s.chartMode))return NextResponse.json({error:'Configuración de espacio inválida'},{status:400});
  for(const p of s.panels){if(typeof p?.symbol!=='string'||!safeSymbol(p.symbol)||!Array.isArray(p.indicators)||p.indicators.length>20||!p.indicators.every((c:unknown)=>typeof c==='string'&&validIndicator(c)))return NextResponse.json({error:'Indicadores o activos inválidos'},{status:400});}
  const drawings=Array.isArray(body.drawings)?body.drawings.slice(0,100):[];
  if(!drawings.every((d:{kind?:string;points?:unknown;panel?:number})=>['horizontal','trend'].includes(d.kind??'')&&[0,1,2].includes(d.panel??-1)&&Array.isArray(d.points)&&d.points.length<=2&&d.points.every((p:unknown)=>typeof p==='object'&&p!==null&&Number.isFinite((p as {time:number}).time)&&Number.isFinite((p as {price:number}).price))))return NextResponse.json({error:'Dibujos inválidos'},{status:400});
  const name=typeof body.name==='string'?body.name.trim():'';
  if(name.length>75)return NextResponse.json({error:'El nombre es demasiado largo'},{status:400});
  const layoutId:unknown=body.layoutId;
  if(layoutId!==undefined&&layoutId!==null&&(!uuid.test(String(layoutId))))return NextResponse.json({error:'ID de espacio inválido'},{status:400});
  const clean={count:s.count,range:s.range,chartMode:s.chartMode,panels:s.panels.map((p:{symbol:string;indicators:string[]})=>({symbol:p.symbol,indicators:p.indicators})),chartHeight:Math.min(860,Math.max(380,Number(s.chartHeight)||540)),sideTab:typeof s.sideTab==='string'?s.sideTab:'trade'};
  const saved=await transaction(async client=>{
   await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
   let id:string;let actualName=name;
   if(body.createNew===true){
    if(!name)return null;
    const count=await client.query('SELECT count(*)::int AS total FROM chart_layouts WHERE user_id=$1',[user.id]);
    if(count.rows[0].total>=50)throw Error('LIMIT_50');
    await client.query('UPDATE chart_layouts SET is_default=false WHERE user_id=$1 AND is_default=true',[user.id]);const created=await client.query('INSERT INTO chart_layouts(user_id,name,settings,is_default) VALUES($1,$2,$3,true) RETURNING id',[user.id,name,JSON.stringify(clean)]);id=created.rows[0].id;
   }else if(layoutId){
    const previous=await client.query('SELECT name FROM chart_layouts WHERE id=$1 AND user_id=$2 FOR UPDATE',[layoutId,user.id]);
    if(!previous.rowCount)return null;
    actualName=name||previous.rows[0].name;
    await client.query('UPDATE chart_layouts SET name=$1,settings=$2,updated_at=now() WHERE id=$3 AND user_id=$4',[actualName,JSON.stringify(clean),layoutId,user.id]);await client.query('UPDATE chart_layouts SET is_default=false WHERE user_id=$1 AND is_default=true',[user.id]);await client.query('UPDATE chart_layouts SET is_default=true WHERE id=$1 AND user_id=$2',[layoutId,user.id]);id=String(layoutId);
   }else{
    const previous=await client.query('SELECT id,name FROM chart_layouts WHERE user_id=$1 ORDER BY is_default DESC,updated_at DESC LIMIT 1 FOR UPDATE',[user.id]);
    if(previous.rowCount){id=previous.rows[0].id;actualName=name||previous.rows[0].name;await client.query('UPDATE chart_layouts SET name=$1,settings=$2,updated_at=now() WHERE id=$3 AND user_id=$4',[actualName,JSON.stringify(clean),id,user.id]);}
    else{actualName=name||'Mi primer espacio';const created=await client.query('INSERT INTO chart_layouts(user_id,name,settings,is_default) VALUES($1,$2,$3,true) RETURNING id',[user.id,actualName,JSON.stringify(clean)]);id=created.rows[0].id;}
   }
   await client.query('DELETE FROM user_indicators WHERE layout_id=$1 AND user_id=$2',[id,user.id]);
   let index=0;
   for(const code of [...new Set<string>(clean.panels.flatMap((p:{symbol:string;indicators:string[]})=>p.indicators))]){
    const d=INDICATORS.find(d=>d.code===code)??{code,name:code,category:'Personalizados',overlay:!code.startsWith('RSI')&&!code.startsWith('MACD'),description:'Parámetros personalizados',supported:true};
    const ins=await client.query('INSERT INTO indicator_definitions(code,name,category,description,overlay,supported) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(code) DO UPDATE SET supported=true RETURNING id',[d.code,d.name,d.category,d.description,d.overlay]);
    await client.query('INSERT INTO user_indicators(user_id,layout_id,indicator_id,params,sort_order) VALUES($1,$2,$3,$4,$5)',[user.id,id,ins.rows[0].id,JSON.stringify({}),index++]);
   }
   await client.query('DELETE FROM chart_drawings WHERE layout_id=$1 AND user_id=$2',[id,user.id]);
   for(const d of drawings)await client.query('INSERT INTO chart_drawings(user_id,layout_id,drawing_type,points,style) VALUES($1,$2,$3,$4,$5)',[user.id,id,d.kind,JSON.stringify(d.points),JSON.stringify({panel:d.panel})]);
   return {id,name:actualName};
  });
  if(!saved)return NextResponse.json({error:'Espacio no encontrado o nombre vacío'},{status:404});
  return NextResponse.json({ok:true,...saved});
 }catch(e){if(e instanceof Error&&e.message==='LIMIT_50')return NextResponse.json({error:'Máximo de 50 espacios por cuenta'},{status:400});return error(e)}
}
export async function DELETE(req:NextRequest){
 try{
  if(!sameOrigin(req))return NextResponse.json({error:'Origen inválido'},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});
  const id=req.nextUrl.searchParams.get('id');if(!id||!uuid.test(id))return NextResponse.json({error:'ID inválido'},{status:400});
  await transaction(async client=>{await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);const res=await client.query('DELETE FROM chart_layouts WHERE id=$1 AND user_id=$2 RETURNING is_default',[id,user.id]);if(!res.rowCount)return; if(res.rows[0].is_default)await client.query('UPDATE chart_layouts SET is_default=true WHERE id=(SELECT id FROM chart_layouts WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1)',[user.id])});
  return NextResponse.json({ok:true});
 }catch(e){return error(e)}
}

export async function PATCH(req:NextRequest){
 try{
  if(!sameOrigin(req))return NextResponse.json({error:'Origen inválido'},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión'},{status:401});
  const id=req.nextUrl.searchParams.get('id');if(!id||!uuid.test(id))return NextResponse.json({error:'ID inválido'},{status:400});
  const updated=await transaction(async client=>{
   await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
   const existing=await client.query('SELECT id FROM chart_layouts WHERE user_id=$1 AND id=$2 FOR UPDATE',[user.id,id]);if(!existing.rowCount)return false;
   await client.query('UPDATE chart_layouts SET is_default=false WHERE user_id=$1 AND is_default=true',[user.id]);
   await client.query('UPDATE chart_layouts SET is_default=true WHERE id=$1 AND user_id=$2',[id,user.id]);
   return true;
  });
  return updated?NextResponse.json({ok:true}):NextResponse.json({error:'Espacio no encontrado'},{status:404});
 }catch(e){return error(e)}
}
