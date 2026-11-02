import {db} from './db';
import {demoMarket,type Range} from './market';
import {getQuote,isCryptoPair,safeSymbol} from './market-feed';
/** Server-authoritative paper fill reference. Never trusts a client-supplied price. */
export async function paperQuote(symbol:string,range:Range='1M'){
 if(!safeSymbol(symbol))throw Error('Unknown asset');
 if(isCryptoPair(symbol)){const live=await getQuote(symbol);if(live.price!==null&&live.price>0)return {price:live.price,source:'coinbase',asOf:live.asOf??new Date().toISOString()};}
 try{const row=await db().query(`SELECT p.close::float8 AS price,p.recorded_at,p.source FROM market_prices p JOIN assets a ON a.id=p.asset_id WHERE a.symbol=$1 AND p.source='twelvedata' ORDER BY p.recorded_at DESC LIMIT 1`,[symbol]);
 if(row.rowCount){const q=row.rows[0],age=Date.now()-new Date(q.recorded_at).getTime();if(age<7*86400000&&q.price>0)return {price:Number(q.price),source:'twelvedata',asOf:q.recorded_at as string};}
 }catch{ /* The trading engine can still execute against an explicitly synthetic reference */ }
 const key=process.env.TWELVE_DATA_API_KEY||process.env.TWELVEDATA_API_KEY;
 if(key){try{const url=new URL('https://api.twelvedata.com/time_series');url.searchParams.set('symbol',symbol);url.searchParams.set('interval','1day');url.searchParams.set('outputsize','2');url.searchParams.set('apikey',key);
 const resp=await fetch(url,{signal:AbortSignal.timeout(6500),cache:'no-store'});if(resp.ok){const json=await resp.json();if(Array.isArray(json.values)){const val=json.values[0],price=Number(val.close);if(price>0&&Number.isFinite(price))return {price,source:'twelvedata',asOf:val.datetime as string}}}}catch{}}
 const m=demoMarket(symbol,range);return {price:m.price,source:'demo',asOf:m.asOf};
}
