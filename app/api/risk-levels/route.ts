import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db} from '../../../lib/db';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({levels:null});
  const symbol=req.nextUrl.searchParams.get('symbol');
  if(!symbol)return NextResponse.json({error:'Missing symbol'},{status:400});
  const r=await db().query(`SELECT r.stop_loss::float8,r.take_profit::float8 FROM quantum_risk_levels r JOIN portfolios p ON p.id=r.portfolio_id JOIN assets a ON a.id=r.asset_id WHERE p.user_id=$1 AND a.symbol=$2 ORDER BY p.created_at LIMIT 1`,[user.id,symbol]);
  return NextResponse.json({levels:r.rows[0]||null});
 }catch{return NextResponse.json({levels:null,error:'Risk levels unavailable. Apply migration.'})}
}
export async function POST(req:NextRequest){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json();
  const {symbol,stop_loss,take_profit}=body;
  if(typeof symbol!=='string'||!/^[A-Z0-9/.-]{1,20}$/.test(symbol)||[stop_loss,take_profit].some(v=>v!==null&&(typeof v!=='number'||!Number.isFinite(v)||v<=0)))return NextResponse.json({error:'Invalid levels'},{status:400});
  const r=await db().query(`INSERT INTO quantum_risk_levels(portfolio_id,asset_id,stop_loss,take_profit) SELECT p.id,a.id,$2,$3 FROM portfolios p CROSS JOIN assets a WHERE p.user_id=$1 AND a.symbol=$4 ORDER BY p.created_at LIMIT 1 ON CONFLICT(portfolio_id,asset_id) DO UPDATE SET stop_loss=excluded.stop_loss,take_profit=excluded.take_profit,updated_at=now() RETURNING portfolio_id`,[user.id,stop_loss,take_profit,symbol]);
  if(!r.rowCount)return NextResponse.json({error:'Create a portfolio first or choose a supported asset'},{status:400});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Could not save levels. Apply QUANTUM_RISK_LEVELS_MIGRATION.sql'},{status:500})}
}
