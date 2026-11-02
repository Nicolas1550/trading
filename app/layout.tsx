import type { Metadata } from 'next';
import './globals.css';
import './v14.css';
import './v15.css';
import './v16.css';
export const metadata:Metadata={
 title:'QUANTUM | Trading Intelligence Platform',
 description:'Explorá acciones, ETF y criptomonedas con gráficos interactivos, 34 indicadores, análisis técnico, multi-chart y paper trading. Proyecto Full Stack educativo.',
 applicationName:'QUANTUM',keywords:['trading','paper trading','análisis técnico','Next.js','PostgreSQL','Neon','fintech','indicadores','gráficos'],
 openGraph:{title:'QUANTUM · Trading Intelligence',description:'Una terminal de análisis y simulación: multi-chart, indicadores, Screener y Strategy Lab.',type:'website'},
 twitter:{card:'summary_large_image',title:'QUANTUM · Trading Intelligence'},robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
