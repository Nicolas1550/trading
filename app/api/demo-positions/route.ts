import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db,transaction} from '../../../lib/db';
import {assets,demoMarket} from '../../../lib/market';
export const runtime='nodejs';
const num=(x:unknown)=>Number(x);
async function priceFor(symbol:string){
 const q=await db().query(`SELECT mp.close,mp.recorded_at FROM market_prices mp JOIN assets a ON a.id=mp.asset_id WHERE a.symbol=$1 AND mp.source='twelvedata' ORDER BY mp.recorded_at DESC LIMIT 1`,[symbol]);
 if(q.rowCount&&Date.now()-new Date(q.rows[0].recorded_at).getTime()<86400000*4)return {price:num(q.rows[0].close),source:'twelvedata'};
 return {price:demoMarket(symbol,'1D').price,source:'synthetic'};
}
export async function GET(req:NextRequest){try{
 const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
 const symbol=req.nextUrl.searchParams.get('symbol')||'NVDA';if(!assets.some(a=>a.symbol===symbol))return NextResponse.json({error:'Invalid symbol'},{status:400});
 const p=await db().query('SELECT id,initial_balance FROM portfolios WHERE user_id=$1 ORDER BY created_at LIMIT 1',[user.id]);if(!p.rowCount)return NextResponse.json({needsPortfolio:true,positions:[],cash:0,equity:0});
 const mark=await priceFor(symbol);
 // Closing at the observed mark is a polling-based simulation, not a historical stop-fill guarantee.
 await db().query(`UPDATE quantum_demo_positions q SET status='closed',exit_price=$1,closed_at=now(),close_reason=CASE WHEN (direction='long' AND $1<=stop_loss) OR (direction='short' AND $1>=stop_loss) THEN 'stop_loss' ELSE 'take_profit' END
 FROM assets a WHERE q.asset_id=a.id AND q.portfolio_id=$2 AND a.symbol=$3 AND q.status='open' AND ((q.stop_loss IS NOT NULL AND ((direction='long' AND $1<=q.stop_loss) OR (direction='short' AND $1>=q.stop_loss))) OR (q.take_profit IS NOT NULL AND ((direction='long' AND $1>=q.take_profit) OR (direction='short' AND $1<=q.take_profit))))`,[mark.price,p.rows[0].id,symbol]);
 const result=await db().query(`SELECT q.*,a.symbol FROM quantum_demo_positions q JOIN assets a ON a.id=q.asset_id WHERE q.portfolio_id=$1 ORDER BY q.opened_at DESC LIMIT 300`,[p.rows[0].id]);
 const rows=result.rows;let cash=num(p.rows[0].initial_balance),unrealized=0,margin=0;
 for(const r of rows){const sign=r.direction==='long'?1:-1;if(r.status==='open'){margin+=num(r.margin_reserved);if(r.symbol===symbol)unrealized+=(mark.price-num(r.entry_price))*num(r.quantity)*sign}else cash+=(num(r.exit_price)-num(r.entry_price))*num(r.quantity)*sign}
 return NextResponse.json({positions:rows.filter(r=>r.symbol===symbol),cash:cash-margin,equity:cash+unrealized,margin,mark,unrealized});
}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Position error'},{status:500})}}
export async function POST(req:NextRequest){try{
 const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json();const {symbol,direction,action}=body;
 if(!assets.some(a=>a.symbol===symbol))return NextResponse.json({error:'Invalid symbol'},{status:400});
 if(action==='open'&&!['long','short'].includes(direction))return NextResponse.json({error:'Invalid direction'},{status:400});
 const quantity=num(body.quantity),stop=num(body.stopLoss),target=num(body.takeProfit);
 if(action==='open'&&(!Number.isFinite(quantity)||quantity<=0||quantity>100000||!Number.isFinite(stop)||stop<=0||!Number.isFinite(target)||target<=0))return NextResponse.json({error:'Invalid quantity or protection levels'},{status:400});
 const mark=await priceFor(symbol);const price=mark.price;
 if(action==='open'&&(direction==='long'?!(stop<price&&target>price):!(stop>price&&target<price)))return NextResponse.json({error:`For ${direction}, stop and target must be on opposite sides of the reference price (${price.toFixed(2)})`},{status:400});
 const result=await transaction(async c=>{
 const p=await c.query('SELECT id,initial_balance FROM portfolios WHERE user_id=$1 ORDER BY created_at LIMIT 1 FOR UPDATE',[user.id]);if(!p.rowCount)throw Error('Create a portfolio first');const pid=p.rows[0].id;
 const a=await c.query('SELECT id FROM assets WHERE symbol=$1',[symbol]);if(!a.rowCount)throw Error('Unknown asset');
 if(action==='close'){
 const id=body.positionId;if(typeof id!=='string')throw Error('Invalid position');const closed=await c.query(`UPDATE quantum_demo_positions SET status='closed',exit_price=$1,closed_at=now(),close_reason='manual' WHERE id=$2 AND portfolio_id=$3 AND asset_id=$4 AND status='open' RETURNING id`,[price,id,pid,a.rows[0].id]);if(!closed.rowCount)throw Error('Open position not found');return {ok:true,price,source:mark.source};
 }
 if(action!=='open')throw Error('Invalid action');
 const existing=await c.query('SELECT * FROM quantum_demo_positions WHERE portfolio_id=$1',[pid]);let cash=num(p.rows[0].initial_balance);for(const r of existing.rows){if(r.status==='open')cash-=num(r.margin_reserved);else cash+=(num(r.exit_price)-num(r.entry_price))*num(r.quantity)*(r.direction==='long'?1:-1)}
 const margin=price*quantity; // 1x exposure, no leverage or financing charges
 if(margin>cash)throw Error('Insufficient demo buying power');
 const created=await c.query(`INSERT INTO quantum_demo_positions(portfolio_id,asset_id,direction,quantity,entry_price,stop_loss,take_profit,margin_reserved,data_source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,[pid,a.rows[0].id,direction,quantity,price,stop,target,margin,mark.source]);return {ok:true,id:created.rows[0].id,price,source:mark.source};
 });return NextResponse.json(result);
}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Trade error'},{status:400})}}
