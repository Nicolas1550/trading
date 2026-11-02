import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db,transaction} from '../../../lib/db';
import {paperQuote} from '../../../lib/paper-quote';
import {ranges,type Range} from '../../../lib/market';
import {error,unexpected} from '../../../lib/http';
export const runtime='nodejs';
export async function GET(){try{const user=await currentUser();if(!user)return error('Unauthorized',401);
 const p=await db().query('SELECT id,name,initial_balance FROM portfolios WHERE user_id=$1 ORDER BY created_at LIMIT 1',[user.id]);if(!p.rowCount)return NextResponse.json({portfolio:null,positions:[],transactions:[],cash:0});const portfolio=p.rows[0];
 const t=await db().query('SELECT t.id,a.symbol,t.side,t.quantity::text,t.price::text,t.fee::text,t.executed_at FROM transactions t JOIN assets a ON a.id=t.asset_id WHERE t.portfolio_id=$1 ORDER BY t.executed_at,t.created_at,t.id',[portfolio.id]);
 let cash=Number(portfolio.initial_balance);const holdings=new Map<string,{symbol:string,quantity:number,cost:number}>();
 for(const row of t.rows){const q=Number(row.quantity),price=Number(row.price),fee=Number(row.fee);const h=holdings.get(row.symbol)??{symbol:row.symbol,quantity:0,cost:0};if(row.side==='buy'){cash-=q*price+fee;h.quantity+=q;h.cost+=q*price+fee}else{cash+=q*price-fee;const ratio=h.quantity?Math.min(1,q/h.quantity):0;h.cost-=h.cost*ratio;h.quantity-=q}holdings.set(row.symbol,h)}
 return NextResponse.json({portfolio,cash,positions:[...holdings.values()].filter(x=>x.quantity>0.00000001),transactions:t.rows.slice().reverse()})}catch(e){return unexpected(e)}}
export async function POST(req:NextRequest){try{const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)return error('Invalid origin',403);
 const user=await currentUser();if(!user)return error('Unauthorized',401);const body=await req.json();
 if(body.action==='create'){
  const result=await transaction(async client=>{await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);const old=await client.query('SELECT id FROM portfolios WHERE user_id=$1 LIMIT 1',[user.id]);if(old.rowCount)return {id:old.rows[0].id,existing:true};const r=await client.query('INSERT INTO portfolios(user_id,name,initial_balance,is_simulated) VALUES ($1,$2,100000,true) RETURNING id',[user.id,'Demo Portfolio']);await client.query(`INSERT INTO account_ledger(portfolio_id,entry_type,amount,description,idempotency_key) VALUES($1,'initial_deposit',100000,'Saldo inicial demo','initial') ON CONFLICT DO NOTHING`,[r.rows[0].id]);return {id:r.rows[0].id}});return NextResponse.json(result);
 }
 const {symbol,side,quantity}=body;const range:Range=ranges.includes(body.range)?body.range:'1M';
 if(typeof symbol!=='string'||!['buy','sell'].includes(side)||typeof quantity!=='number'||!Number.isFinite(quantity)||quantity<=0||quantity>100000000)return error('Invalid simulated order');
 const idempotency=typeof body.idempotency_key==='string'&&/^[a-f0-9-]{36}$/i.test(body.idempotency_key)?body.idempotency_key:null;
 const quote=await paperQuote(symbol,range);if(!Number.isFinite(quote.price)||quote.price<=0)throw Error('No valid reference price');
 const output=await transaction(async client=>{
  const p=await client.query('SELECT id,initial_balance FROM portfolios WHERE user_id=$1 ORDER BY created_at LIMIT 1 FOR UPDATE',[user.id]);if(!p.rowCount)throw Error('Create a portfolio first');const portfolioId=p.rows[0].id;
  if(idempotency){const exists=await client.query('SELECT id,average_fill_price::float8 as price,data_source FROM trading_orders WHERE portfolio_id=$1 AND idempotency_key=$2',[portfolioId,idempotency]);if(exists.rowCount)return {ok:true,duplicate:true,price:exists.rows[0].price,source:exists.rows[0].data_source};}
  const a=await client.query('SELECT id FROM assets WHERE symbol=$1',[symbol]);if(!a.rowCount)throw Error('Unknown asset');const trades=await client.query('SELECT asset_id,side,quantity::text,price::text,fee::text FROM transactions WHERE portfolio_id=$1',[portfolioId]);
  let cash=Number(p.rows[0].initial_balance),owned=0;
  for(const t of trades.rows){const q=Number(t.quantity),cost=q*Number(t.price),fee=Number(t.fee);cash+=t.side==='buy'?-cost-fee:cost-fee;if(t.asset_id===a.rows[0].id)owned+=t.side==='buy'?q:-q}
  const total=quantity*quote.price;if(side==='buy'&&total>cash+.000001)throw Error('Insufficient virtual cash');if(side==='sell'&&quantity>owned+.00000001)throw Error('Insufficient holdings');
  const tran=await client.query('INSERT INTO transactions(portfolio_id,asset_id,side,quantity,price,fee,note) VALUES ($1,$2,$3,$4,$5,0,$6) RETURNING id',[portfolioId,a.rows[0].id,side,quantity,quote.price,`Simulated execution; server reference ${quote.source} as of ${quote.asOf}`]);
  const order=await client.query(`INSERT INTO trading_orders(portfolio_id,asset_id,side,position_direction,order_type,status,quantity,filled_quantity,average_fill_price,fee,data_source,idempotency_key,filled_at)
    VALUES($1,$2,$3,'long','market','filled',$4,$4,$5,0,$6,$7,now()) RETURNING id`,[portfolioId,a.rows[0].id,side,quantity,quote.price,quote.source,idempotency]);
  await client.query(`INSERT INTO account_ledger(portfolio_id,entry_type,amount,reference_type,reference_id,description,idempotency_key) VALUES($1,$2,$3,'trading_orders',$4,$5,$6)`,[portfolioId,side==='buy'?'trade_debit':'trade_credit',side==='buy'?-total:total,order.rows[0].id,'Simulation fill '+symbol,idempotency?`${idempotency}:ledger`:null]);
  return {ok:true,price:quote.price,source:quote.source,asOf:quote.asOf,transaction_id:tran.rows[0].id,order_id:order.rows[0].id};
 });return NextResponse.json(output);
 }catch(e){if(e instanceof Error&&['Create a portfolio first','Unknown asset','Insufficient virtual cash','Insufficient holdings'].includes(e.message))return error(e.message,422);return unexpected(e)}}
