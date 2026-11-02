import {NextRequest,NextResponse} from 'next/server';
import {assets} from '../../../../lib/market';
import {safeSymbol} from '../../../../lib/market-feed';
export const runtime='nodejs';
const searchCache=new Map<string,{at:number,results:unknown[]}>();
const usage={minute:0,used:0};
export async function GET(req:NextRequest){
 const q=(req.nextUrl.searchParams.get('q')||'').trim().slice(0,36);
 if(q.length<2)return NextResponse.json({items:[],source:'local'});
 const local=assets.filter(a=>(a.symbol+' '+a.name).toLowerCase().includes(q.toLowerCase())).slice(0,16);
 const key=process.env.TWELVE_DATA_API_KEY||process.env.TWELVEDATA_API_KEY;
 if(!key||!/^[-. A-Za-z0-9/]{2,36}$/.test(q))return NextResponse.json({items:local,source:'local'});
 const cached=searchCache.get(q.toLowerCase());if(cached&&Date.now()-cached.at<86400000)return NextResponse.json({items:[...local,...cached.results.filter((r:any)=>!local.some(a=>a.symbol===r.symbol))].slice(0,24),source:'twelvedata'});
 const now=Math.floor(Date.now()/60000);if(usage.minute!==now){usage.minute=now;usage.used=0}if(usage.used>=1)return NextResponse.json({items:local,source:'local',message:'Busqueda remota limitada a una consulta por minuto'});usage.used++;
 try{
  const url=new URL('https://api.twelvedata.com/symbol_search');url.searchParams.set('symbol',q);url.searchParams.set('outputsize','25');url.searchParams.set('apikey',key);
  const r=await fetch(url,{next:{revalidate:3600},signal:AbortSignal.timeout(5500)});if(!r.ok)throw Error('Search unavailable');const d=await r.json();
  const results=(Array.isArray(d.data)?d.data:[]).filter((v:any)=>typeof v.symbol==='string'&&safeSymbol(v.symbol.toUpperCase())&&(v.country==='United States'||v.exchange==='NASDAQ'||v.exchange==='NYSE'||v.exchange==='NYSE ARCA'||v.instrument_type==='ETF')).map((v:any)=>({symbol:String(v.symbol).toUpperCase(),name:String(v.instrument_name??v.symbol),category:String(v.instrument_type).toUpperCase().includes('ETF')?'ETF':'STOCK',exchange:String(v.exchange??'USA'),base:100,change:0,color:'#68b6d5'})).slice(0,22);
  searchCache.set(q.toLowerCase(),{at:Date.now(),results});return NextResponse.json({items:[...local,...results.filter((v:any)=>!local.some(a=>a.symbol===v.symbol))].slice(0,24),source:'twelvedata'});
 }catch{return NextResponse.json({items:local,source:'local',message:'Búsqueda remota temporalmente indisponible'})}
}
