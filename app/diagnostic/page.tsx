'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const questions = [
  { id:'strategy', label:'Avez-vous formalisé vos engagements et objectifs RSE ?', pillar:'Stratégie & gouvernance' },
  { id:'environment', label:'Suivez-vous vos principaux impacts environnementaux ?', pillar:'Environnement' },
  { id:'social', label:'Avez-vous des actions structurées sur les conditions de travail et les compétences ?', pillar:'Social & conditions de travail' },
  { id:'purchases', label:'Intégrez-vous des critères RSE dans vos achats et le choix des fournisseurs ?', pillar:'Achats responsables' },
  { id:'territory', label:'Votre entreprise mène-t-elle des actions avec son territoire ou ses parties prenantes locales ?', pillar:'Ancrage territorial' },
  { id:'clients', label:'Pouvez-vous fournir facilement des preuves RSE à vos clients et donneurs d’ordre ?', pillar:'Clients & marché' },
];
const levels = [
  {label:'Pas encore', value:0},
  {label:'Partiellement', value:1},
  {label:'Oui, c’est structuré', value:2},
];

export default function Diagnostic(){
  const [step,setStep]=useState(0);
  const [sector,setSector]=useState('');
  const [size,setSize]=useState('');
  const [maturity,setMaturity]=useState('');
  const [answers,setAnswers]=useState<Record<string,number>>({});

  const complete = sector && size && maturity;
  const answered = Object.keys(answers).length;
  const score = useMemo(()=> Math.round((Object.values(answers).reduce((a,b)=>a+b,0)/(questions.length*2))*100)||0,[answers]);
  const priorities = useMemo(()=>questions.map(q=>({...q,value:answers[q.id] ?? 0})).sort((a,b)=>a.value-b.value).slice(0,3),[answers]);

  function finish(){
    const result={sector,size,maturity,score,answers,priorities:priorities.map(p=>p.pillar),date:new Date().toISOString()};
    localStorage.setItem('fabrique-impact-diagnostic',JSON.stringify(result));
    window.location.href='/dashboard/';
  }

  return <main className="formPage"><div className="formWrap">
    <Link href="/" className="brand"><span className="brandMark">F</span><span>La Fabrique à Impact</span></Link>
    <span className="kicker">DIAGNOSTIC EXPRESS · ÉTAPE {step+1}/2</span>
    <h1>{step===0?'Commençons par votre entreprise.':'Où en êtes-vous aujourd’hui ?'}</h1>
    <p>{step===0?'Quelques informations nous permettent de contextualiser vos futures priorités.':'6 questions pour identifier les sujets sur lesquels agir en premier.'}</p>
    <div className="progress"><i style={{width:step===0?'50%':'100%'}}/></div>

    {step===0 ? <div className="diagCard">
      <label>Quel est votre secteur d’activité ?<select value={sector} onChange={e=>setSector(e.target.value)}><option value="" disabled>Sélectionnez votre secteur</option><option>Industrie</option><option>Commerce</option><option>Services</option><option>BTP</option><option>Transport & logistique</option><option>Autre</option></select></label>
      <label>Combien de personnes travaillent dans l’entreprise ?<div className="choices">{['1–9','10–49','50–249','250+'].map(x=><button className={size===x?'selected':''} onClick={()=>setSize(x)} type="button" key={x}>{x}</button>)}</div></label>
      <label>Votre démarche RSE aujourd’hui ?<select value={maturity} onChange={e=>setMaturity(e.target.value)}><option value="" disabled>Choisissez la situation la plus proche</option><option>Nous débutons</option><option>Quelques actions existent</option><option>Notre démarche est structurée</option></select></label>
      <button className="button full" disabled={!complete} onClick={()=>setStep(1)}>Continuer le diagnostic →</button>
    </div> : <div className="diagCard">
      {questions.map((q,i)=><div className="diagnosticQuestion" key={q.id}><div><small>{String(i+1).padStart(2,'0')} · {q.pillar}</small><strong>{q.label}</strong></div><div className="choices">{levels.map(l=><button type="button" className={answers[q.id]===l.value?'selected':''} onClick={()=>setAnswers(a=>({...a,[q.id]:l.value}))} key={l.value}>{l.label}</button>)}</div></div>)}
      <div className="diagnosticFooter"><button type="button" className="textButton" onClick={()=>setStep(0)}>← Retour</button><span>{answered}/6 réponses</span><button className="button" disabled={answered!==6} onClick={finish}>Voir mes résultats →</button></div>
    </div>}
    <div className="pillars">{questions.map(x=><span key={x.id}>✓ {x.pillar}</span>)}</div>
  </div></main>
}
