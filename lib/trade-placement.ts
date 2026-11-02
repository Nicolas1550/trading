import type {Candle} from './market';
/** Historical trade markers must never be pinned to the newest candle if execution is outside the loaded range. */
export function placeTradeMarkers<T extends {executed_at:string;price:string}>(trades:T[],candles:Candle[],start:number,end:number):Array<T&{i:number;approx:boolean}>{
 if(candles.length<2)return [];
 const first=candles[0].timestamp,last=candles[candles.length-1].timestamp;
 const averageGap=(last-first)/(candles.length-1);
 return trades.flatMap(t=>{
  const ts=Date.parse(t.executed_at);
  if(!Number.isFinite(ts)||!Number.isFinite(Number(t.price)))return [];
  if(ts<first-averageGap*.65||ts>last+Math.max(averageGap*1.5,86400000))return [];
  const ahead=candles.findIndex(c=>c.timestamp>=ts);
  const i=ahead<0?candles.length-1:ahead>0&&Math.abs(candles[ahead-1].timestamp-ts)<Math.abs(candles[ahead].timestamp-ts)?ahead-1:ahead;
  return i>=start&&i<end?[{...t,i,approx:Math.abs(candles[i].timestamp-ts)>averageGap*.7}]:[];
 });
}
