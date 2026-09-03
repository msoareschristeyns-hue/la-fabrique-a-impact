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
const sectorWeights:Record<string,Record<string,number>>={
  'Industrie':{environment:18,purchases:14,social:8,clients:8},
  'Commerce':{purchases:16,clients:14,social:8,environment:6},
  'Services':{social:14,clients:12,strategy:8,environment:4},
  'BTP':{environment:16,social:14,purchases:12,clients:8},
  'Transport & logistique':{environment:18,social:12,purchases:10,clients:8},
  'Autre':{strategy:8,clients:8,social:6,purchases:6}
};
const effort:Record<string,number>={strategy:2,environment:3,social:3,purchases:2,territory:1,clients:2};

function rankPriorities(answers:Record<string,number>,sector:string,size:string,maturity:string){
  const sw=sectorWeights[sector]||sectorWeights.Autre;
  return questions.map((q,index)=>{
    const maturityGap=(2-(answers[q.id]??0))*30;
    const sectorFit=sw[q.id]||0;
    const clientUrgency=q.id==='clients'?16:q.id==='strategy'?8:q.id==='purchases'?7:0;
    const sizeFactor=(size==='50–249'||size==='250+')&&(q.id==='strategy'||q.id==='social'||q.id==='purchases')?8:0;
    const beginnerBoost=maturity==='Nous débutons'&&(q.id==='strategy'||q.id==='clients')?7:0;
    const quickWin=(4-(effort[q.id]||2))*3;
    const priorityScore=maturityGap+sectorFit+clientUrgency+sizeFactor+beginnerBoost+quickWin;
    return {...q,value:answers[q.id]??0,priorityScore,index,reasons:{maturityGap,sectorFit,clientUrgency,sizeFactor,quickWin}};
  }).sort((a,b)=>b.priorityScore-a.priorityScore||a.index-b.index);
}

export default function Diagnostic(){
  const [step,setStep]=useState(0);
  const [sector,setSector]=useState('');
  const [size,setSize]=useState('');
  const [maturity,setMaturity]=useState('');
  const [answers,setAnswers]=useState<Record<string,number>>({});

  const complete = sector && size && maturity;
  const answered = Object.keys(answers).length;
  const score = useMemo(()=> Math.round((Object.values(answers).reduce((a,b)=>a+b,0)/(questions.length*2))*100)||0,[answers]);
  const ranked = useMemo(()=>rankPriorities(answers,sector,size,maturity),[answers,sector,size,maturity]);
  const priorities=ranked.slice(0,3);

  function finish(){
    const result={sector,size,maturity,score,answers,priorities:priorities.map(p=>p.pillar),priorityScores:Object.fromEntries(ranked.map(p=>[p.pillar,p.priorityScore])),rankingVersion:'v2-contextual',date:new Date().toISOString()};
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
