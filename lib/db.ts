import {Pool, type PoolClient} from 'pg';
const globalPool=globalThis as typeof globalThis & {quantumPool?:Pool};
export function db(){if(!process.env.DATABASE_URL)throw Error('DATABASE_URL missing');return globalPool.quantumPool??(globalPool.quantumPool=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000}));}
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>){const client=await db().connect();try{await client.query('BEGIN');const result=await fn(client);await client.query('COMMIT');return result}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}
