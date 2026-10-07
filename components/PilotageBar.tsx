'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Route,ClipboardCheck,Target,ListChecks,Activity} from 'lucide-react';

const items=[
  {href:'/journey/',label:'Parcours RSE',icon:Route},
  {href:'/diagnostic/',label:'Diagnostic RSE',icon:ClipboardCheck},
  {href:'/priorities/',label:'Mes 3 priorités',icon:Target},
  {href:'/actions/',label:'Plan d’action',icon:ListChecks},
  {href:'/progress/',label:'Ma progression',icon:Activity},
];

export default function PilotageBar({eyebrow,title,description,actions}:{eyebrow:string;title:string;description:string;actions?:React.ReactNode}){
  const pathname=usePathname();
  return <div className="pilotageShell">
    <div className="pilotageHeader">
      <div>
        <span className="kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions&&<div className="pilotageHeaderActions">{actions}</div>}
    </div>
    <nav className="pilotageNav" aria-label="Pilotage RSE">
      {items.map(item=>{const Icon=item.icon;const active=pathname===item.href||pathname?.startsWith(item.href);return <Link key={item.href} href={item.href} className={active?'active':''}><Icon/><span>{item.label}</span></Link>})}
    </nav>
  </div>
}
