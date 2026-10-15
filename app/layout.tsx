import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Meltec | Loja de informática e assistência técnica',description:'Produtos, equipe e assistência em um só lugar.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
