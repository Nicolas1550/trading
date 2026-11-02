import {NextRequest,NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';import {paperQuote} from '../../../lib/paper-quote';import {assets} from '../../../lib/market';
export const runtime='nodejs';
const limiter=new Map<string,number[]>();
export async function POST(req:NextRequest){try{
 const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 const user=await currentUser();if(!user)return NextResponse.json({error:'Iniciá sesión para utilizar el AI Copilot'},{status:401});
 const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:'AI Copilot no está habilitado: agregá OPENAI_API_KEY al servidor. Market Insights continúa disponible sin esta clave.'},{status:503});
 const {symbol,question}=await req.json();if(!assets.some(a=>a.symbol===symbol)||typeof question!=='string'||question.trim().length<5||question.length>900)return NextResponse.json({error:'Consulta inválida'},{status:400});
 const now=Date.now(),recent=(limiter.get(user.id)||[]).filter(t=>now-t<600000);if(recent.length>=8)return NextResponse.json({error:'Límite temporal de consultas. Reintentá más tarde.'},{status:429});recent.push(now);limiter.set(user.id,recent);
 const quote=await paperQuote(symbol);const data=quote.source==='demo'?'PRECIO SINTÉTICO, NO REAL':'Dato histórico del proveedor; puede estar retrasado';
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,max_output_tokens:420,instructions:'Sos QUANTUM AI Copilot, un asistente educativo de análisis financiero. Respondé en español claro. Utilizá solo los datos incluidos; no inventes precios, noticias ni indicadores. Aclará incertidumbre y riesgos. No prometas rendimientos. No recomiendes transacciones individualizadas o apalancamiento.',input:`Activo ${symbol}. Precio de referencia ${quote.price} USD; fecha ${quote.asOf}. Origen: ${data}. Pregunta: ${question}`}),signal:AbortSignal.timeout(22000)});
 if(!response.ok)return NextResponse.json({error:'El proveedor de IA no pudo procesar la solicitud'},{status:502});const body=await response.json();const output=(body.output_text as string|undefined)||body.output?.flatMap((v:{content?:{type:string;text?:string}[]})=>v.content||[]).filter((v:{type:string})=>v.type==='output_text').map((v:{text?:string})=>v.text||'').join('')||'';
 if(!output)return NextResponse.json({error:'No se recibió un análisis'},{status:502});return NextResponse.json({answer:output,source:quote.source,asOf:quote.asOf});
 }catch{return NextResponse.json({error:'La consulta de IA no está disponible en este momento'},{status:500})}}
