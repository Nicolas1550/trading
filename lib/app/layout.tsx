import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'QUANTUM — Financial Intelligence Terminal',description:'Premium financial intelligence terminal. Market charts, watchlists, analytics and transparent demo mode.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
