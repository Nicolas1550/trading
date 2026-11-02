export type Range = '1D' | '1W' | '1M' | '3M' | '1Y';
export type Asset = { symbol: string; name: string; category: 'STOCK' | 'ETF' | 'CRYPTO' | 'INDEX'; exchange: string; base: number; change: number; color: string };
export type Candle = { time: string; timestamp: number; open: number; high: number; low: number; close: number; volume: number };
export type MarketResponse = { symbol: string; range: Range; price: number; change: number; changePercent: number; high: number; low: number; volume: number; candles: Candle[]; source: 'demo' | 'twelvedata' | 'coinbase'; asOf: string; note?: string };
export const assets: Asset[] = [
 {symbol:'NVDA',name:'NVIDIA Corporation',category:'STOCK',exchange:'NASDAQ',base:184.26,change:2.84,color:'#76b900'},
 {symbol:'AAPL',name:'Apple Inc.',category:'STOCK',exchange:'NASDAQ',base:248.32,change:1.12,color:'#b4c3d7'},
 {symbol:'MSFT',name:'Microsoft Corporation',category:'STOCK',exchange:'NASDAQ',base:512.64,change:0.91,color:'#55b8fa'},
 {symbol:'TSLA',name:'Tesla, Inc.',category:'STOCK',exchange:'NASDAQ',base:294.81,change:-1.87,color:'#e66b70'},
 {symbol:'AMZN',name:'Amazon.com, Inc.',category:'STOCK',exchange:'NASDAQ',base:226.51,change:1.43,color:'#ffb257'},
 {symbol:'GOOGL',name:'Alphabet Inc.',category:'STOCK',exchange:'NASDAQ',base:195.40,change:-0.42,color:'#5d9ef7'},
 {symbol:'META',name:'Meta Platforms, Inc.',category:'STOCK',exchange:'NASDAQ',base:689.32,change:1.96,color:'#6e92ff'},
 {symbol:'SPY',name:'SPDR S&P 500 ETF',category:'ETF',exchange:'NYSE ARCA',base:609.28,change:0.72,color:'#d9a761'},
 {symbol:'QQQ',name:'Invesco QQQ Trust',category:'ETF',exchange:'NASDAQ',base:535.72,change:1.25,color:'#b9a0f8'},
 {symbol:'BTC/USD',name:'Bitcoin / US Dollar',category:'CRYPTO',exchange:'CRYPTO',base:72480.20,change:2.41,color:'#f5a846'},
 {symbol:'ETH/USD',name:'Ethereum / US Dollar',category:'CRYPTO',exchange:'CRYPTO',base:3820.72,change:-0.67,color:'#9a9df4'},
 // NASDAQ - technology and growth
 {symbol:'AMD',name:'Advanced Micro Devices',category:'STOCK',exchange:'NASDAQ',base:100,change:0,color:'#e88087'},
 {symbol:'INTC',name:'Intel Corporation',category:'STOCK',exchange:'NASDAQ',base:30,change:0,color:'#6ca8d9'},
 {symbol:'AVGO',name:'Broadcom Inc.',category:'STOCK',exchange:'NASDAQ',base:100,change:0,color:'#ed8d7e'},
 {symbol:'NFLX',name:'Netflix Inc.',category:'STOCK',exchange:'NASDAQ',base:100,change:0,color:'#e76a69'},
 {symbol:'COST',name:'Costco Wholesale',category:'STOCK',exchange:'NASDAQ',base:100,change:0,color:'#b1d1ec'},
 {symbol:'ADBE',name:'Adobe Inc.',category:'STOCK',exchange:'NASDAQ',base:100,change:0,color:'#fa7878'},
 // NYSE - financial, industrial and consumer names
 {symbol:'JPM',name:'JPMorgan Chase & Co.',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#75c0aa'},
 {symbol:'KO',name:'The Coca-Cola Company',category:'STOCK',exchange:'NYSE',base:65,change:0,color:'#f07a84'},
 {symbol:'WMT',name:'Walmart Inc.',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#d4b36b'},
 {symbol:'DIS',name:'The Walt Disney Company',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#9dacf4'},
 {symbol:'V',name:'Visa Inc.',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#a6aef7'},
 {symbol:'MA',name:'Mastercard Incorporated',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#d5a77b'},
 {symbol:'XOM',name:'Exxon Mobil Corporation',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#e28e93'},
 {symbol:'BA',name:'The Boeing Company',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#70a7d8'},
 {symbol:'CAT',name:'Caterpillar Inc.',category:'STOCK',exchange:'NYSE',base:100,change:0,color:'#e3c075'},
 // S&P 500 trackers and market benchmarks (ETFs, not the S&P 500 index itself)
 {symbol:'VOO',name:'Vanguard S&P 500 ETF',category:'ETF',exchange:'NYSE ARCA',base:100,change:0,color:'#e8c18c'},
 {symbol:'IVV',name:'iShares Core S&P 500 ETF',category:'ETF',exchange:'NYSE ARCA',base:100,change:0,color:'#baaaff'},
 {symbol:'DIA',name:'SPDR Dow Jones Industrial Average ETF',category:'ETF',exchange:'NYSE ARCA',base:100,change:0,color:'#86bee0'},
 {symbol:'IWM',name:'iShares Russell 2000 ETF',category:'ETF',exchange:'NYSE ARCA',base:100,change:0,color:'#a0cfd0'},
 // Cryptocurrency spot USD pairs
 {symbol:'SOL/USD',name:'Solana / US Dollar',category:'CRYPTO',exchange:'COINBASE',base:100,change:0,color:'#a882ed'},
 {symbol:'ADA/USD',name:'Cardano / US Dollar',category:'CRYPTO',exchange:'COINBASE',base:1,change:0,color:'#88a7ff'},
 {symbol:'DOGE/USD',name:'Dogecoin / US Dollar',category:'CRYPTO',exchange:'COINBASE',base:.25,change:0,color:'#e1b975'},
 {symbol:'LTC/USD',name:'Litecoin / US Dollar',category:'CRYPTO',exchange:'COINBASE',base:100,change:0,color:'#b8c7df'}
];
export const ranges: Range[] = ['1D','1W','1M','3M','1Y'];
export const usd = (n:number,digits=2) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:digits,maximumFractionDigits:digits}).format(n);
export const compact = (n:number) => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(n);
function hash(s:string){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function random(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
export function demoMarket(symbol:string,range:Range):MarketResponse {
 const asset=assets.find(a=>a.symbol===symbol)||{...assets[0],symbol,base:100,change:0}; const count:Record<Range,number>={'1D':72,'1W':84,'1M':90,'3M':90,'1Y':120};
 const n=count[range], rand=random(hash(symbol+range));const ms:Record<Range,number>={'1D':5*60000,'1W':2*3600000,'1M':8*3600000,'3M':86400000,'1Y':3*86400000};
 const end=Date.now();let p=asset.base*(1-asset.change/100);const candles:Candle[]=[];
 for(let i=0;i<n;i++){const open=p;const drift=(asset.change/100)/n;const volatility=(rand()-.5)*(range==='1D'?.008:.025);p=Math.max(.01,p*(1+drift+volatility));const high=Math.max(open,p)*(1+rand()*.003);const low=Math.min(open,p)*(1-rand()*.003);candles.push({timestamp:end-(n-1-i)*ms[range],time:new Date(end-(n-1-i)*ms[range]).toISOString(),open,high,low,close:p,volume:Math.round((.5+rand()*2)*1000000)})}
 const last=candles[n-1].close,first=candles[0].open;
 return {symbol,range,price:last,change:last-first,changePercent:(last/first-1)*100,high:Math.max(...candles.map(c=>c.high)),low:Math.min(...candles.map(c=>c.low)),volume:candles.reduce((s,c)=>s+c.volume,0),candles,source:'demo',asOf:new Date().toISOString(),note:'Datos sintéticos generados localmente; no representan precios de mercado.'};
}
