import type {Candle,Range,MarketResponse} from './market';
/** Keep warm-up candles in `candles` for EMA 200; price statistics must describe the requested range. */
export function visiblePeriod(candles:Candle[],range:Range):Candle[]{
 if(!candles.length)return [];
 const last=candles[candles.length-1].timestamp;
 const windowMs:Record<Range,number>={'1D':86400000,'1W':7*86400000,'1M':30*86400000,'3M':90*86400000,'1Y':365*86400000};
 const cutoff=last-windowMs[range];
 const slice=candles.filter(c=>c.timestamp>=cutoff);
 return slice.length>=2?slice:candles.slice(-Math.min(2,candles.length));
}
export function summarizePeriod(candles:Candle[],range:Range):Pick<MarketResponse,'price'|'change'|'changePercent'|'high'|'low'|'volume'>{
 const bars=visiblePeriod(candles,range);
 if(!bars.length)throw Error('Historial vacío');
 const first=bars[0].open,last=bars[bars.length-1].close;
 const change=last-first;
 return {price:last,change,changePercent:first>0?change/first*100:0,
  high:Math.max(...bars.map(c=>c.high)),low:Math.min(...bars.map(c=>c.low)),volume:bars.reduce((s,c)=>s+c.volume,0)};
}
