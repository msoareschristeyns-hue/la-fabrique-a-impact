'use client';
import Link from'next/link';
import{ReactNode}from'react';
import{usePathname}from'next/navigation';
import{ArrowRight,BookOpen,Compass,Home,LogIn,Route,UserPlus}from'lucide-react';

const publicNav=[
  ['/',"Accueil",Home],
  ['/#methode','La méthode',Route],
  ['/#solution','La plateforme',Compass]
] as const;

export default function PublicShell({children}:{children:ReactNode}){
  const pathname=usePathname();
  return <main className="dash publicShell">
    <aside>
      <Link href="/" className="brand"><img className="brandLogo" src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link>
      <div className="publicIntro"><small>LA FABRIQUE À IMPACT</small><b>La RSE qui fait avancer votre PME.</b><p>Comprendre. Prioriser. Agir. Prouver.</p></div>
      <div className="publicJourney"><div className="publicJourneyHead"><Route/><div><small>PARCOURS RSE</small><b>5 étapes guidées</b></div></div><div className="publicJourneySteps">{['Comprendre','Diagnostiquer','Cadrer','Agir','Progresser'].map((x,i)=><div key={x}><span>{i+1}</span><b>{x}</b></div>)}</div><Link href="/#methode">Découvrir le parcours <ArrowRight/></Link></div>
      <nav>
        <div className="navGroup"><small>DÉCOUVRIR</small>{publicNav.map(([href,label,Icon])=><Link key={href} className={pathname==='/'&&href==='/'?'active':''} href={href}><Icon/><span>{label}</span></Link>)}</div>
        <div className="navGroup"><small>COMMENCER</small><Link href="/inscription/"><BookOpen/><span>Diagnostic gratuit</span></Link></div>
      </nav>
      <div className="sideBottom"><Link className={(pathname==='/connexion/'||pathname==='/connexion')?'settings activeSetting':'settings'} href="/connexion/"><LogIn/>Connexion</Link><Link className={(pathname==='/inscription/'||pathname==='/inscription')?'settings activeSetting':'settings'} href="/inscription/"><UserPlus/>Créer mon espace</Link></div>
    </aside>
    <section className="dashMain publicMain">{children}</section>
    <style jsx>{`:global(.publicShell){grid-template-columns:280px minmax(0,1fr)}:global(.publicShell aside){padding:22px 18px}.publicIntro{margin:24px 0 8px;padding:15px;border-radius:12px;background:#ffffff0d;border:1px solid #ffffff12}.publicIntro small{display:block;color:#72c79a;font-size:8px;font-weight:900;letter-spacing:1.1px}.publicIntro b{display:block;margin-top:5px;color:#fff;font-size:13px;line-height:1.35}.publicIntro p{margin:6px 0 0;color:#8faeb0;font-size:10px}.publicJourney{margin:14px 0 12px;padding:14px;border-radius:13px;background:linear-gradient(145deg,rgba(100,170,134,.11),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.12)}.publicJourneyHead{display:grid;grid-template-columns:auto 1fr;gap:9px;align-items:center}.publicJourneyHead>svg{width:18px;color:#72c79a}.publicJourneyHead small{display:block;color:#8faeb0;font-size:8px;font-weight:900;letter-spacing:1px}.publicJourneyHead b{font-size:12px;color:#fff}.publicJourneySteps{display:grid;gap:5px;margin:12px 0}.publicJourneySteps div{display:grid;grid-template-columns:23px 1fr;gap:8px;align-items:center;color:#b9cdcf}.publicJourneySteps span{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#ffffff0d;border:1px solid #ffffff12;font-size:8px;font-weight:900}.publicJourneySteps div:first-child span{background:#64aa86;color:#fff;border-color:#64aa86}.publicJourneySteps b{font-size:10px;font-weight:700}.publicJourney>a{display:flex;align-items:center;justify-content:space-between;color:#72c79a;text-decoration:none;font-size:10px;font-weight:850;padding-top:10px;border-top:1px solid #ffffff10}.publicJourney>a svg{width:14px}.navGroup{display:grid;gap:4px;margin:11px 0 16px}.navGroup>small{padding:7px 12px 5px;font-size:8px;font-weight:900;letter-spacing:1.15px;color:#7fa0a3}.navGroup :global(a){margin:0!important;min-height:40px}.navGroup :global(a span){line-height:1.2}.publicMain{position:relative}@media(max-width:920px){:global(.publicShell){grid-template-columns:250px minmax(0,1fr)}}@media(max-width:720px){:global(.publicShell){display:block}:global(.publicShell aside){position:relative;height:auto;min-height:0}.publicIntro,.publicJourney,:global(.publicShell aside nav){display:none}:global(.publicShell .sideBottom){display:flex;border-top:0;margin-top:12px;gap:6px}:global(.publicShell .sideBottom a){flex:1;justify-content:center}:global(.publicShell .publicMain){padding:24px 16px}}`}</style>
  </main>
}
