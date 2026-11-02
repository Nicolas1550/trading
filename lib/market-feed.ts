/** Public quotes: Twelve Data for US equities/ETFs and Coinbase for USD crypto pairs.
 * Never substitute synthetic numbers for a missing real quote. Cache and quotas are process-local;
 * for production scale, replace with a shared Redis/DB queue and a licensed market data feed.
 */
import type {Candle,Range,MarketResponse} from './market';
import {summarizePeriod} from './market-stats';
export type QuoteSource='twelvedata'|'coinbase'|'neon';
export type QuoteSnapshot={symbol:string;price:number|null;changePercent:number|null;volume:number|null;source:QuoteSource|null;asOf:string|null;status:'ok'|'cached'|'pending'|'unavailable';message?:string};
const quoteCache=new Map<string,{value:QuoteSnapshot;expires:number}>();
const pending=new Map<string,Promise<QuoteSnapshot>>();
const budget={minute:0,used:0};
function takeTwelveCredit(){const minute=Math.floor(Date.now()/60000);if(budget.minute!==minute){budget.minute=minute;budget.used=0}if(budget.used>=6)return false;budget.used++;return true}
export const safeSymbol=(symbol:string)=>/^[A-Z0-9][A-Z0-9./-]{0,19}$/.test(symbol)&&!symbol.includes('..');
export const isCryptoPair=(symbol:string)=>/^[A-Z0-9]{2,12}\/USD$/.test(symbol);
const numberOrNull=(v:unknown):number|null=>{const n=Number(v);return v===null||v===undefined||v===''||!Number.isFinite(n)?null:n};
const empty=(symbol:string,status:'pending'|'unavailable',message:string):QuoteSnapshot=>({symbol,price:null,changePercent:null,volume:null,source:null,asOf:null,status,message});
async function coinbaseQuote(symbol:string):Promise<QuoteSnapshot>{
 const pair=symbol.replace('/','-');
 const response=await fetch(`https://api.coinbase.com/api/v3/brokerage/market/products/${pair}`,{next:{revalidate:45},signal:AbortSignal.timeout(7000),headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('Coinbase '+response.status);
 const v=await response.json();const price=numberOrNull(v.price),change=numberOrNull(String(v.price_percentage_change_24h??'').replace('%',''));
 if(price===null||price<=0)throw Error('Coinbase no devolvió un precio válido');
 return {symbol,price,changePercent:change,volume:numberOrNull(v.volume_24h),source:'coinbase',asOf:new Date().toISOString(),status:'ok'};
}
async function twelveQuote(symbol:string,key:string):Promise<QuoteSnapshot>{
 if(!takeTwelveCredit())return empty(symbol,'pending','Límite del plan: se actualizará más tarde');
 const url=new URL('https://api.twelvedata.com/quote');url.searchParams.set('symbol',symbol);url.searchParams.set('apikey',key);
 const resp=await fetch(url,{next:{revalidate:65},signal:AbortSignal.timeout(7500)});
 if(resp.status===429)return empty(symbol,'pending','Twelve Data alcanzó el límite de créditos');
 if(!resp.ok)throw Error('Twelve Data '+resp.status);
 const v=await resp.json();if(v.status==='error'){if(v.code===429)return empty(symbol,'pending',String(v.message??'Límite alcanzado'));throw Error(String(v.message??'Símbolo no disponible'))}
 const price=numberOrNull(v.close??v.price),change=numberOrNull(v.percent_change);
 if(price===null||price<=0)throw Error('Sin cotización en Twelve Data');
 return {symbol,price,changePercent:change,volume:numberOrNull(v.volume),source:'twelvedata',asOf:typeof v.datetime==='string'?v.datetime:new Date((Number(v.timestamp)||Date.now()/1000)*1000).toISOString(),status:'ok'};
}
export async function getQuote(symbol:string):Promise<QuoteSnapshot>{
 if(!safeSymbol(symbol))return empty(symbol,'unavailable','Símbolo inválido');
 const found=quoteCache.get(symbol);if(found&&found.expires>Date.now())return found.value;
 const inflight=pending.get(symbol);if(inflight)return inflight;
 const promise=(async()=>{
  try{
   const v=isCryptoPair(symbol)?await coinbaseQuote(symbol):await (async()=>{const key=process.env.TWELVE_DATA_API_KEY||process.env.TWELVEDATA_API_KEY;if(!key)return empty(symbol,'unavailable','Configurar TWELVE_DATA_API_KEY');return twelveQuote(symbol,key)})();
   if(v.price!==null)quoteCache.set(symbol,{value:v,expires:Date.now()+(v.source==='coinbase'?45000:180000)});
   else quoteCache.set(symbol,{value:v,expires:Date.now()+(v.status==='pending'?11000:50000)});
   return v;
  }catch(e){const fallback=quoteCache.get(symbol)?.value;if(fallback?.price!==null&&fallback?.price!==undefined)return {...fallback,status:'cached' as const,message:'Último dato en caché; proveedor no disponible'};const v=empty(symbol,'unavailable',e instanceof Error?e.message:'Proveedor temporalmente indisponible');quoteCache.set(symbol,{value:v,expires:Date.now()+35000});return v}
 })();pending.set(symbol,promise);try{return await promise}finally{pending.delete(symbol)}
}
export async function coinbaseCandles(symbol:string,range:Range):Promise<MarketResponse>{
 if(!isCryptoPair(symbol))throw Error('Par no compatible');
 const granularity:Record<Range,string>={'1D':'FIVE_MINUTE','1W':'ONE_HOUR','1M':'SIX_HOUR','3M':'ONE_DAY','1Y':'ONE_DAY'};
 const seconds:Record<Range,number>={'1D':300,'1W':3600,'1M':21600,'3M':86400,'1Y':86400};
 const span:Record<Range,number>={'1D':86400,'1W':7*86400,'1M':30*86400,'3M':90*86400,'1Y':300*86400};
 const end=Math.floor(Date.now()/1000),start=end-span[range];
 const url=new URL(`https://api.coinbase.com/api/v3/brokerage/market/products/${symbol.replace('/','-')}/candles`);
 url.searchParams.set('start',String(start));url.searchParams.set('end',String(end));url.searchParams.set('granularity',granularity[range]);url.searchParams.set('limit',String(Math.min(350,Math.ceil(span[range]/seconds[range])+4)));
 const resp=await fetch(url,{next:{revalidate:60},signal:AbortSignal.timeout(8000),headers:{Accept:'application/json'}});
 if(!resp.ok)throw Error('Coinbase candles: '+resp.status);
 const raw=await resp.json();if(!Array.isArray(raw.candles))throw Error('Sin velas de Coinbase');
 const candles:Candle[]=raw.candles.map((c:Record<string,string>)=>{const timestamp=Number(c.start)*1000;return {timestamp,time:new Date(timestamp).toISOString(),open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close),volume:Number(c.volume)||0}}).filter((c:Candle)=>Number.isFinite(c.close)&&c.close>0&&Number.isFinite(c.timestamp)).sort((a:Candle,b:Candle)=>a.timestamp-b.timestamp);
 if(candles.length<2)throw Error('Historial insuficiente de Coinbase');
 return {symbol,range,...summarizePeriod(candles,range),candles,source:'coinbase',asOf:candles[candles.length-1].time,note:'Datos spot de Coinbase; pueden estar diferidos por caché.'};
}
