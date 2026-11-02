import {NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db} from '../../../lib/db';
import {getQuote,type QuoteSnapshot} from '../../../lib/market-feed';
import {aggregatePortfolio,type PaperTransaction,type PriceMark} from '../../../lib/portfolio-pnl';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const p=await db().query('SELECT id,name,initial_balance FROM portfolios WHERE user_id=$1 ORDER BY created_at LIMIT 1',[user.id]);
  if(!p.rowCount)return NextResponse.json({portfolio:null,summary:null},{headers:{'Cache-Control':'no-store'}});
  const portfolio=p.rows[0];
  const r=await db().query(`SELECT a.symbol,t.side,t.quantity::text,t.price::text,COALESCE(t.fee,0)::text AS fee,t.executed_at
   FROM transactions t JOIN assets a ON a.id=t.asset_id
   WHERE t.portfolio_id=$1 ORDER BY t.executed_at ASC,t.created_at ASC,t.id ASC`,[portfolio.id]);
  const trades=r.rows as PaperTransaction[];
  const base=aggregatePortfolio(trades,Number(portfolio.initial_balance),{});
  const open=base.assets.filter(a=>a.quantity>0).map(a=>a.symbol);
  const quotes=await Promise.all(open.slice(0,40).map(symbol=>getQuote(symbol)));
  const marks:Record<string,PriceMark>={};
  for(const quote of quotes){marks[quote.symbol]={price:quote.price,source:quote.source,asOf:quote.asOf,status:quote.status,message:quote.message}}
  // A historical provider close may be used as a stale estimate, never as a live quote.
  const missing=open.filter(symbol=>marks[symbol]?.price==null);
  if(missing.length){
   try{
    const previous=await db().query(`SELECT DISTINCT ON (a.symbol) a.symbol,m.close::float8 AS price,m.source,m.recorded_at
     FROM market_prices m JOIN assets a ON a.id=m.asset_id
     WHERE a.symbol=ANY($1::text[]) AND m.source IN ('twelvedata','coinbase')
     ORDER BY a.symbol,m.recorded_at DESC`,[missing]);
    for(const row of previous.rows){const price=Number(row.price);if(Number.isFinite(price)&&price>0){
     marks[row.symbol]={price,source:'neon · '+String(row.source),asOf:new Date(row.recorded_at).toISOString(),status:'cached',message:'Último cierre histórico; NO es una cotización actual'};
    }}
   }catch{/* Keep unpriced positions explicit. */}
  }
  const summary=aggregatePortfolio(trades,Number(portfolio.initial_balance),marks);
  return NextResponse.json({portfolio:{id:portfolio.id,name:portfolio.name},summary,recentTransactions:trades.slice(-40).reverse()},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Portfolio analytics failed',e instanceof Error?e.message:'unknown');return NextResponse.json({error:'No se pudo calcular la cartera'},{status:500})}
}
