import {NextResponse} from 'next/server';
export const error=(message:string,status=400)=>NextResponse.json({error:message},{status});
export const unexpected=(e:unknown)=>{console.error('QUANTUM API error',e instanceof Error?e.message:e);return error('Server request failed. Check database configuration.',500)};
