import {NextRequest,NextResponse} from 'next/server';
import {getQuote,safeSymbol,type QuoteSnapshot} from '../../../lib/market-feed';
import {db} from '../../../lib/db';
import {assets} from '../../../lib/market';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const symbols=[...new Set((req.nextUrl.searchParams.get('symbols')||assets.slice(0,11).map(a=>a.symbol).join(',')).split(',').map(s=>s.trim().toUpperCase()).filter(s=>safeSymbol(s)))].slice(0,35);
 if(!symbols.length)return NextResponse.json({error:'No valid symbols'},{status:400});
 const live=await Promise.all(symbols.map(s=>getQuote(s)));
 const snapshot=new Map<string,{price:number;asOf:string;source:string}>();
 if(live.some(x=>x.price===null)){
  try{const r=await db().query(`SELECT a.symbol,p.close::float8 AS price,p.recorded_at AS as_of,p.source
   FROM assets a JOIN LATERAL (SELECT close,recorded_at,source FROM market_prices
   WHERE asset_id=a.id AND source IN ('twelvedata','coinbase') ORDER BY recorded_at DESC LIMIT 1) p ON true
   WHERE a.symbol=ANY($1::text[])`,[symbols]);
   for(const row of r.rows){const ts=new Date(row.as_of).toISOString(),price=Number(row.price);if(Number.isFinite(price)&&price>0)snapshot.set(row.symbol,{price,asOf:ts,source:row.source});}
  }catch{/* database is optional for public watchlist display */}
 }
 const items=live.map(item=>{if(item.price!==null)return item;const old=snapshot.get(item.symbol);if(!old)return item;return {...item,price:old.price,source:'neon' as const,asOf:old.asOf,status:'cached' as const,message:'Último cierre almacenado; no es una cotización actual'} satisfies QuoteSnapshot});
 return NextResponse.json({items,checkedAt:new Date().toISOString(),note:'Cotizaciones de proveedor o caché histórica. Nunca se inventan precios en esta lista.'},{headers:{'Cache-Control':'no-store'}});
}
