'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowRight,ChartCandlestick,FlaskConical,Search,Sparkles,X,Layers2} from 'lucide-react';
import type {Asset} from '../lib/market';

type Props={assets:Asset[];onSelect:(symbol:string)=>void;onClose:()=>void;onAction:(action:'single'|'double'|'triple'|'swing'|'scalp'|'invest'|'focus')=>void};
const tools=[
 {name:'Terminal',description:'Gráfico y operativa virtual',href:'/terminal',icon:ChartCandlestick},
 {name:'Screener',description:'Exploración de mercado',href:'/research?view=screener',icon:Search},
 {name:'Strategy Lab',description:'Backtesting educativo',href:'/research?view=strategy',icon:FlaskConical},
 {name:'Market Insights',description:'Copiloto y análisis técnico',href:'/research?view=copilot',icon:Sparkles}
];
const actions:{id:Props['onAction'] extends (a:infer T)=>void?T:never;name:string;description:string}[]=[
 {id:'single',name:'Un gráfico',description:'Vista Clásico + panel de trading'},
 {id:'double',name:'Dos gráficos',description:'Comparación horizontal'},
 {id:'triple',name:'Tres gráficos',description:'Un gráfico principal y dos secundarios'},
 {id:'scalp',name:'Preset · Intradía',description:'1D · VWAP, EMA 20 y RSI 14'},
 {id:'swing',name:'Preset · Swing',description:'3M · EMA 20, EMA 50 y MACD'},
 {id:'invest',name:'Preset · Inversor',description:'1Y · EMA 50, EMA 200 y RSI'},
 {id:'focus',name:'Alternar Focus',description:'Solo el espacio del gráfico'}
];
export default function QuantumCommand({assets,onSelect,onClose,onAction}:Props){
 const [query,setQuery]=useState(''),[index,setIndex]=useState(0);const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{input.current?.focus()},[]);
 const q=query.trim().toLocaleLowerCase();
 const matched=useMemo(()=>assets.filter(a=>`${a.symbol} ${a.name} ${a.exchange}`.toLowerCase().includes(q)).slice(0,q?12:6),[assets,q]);
 const navigation=useMemo(()=>tools.filter(t=>`${t.name} ${t.description}`.toLowerCase().includes(q)).slice(0,4),[q]);
 const quick=useMemo(()=>actions.filter(a=>`${a.name} ${a.description}`.toLowerCase().includes(q)),[q]);
 const results=[...matched.map(a=>({key:'asset:'+a.symbol,label:a.symbol,detail:a.name,kind:a.exchange,run:()=>onSelect(a.symbol)})),...quick.map(a=>({key:'action:'+a.id,label:a.name,detail:a.description,kind:'WORKSPACE',run:()=>onAction(a.id)})),...navigation.map(t=>({key:'nav:'+t.href,label:t.name,detail:t.description,kind:'SECCIÓN',run:()=>{window.location.assign(t.href)}}))];
 useEffect(()=>setIndex(0),[query]);
 const activate=(n:number)=>{results[n]?.run();onClose()};
 return <div className="v15-command-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div className="v15-command" role="dialog" aria-modal="true" aria-label="Búsqueda global de QUANTUM">
   <div className="v15-command-input"><Search size={20}/><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowDown'){e.preventDefault();setIndex(i=>Math.min(results.length-1,i+1))}if(e.key==='ArrowUp'){e.preventDefault();setIndex(i=>Math.max(0,i-1))}if(e.key==='Enter')activate(index)}} placeholder="Buscar activos, indicadores, pantallas, layouts..." aria-label="Búsqueda global"/><button onClick={onClose} aria-label="Cerrar búsqueda"><X size={18}/></button></div>
   <div className="v15-command-summary"><span><Activity size={13}/> QUANTUM COMMAND CENTER</span><span>{results.length} resultados</span></div>
   <div className="v15-command-results" role="listbox">{results.map((r,i)=><button key={r.key} role="option" aria-selected={index===i} className={index===i?'active':''} onMouseEnter={()=>setIndex(i)} onClick={()=>activate(i)}><span className="v15-command-glyph">{r.key.startsWith('asset:')?<ChartCandlestick size={16}/>:r.key.startsWith('action:')?<Layers2 size={16}/>:<ArrowRight size={16}/>}</span><span><strong>{r.label}</strong><small>{r.detail}</small></span><em>{r.kind}</em><ArrowRight size={15}/></button>)}{!results.length&&<div className="v15-command-empty">Sin resultados. Probá buscar por símbolo, empresa o herramienta.</div>}</div>
   <div className="v15-command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Elegir</span><span><kbd>Enter</kbd> Abrir</span><span><kbd>Esc</kbd> Cerrar</span></div>
  </div>
 </div>;
}
