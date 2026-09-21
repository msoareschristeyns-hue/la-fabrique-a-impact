'use client';
import Link from 'next/link';
import {ReactNode,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,X,ArrowRight} from 'lucide-react';

const nav=[
 {href:'/#apropos',label:'À propos',sub:'Notre approche'},
 {href:'/#methode',label:'La méthode',sub:'Les 5 étapes'},
 {href:'/#solution',label:'La plateforme',sub:'Outils & preuves'},
 {href:'/tarifs/',label:'Tarifs',sub:'0 € ou 100 €/mois'},
 {href:'/evaluation-rse/',label:'Évaluation RSE',sub:'Gratuite · 5 min'},
 {href:'/connexion/',label:'Connexion',sub:'Espace entreprise'},
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
         {nav.map(item=><Link key={item.href} href={item.href} className={isActive(item.href)?'active':''}><span>{item.label}</span><small>{item.sub}</small></Link>)}
       </nav>
       <Link href="/evaluation-rse/" className="publicCta">Évaluer ma maturité <ArrowRight/></Link>
       <button className="publicMenuButton" onClick={()=>setOpen(v=>!v)} aria-label={open?'Fermer le menu':'Ouvrir le menu'}>{open?<X/>:<Menu/>}</button>
     </div>
     {open&&<nav className="publicMobileNav" aria-label="Navigation mobile">
       {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={isActive(item.href)?'active':''}><div><b>{item.label}</b><small>{item.sub}</small></div><ArrowRight/></Link>)}
     </nav>}
   </header>
   <div className="publicContent">{children}</div>
 </div>
}