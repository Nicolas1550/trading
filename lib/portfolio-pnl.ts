/** Weighted-average cost P&L for the original LONG paper portfolio.
 * Transaction fees enter the cost basis on buys and reduce proceeds on sells.
 * Missing external quotes never become invented market prices or a fake total.
 * Not a calculation for the separate leveraged quantum_demo_positions module.
 */
export type PaperTransaction = {symbol:string;side:string;quantity:number|string;price:number|string;fee?:number|string|null;executed_at?:string};
export type PriceMark = {price:number|null;source:string|null;asOf:string|null;status:'ok'|'cached'|'unavailable'|'pending';message?:string};
export type AssetPnl = {
 symbol:string;quantity:number;averageCost:number|null;costBasis:number;realizedPnl:number;
 markPrice:number|null;marketValue:number|null;unrealizedPnl:number|null;totalPnl:number|null;
 returnPercent:number|null;buys:number;sells:number;quote:PriceMark|null;
};
export type PortfolioPnl = {
 initialBalance:number;cash:number;equity:number|null;realizedPnl:number;unrealizedPnl:number|null;
 totalPnl:number|null;totalReturnPercent:number|null;investedCost:number;marketValue:number|null;
 missingQuotes:string[];invalidTransactions:number;assets:AssetPnl[];complete:boolean;asOf:string;
};
type Holding={symbol:string;quantity:number;costBasis:number;realizedPnl:number;buys:number;sells:number};
const EPS=1e-8;
const round=(n:number)=>Math.round((n+Number.EPSILON)*1e8)/1e8;
export function aggregatePortfolio(trades:PaperTransaction[],initial:number,marks:Record<string,PriceMark>={}):PortfolioPnl {
 const holdings=new Map<string,Holding>();let cash=initial,invalidTransactions=0;
 for(const t of trades){
  const q=Number(t.quantity),p=Number(t.price),fee=Number(t.fee??0);
  if(!t.symbol||!Number.isFinite(q)||q<=0||!Number.isFinite(p)||p<=0||!Number.isFinite(fee)||fee<0||!['buy','sell'].includes(t.side)){invalidTransactions++;continue;}
  let h=holdings.get(t.symbol);if(!h){h={symbol:t.symbol,quantity:0,costBasis:0,realizedPnl:0,buys:0,sells:0};holdings.set(t.symbol,h)}
  if(t.side==='buy'){
   cash-=q*p+fee;h.quantity+=q;h.costBasis+=q*p+fee;h.buys++;
  }else{
   if(q>h.quantity+EPS){invalidTransactions++;continue}
   const costSold=h.quantity>EPS?h.costBasis*(q/h.quantity):0;
   cash+=q*p-fee;h.quantity-=q;h.costBasis-=costSold;h.realizedPnl+=q*p-fee-costSold;h.sells++;
   if(Math.abs(h.quantity)<EPS){h.quantity=0;h.costBasis=0}
  }
 }
 const assets:AssetPnl[]=[];const missingQuotes:string[]=[];
 let realizedPnl=0,knownUnrealized=0,knownMarketValue=0,investedCost=0;
 for(const h of holdings.values()){
  realizedPnl+=h.realizedPnl;
  const open=h.quantity>EPS,mark=marks[h.symbol]??null;
  const price=open&&mark&&Number.isFinite(mark.price)&&Number(mark.price)>0?Number(mark.price):null;
  const marketValue=open?(price===null?null:price*h.quantity):0;
  const unrealizedPnl=open?(marketValue===null?null:marketValue-h.costBasis):0;
  if(unrealizedPnl===null)missingQuotes.push(h.symbol);else knownUnrealized+=unrealizedPnl;
  if(marketValue!==null)knownMarketValue+=marketValue;
  investedCost+=h.costBasis;
  const totalPnl=unrealizedPnl===null?null:h.realizedPnl+unrealizedPnl;
  const returnPercent=open&&h.costBasis>EPS&&unrealizedPnl!==null?unrealizedPnl/h.costBasis*100:null;
  assets.push({symbol:h.symbol,quantity:round(h.quantity),averageCost:open?round(h.costBasis/h.quantity):null,costBasis:round(h.costBasis),realizedPnl:round(h.realizedPnl),markPrice:price,marketValue:marketValue===null?null:round(marketValue),unrealizedPnl:unrealizedPnl===null?null:round(unrealizedPnl),totalPnl:totalPnl===null?null:round(totalPnl),returnPercent:returnPercent===null?null:round(returnPercent),buys:h.buys,sells:h.sells,quote:open?mark:null});
 }
 assets.sort((a,b)=>Number(b.quantity>EPS)-Number(a.quantity>EPS)||a.symbol.localeCompare(b.symbol));
 const complete=missingQuotes.length===0&&invalidTransactions===0;
 const unrealizedPnl=complete?round(knownUnrealized):null;
 const totalPnl=complete?round(realizedPnl+knownUnrealized):null;
 return {initialBalance:round(initial),cash:round(cash),equity:complete?round(cash+knownMarketValue):null,
 realizedPnl:round(realizedPnl),unrealizedPnl,totalPnl,totalReturnPercent:totalPnl!==null&&initial>EPS?round(totalPnl/initial*100):null,
 investedCost:round(investedCost),marketValue:complete?round(knownMarketValue):null,missingQuotes,invalidTransactions,assets,complete,asOf:new Date().toISOString()};
}
