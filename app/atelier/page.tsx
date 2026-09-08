'use client';
import Link from 'next/link';
import {ArrowRight,Hammer,ClipboardCheck,FileText,Lightbulb,Target} from 'lucide-react';

const workshops=[
  {title:'Clarifier un enjeu',desc:'Cadrez un sujet RSE, identifiez les parties prenantes et formulez le problème à traiter.',icon:Target,href:'/priorities/'},
  {title:'Faire émerger des idées',desc:'Transformez un enjeu prioritaire en pistes d’action concrètes adaptées à votre entreprise.',icon:Lightbulb,href:'/actions/'},
  {title:'Structurer une action',desc:'Définissez objectif, responsable, échéance, indicateur et preuve attendue.',icon:ClipboardCheck,href:'/actions/'},
  {title:'Produire un livrable',desc:'Appuyez-vous sur la bibliothèque documentaire pour formaliser et conserver vos résultats.',icon:FileText,href:'/library/'}
];

export default function AtelierPage(){
  return <div className="atelierPage">
    <section className="atelierHero">
      <span className="kicker">ATELIER RSE</span>
      <div className="atelierHeroGrid">
        <div>
          <h1>Passer de la réflexion à l’action.</h1>
          <p>L’Atelier vous aide à travailler concrètement sur vos enjeux prioritaires, faire émerger des solutions et transformer les échanges en actions et livrables.</p>
        </div>
        <div className="atelierHeroIcon"><Hammer/></div>
      </div>
    </section>

    <section className="atelierSection">
      <div className="atelierSectionHead">
        <div>
          <span>PARCOURS GUIDÉ</span>
          <h2>Choisissez le travail à mener maintenant.</h2>
        </div>
      </div>
      <div className="atelierGrid">
        {workshops.map(({title,desc,icon:Icon,href},index)=><article className="atelierCard" key={title}>
          <div className="atelierCardTop"><span>{String(index+1).padStart(2,'0')}</span><div className="atelierIcon"><Icon/></div></div>
          <h3>{title}</h3>
          <p>{desc}</p>
          <Link href={href}>Ouvrir l’atelier <ArrowRight/></Link>
        </article>)}
      </div>
    </section>

    <section className="atelierNext">
      <div>
        <span>OBJECTIF</span>
        <h2>Chaque atelier doit produire quelque chose d’utilisable.</h2>
        <p>Une décision, une action, un document ou une preuve : l’Atelier est l’espace de mise en mouvement de votre démarche RSE.</p>
      </div>
      <Link className="atelierPrimary" href="/priorities/">Partir de mes 3 priorités <ArrowRight/></Link>
    </section>

    <style jsx>{`
      .atelierPage{display:grid;gap:22px}.atelierHero{background:linear-gradient(135deg,#fff 60%,#eaf7fc);border:1px solid #dce7e5;border-radius:20px;padding:32px}.atelierHeroGrid{display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:24px;align-items:center}.atelierHero h1{margin:8px 0 10px;max-width:760px}.atelierHero p{max-width:760px;color:#5f7479;line-height:1.65}.atelierHeroIcon{width:92px;height:92px;border-radius:24px;background:#102f39;color:#fff;display:grid;place-items:center}.atelierHeroIcon :global(svg){width:42px;height:42px}.atelierSection{background:#fff;border:1px solid #dce7e5;border-radius:20px;padding:24px}.atelierSectionHead{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}.atelierSectionHead span,.atelierNext span{font-size:9px;font-weight:900;letter-spacing:1px;color:#6f888d}.atelierSectionHead h2{margin:5px 0 0}.atelierGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.atelierCard{border:1px solid #dce7e5;border-radius:16px;padding:20px;display:grid;gap:10px;background:#fbfdfc}.atelierCardTop{display:flex;justify-content:space-between;align-items:center}.atelierCardTop>span{font-size:10px;font-weight:900;color:#82979b}.atelierIcon{width:42px;height:42px;border-radius:12px;background:#e9f5ef;color:#4c8b6b;display:grid;place-items:center}.atelierIcon :global(svg){width:20px}.atelierCard h3{margin:2px 0 0}.atelierCard p{margin:0;color:#657b80;line-height:1.55}.atelierCard :global(a){display:inline-flex;align-items:center;gap:7px;margin-top:6px;color:#0b7ea9;font-weight:800;text-decoration:none}.atelierCard :global(a svg){width:16px}.atelierNext{display:flex;justify-content:space-between;gap:24px;align-items:center;background:#102f39;color:#fff;border-radius:20px;padding:28px 30px}.atelierNext h2{margin:5px 0 8px}.atelierNext p{margin:0;max-width:720px;color:#d8e6e7;line-height:1.55}.atelierPrimary{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#173e47;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:850;white-space:nowrap}.atelierPrimary :global(svg){width:17px}@media(max-width:780px){.atelierHeroGrid{grid-template-columns:1fr}.atelierHeroIcon{width:70px;height:70px}.atelierGrid{grid-template-columns:1fr}.atelierNext{align-items:flex-start;flex-direction:column}.atelierPrimary{white-space:normal}}
    `}</style>
  </div>
}
