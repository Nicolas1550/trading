import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {db} from './db';
export const hashToken=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function currentUser(){const token=(await cookies()).get('quantum_session')?.value;if(!token)return null;const result=await db().query('SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() LIMIT 1',[hashToken(token)]);return result.rows[0] as {id:string,name:string,email:string}|undefined ?? null;}
export async function setSession(userId:string){const token=randomBytes(32).toString('hex');await db().query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '7 days')",[userId,hashToken(token)]);(await cookies()).set('quantum_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});}
export async function clearSession(){const jar=await cookies();const token=jar.get('quantum_session')?.value;if(token)await db().query('DELETE FROM sessions WHERE token_hash=$1',[hashToken(token)]);jar.delete('quantum_session');}
