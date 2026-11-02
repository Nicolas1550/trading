import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';
import {db} from '../../../lib/db';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 try{
  const user=await currentUser();
  if(!user)return NextResponse.json({items:[],authenticated:false});
  const symbol=(req.nextUrl.searchParams.get('symbol')||'').toUpperCase();
  if(!/^[A-Z0-9/.-]{1,20}$/.test(symbol))return NextResponse.json({error:'Invalid symbol'},{status:400});
  const result=await db().query(`SELECT t.id,t.side,t.quantity::text,t.price::text,t.executed_at
   FROM transactions t JOIN portfolios p ON p.id=t.portfolio_id
   JOIN assets a ON a.id=t.asset_id WHERE p.user_id=$1 AND a.symbol=$2
   ORDER BY t.executed_at ASC LIMIT 500`,[user.id,symbol]);
  return NextResponse.json({items:result.rows,authenticated:true});
 }catch{return NextResponse.json({error:'Could not load trades'},{status:500})}
}
