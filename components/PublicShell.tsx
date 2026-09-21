'use client';
import Link from 'next/link';
import {ReactNode,useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,X,ArrowRight} from 'lucide-react';

const nav=[
 {href:'/#apropos',label:'À propos'},
 {href:'/#methode',label:'La méthode'},
 {href:'/#solution',label:'La plateforme'},
 {href:'/evaluation-rse/',label:'Évaluation RSE'},
 {href:'/tarifs/',label:'Tarifs'},
 {href:'/connexion/',label:'Connexion'},
] as const;

export default function PublicShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 const[open,setOpen]=useState(false);
 const[activeHash,setActiveHash]=useState('');
 useEffect(()=>{
   const sync=()=>setActiveHash(window.location.hash||'');
   sync();
   window.addEventListener('hashchange',sync);
   return()=>window.removeEventListener('hashchange',sync);
 },[pathname]);
 const isActive=(href:string)=>{
   if(href.startsWith('/tarifs'))return pathname.startsWith('/tarifs');
   if(href.startsWith('/evaluation-rse'))return pathname.startsWith('/evaluation-rse');
   if(href.startsWith('/connexion'))return pathname.startsWith('/connexion');
   if(pathname!=='/')return false;
   if(href.includes('#apropos'))return activeHash==='#apropos';
   if(href.includes('#methode'))return activeHash==='#methode';
   if(href.includes('#solution'))return activeHash==='#solution';
   return false;
 };
 const handleNavClick=(href:string)=>{
   if(href.includes('#'))setActiveHash('#'+href.split('#')[1]);
   setOpen(false);
 };
 return <div className="publicSite">
   <header className="publicNav">
     <div className="publicNavInner">
       <Link href="/" className="publicBrand" onClick={()=>{setOpen(false);setActiveHash('');if(typeof window!=='undefined')window.history.replaceState(null,'','/')}}><img src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link>
       <nav className="publicDesktopNav" aria-label="Navigation principale">
         {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>handleNavClick(item.href)} className={`${isActive(item.href)?'active':''} ${item.href.startsWith('/connexion')?'connexionNav':''}`.trim()}>{item.label}</Link>)}
       </nav>
       <Link href="/evaluation-rse/" className="publicCta">Évaluer ma maturité <ArrowRight/></Link>
       <button className="publicMenuButton" onClick={()=>setOpen(v=>!v)} aria-label={open?'Fermer le menu':'Ouvrir le menu'}>{open?<X/>:<Menu/>}</button>
     </div>
     {open&&<nav className="publicMobileNav" aria-label="Navigation mobile">
       {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>handleNavClick(item.href)} className={`${isActive(item.href)?'active':''} ${item.href.startsWith('/connexion')?'connexionNav':''}`.trim()}><b>{item.label}</b><ArrowRight/></Link>)}
     </nav>}
   </header>
   <div className="publicContent">{children}</div>
 </div>
}