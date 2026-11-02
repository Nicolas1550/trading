import { NextRequest, NextResponse } from 'next/server';
import {db} from '../../../lib/db';
import {coinbaseCandles,isCryptoPair,safeSymbol} from '../../../lib/market-feed';
import { assets, demoMarket, ranges, type Candle, type Range, type MarketResponse } from '../../../lib/market';
import {summarizePeriod} from '../../../lib/market-stats';
export const dynamic = 'force-dynamic';
export async function GET(request:NextRequest){
 const symbol=request.nextUrl.searchParams.get('symbol')?.toUpperCase()||'NVDA';
 const range=(request.nextUrl.searchParams.get('range')||'1M') as Range;
 if(!safeSymbol(symbol)||!ranges.includes(range))return NextResponse.json({error:'Invalid symbol or range'},{status:400});
 if(isCryptoPair(symbol)){try{const result=await coinbaseCandles(symbol,range);return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}})}catch(e){console.warn('Coinbase crypto chart unavailable:',e instanceof Error?e.message:'unknown')}}
 const key=process.env.TWELVE_DATA_API_KEY||process.env.TWELVEDATA_API_KEY;
 if(!key)return NextResponse.json(demoMarket(symbol,range),{headers:{'Cache-Control':'no-store'}});
 const settings:Record<Range,{interval:string;outputsize:number}>={'1D':{interval:'5min',outputsize:78},'1W':{interval:'1h',outputsize:100},'1M':{interval:'1day',outputsize:260},'3M':{interval:'1day',outputsize:260},'1Y':{interval:'1day',outputsize:280}};
 try{
  const {interval,outputsize}=settings[range];
  const url=new URL('https://api.twelvedata.com/time_series');url.searchParams.set('symbol',symbol);url.searchParams.set('interval',interval);url.searchParams.set('outputsize',String(outputsize));url.searchParams.set('apikey',key);url.searchParams.set('order','ASC');url.searchParams.set('timezone','UTC');
  const response=await fetch(url,{next:{revalidate:60},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Market provider unavailable');
  const payload=await response.json();if(!Array.isArray(payload.values)||payload.values.length<2)throw new Error(payload.message||'No data for this symbol');
  const candles:Candle[]=payload.values.map((v:Record<string,string>)=>({time:v.datetime,timestamp:new Date(v.datetime.replace(' ','T')+'Z').getTime(),open:Number(v.open),high:Number(v.high),low:Number(v.low),close:Number(v.close),volume:Number(v.volume)||0})).filter((c:Candle)=>Number.isFinite(c.close)&&Number.isFinite(c.timestamp)).sort((a:Candle,b:Candle)=>a.timestamp-b.timestamp);
  if(candles.length<2)throw new Error('Insufficient candles');
  // Persist provider candles in Neon without blocking the market response if storage is unavailable.
  try{
   const asset=await db().query('SELECT id FROM assets WHERE symbol=$1 LIMIT 1',[symbol]);
   if(asset.rowCount){
    const values=candles.slice(-280).map(c=>({ts:c.timestamp,open:c.open,high:c.high,low:c.low,close:c.close,volume:c.volume}));
    await db().query(`INSERT INTO market_prices(asset_id,recorded_at,open,high,low,close,volume,source)
      SELECT $1,to_timestamp(x.ts / 1000.0),x.open,x.high,x.low,x.close,x.volume,'twelvedata'
      FROM jsonb_to_recordset($2::jsonb) AS x(ts bigint,open numeric,high numeric,low numeric,close numeric,volume numeric)
      ON CONFLICT DO NOTHING`,[asset.rows[0].id,JSON.stringify(values)]);
   }
  }catch(e){console.warn('Market persistence skipped:',e instanceof Error?e.message:'unknown error')}
  const scoped=summarizePeriod(candles,range);
  const result:MarketResponse={symbol,range,...scoped,candles,source:'twelvedata',asOf:candles[candles.length-1].time,note:'Estadísticas del período solicitado; incluye historial anterior para indicadores. Cotizaciones posiblemente diferidas.'};
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){const demo=demoMarket(symbol,range);demo.note=`No se pudo obtener el proveedor (${error instanceof Error?error.message:'error'}). Se muestran datos sintéticos.`;return NextResponse.json(demo,{headers:{'Cache-Control':'no-store'}})}
}
