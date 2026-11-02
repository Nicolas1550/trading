import { NextRequest, NextResponse } from 'next/server';
import {db} from '../../../lib/db';
import { assets, demoMarket, ranges, type Candle, type Range, type MarketResponse } from '../../../lib/market';
export const dynamic = 'force-dynamic';
export async function GET(request:NextRequest){
 const symbol=request.nextUrl.searchParams.get('symbol')?.toUpperCase()||'NVDA';
 const range=(request.nextUrl.searchParams.get('range')||'1M') as Range;
 if(!assets.some(a=>a.symbol===symbol)||!ranges.includes(range))return NextResponse.json({error:'Invalid symbol or range'},{status:400});
 const key=process.env.TWELVEDATA_API_KEY;
 if(!key)return NextResponse.json(demoMarket(symbol,range),{headers:{'Cache-Control':'no-store'}});
 const settings:Record<Range,{interval:string;outputsize:number}>={'1D':{interval:'5min',outputsize:78},'1W':{interval:'1h',outputsize:100},'1M':{interval:'1day',outputsize:30},'3M':{interval:'1day',outputsize:90},'1Y':{interval:'1week',outputsize:52}};
 try{
  const {interval,outputsize}=settings[range];
  const url=new URL('https://api.twelvedata.com/time_series');url.searchParams.set('symbol',symbol);url.searchParams.set('interval',interval);url.searchParams.set('outputsize',String(outputsize));url.searchParams.set('apikey',key);url.searchParams.set('order','ASC');
  const response=await fetch(url,{next:{revalidate:60},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Market provider unavailable');
  const payload=await response.json();if(!Array.isArray(payload.values)||payload.values.length<2)throw new Error(payload.message||'No data for this symbol');
  const candles:Candle[]=payload.values.map((v:Record<string,string>)=>({time:v.datetime,timestamp:new Date(v.datetime.replace(' ','T')+'Z').getTime(),open:Number(v.open),high:Number(v.high),low:Number(v.low),close:Number(v.close),volume:Number(v.volume)||0})).filter((c:Candle)=>Number.isFinite(c.close)&&Number.isFinite(c.timestamp)).sort((a:Candle,b:Candle)=>a.timestamp-b.timestamp);
  if(candles.length<2)throw new Error('Insufficient candles');
  // Persist provider candles in Neon without blocking the market response if storage is unavailable.
  try{
   const asset=await db().query('SELECT id FROM assets WHERE symbol=$1 LIMIT 1',[symbol]);
   if(asset.rowCount){
    const values=candles.slice(-120);
    for(const c of values){
     await db().query(`INSERT INTO market_prices(asset_id,recorded_at,open,high,low,close,volume,source)
       SELECT $1,$2,$3,$4,$5,$6,$7,'twelvedata'
       WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE asset_id=$1 AND recorded_at=$2 AND source='twelvedata')`,
       [asset.rows[0].id,new Date(c.timestamp),c.open,c.high,c.low,c.close,c.volume]);
    }
   }
  }catch(e){console.warn('Market persistence skipped:',e instanceof Error?e.message:'unknown error')}
  const first=candles[0].open,last=candles[candles.length-1].close;
  const result:MarketResponse={symbol,range,price:last,change:last-first,changePercent:(last/first-1)*100,high:Math.max(...candles.map(c=>c.high)),low:Math.min(...candles.map(c=>c.low)),volume:candles.reduce((s,c)=>s+c.volume,0),candles,source:'twelvedata',asOf:candles[candles.length-1].time,note:'Datos del proveedor; pueden estar retrasados según mercado y plan.'};
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){const demo=demoMarket(symbol,range);demo.note=`No se pudo obtener el proveedor (${error instanceof Error?error.message:'error'}). Se muestran datos sintéticos.`;return NextResponse.json(demo,{headers:{'Cache-Control':'no-store'}})}
}
