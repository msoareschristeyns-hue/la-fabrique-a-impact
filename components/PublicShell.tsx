'use client';
import Link from 'next/link';
import {ReactNode,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,X,ArrowRight} from 'lucide-react';

const nav=[
 {href:'/#apropos',label:'À propos'},
 {href:'/#methode',label:'La méthode'},
 {href:'/#solution',label:'La plateforme'},
 {href:'/tarifs/',label:'Tarifs'},
 {href:'/evaluation-rse/',label:'Évaluation RSE'},
 {href:'/connexion/',label:'Connexion'},
] as const;

export default function PublicShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 const[open,setOpen]=useState(false);
 const isActive=(href:string)=>{
   if(href.startsWith('/tarifs'))return pathname.startsWith('/tarifs');
   if(href.startsWith('/evaluation-rse'))return pathname.startsWith('/evaluation-rse');
   if(href.startsWith('/connexion'))return pathname.startsWith('/connexion');
   return pathname==='/';
 };
 return <div className="publicSite">
   <header className="publicNav">
     <div className="publicNavInner">
       <Link href="/" className="publicBrand" onClick={()=>setOpen(false)}><img src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link>
       <nav className="publicDesktopNav" aria-label="Navigation principale">
         {nav.map(item=><Link key={item.href} href={item.href} className={isActive(item.href)?'active':''}>{item.label}</Link>)}
       </nav>
       <Link href="/evaluation-rse/" className="publicCta">Évaluer ma maturité <ArrowRight/></Link>
       <button className="publicMenuButton" onClick={()=>setOpen(v=>!v)} aria-label={open?'Fermer le menu':'Ouvrir le menu'}>{open?<X/>:<Menu/>}</button>
     </div>
     {open&&<nav className="publicMobileNav" aria-label="Navigation mobile">
       {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={isActive(item.href)?'active':''}><b>{item.label}</b><ArrowRight/></Link>)}
     </nav>}
   </header>
   <div className="publicContent">{children}</div>
 </div>
}