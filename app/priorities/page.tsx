'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowRight,Target,Clock,Gauge,CheckCircle2,AlertCircle} from 'lucide-react';
import {supabase} from '../../lib/supabase';
type Result={score:number;sector:string;size:string;maturity:string;priorities:string[]};
const library:Record<string,{title:string;why:string;action:string;time:string;impact:string;proof:string}>={'Stratégie & gouvernance':{title:'Formaliser vos engagements RSE',why:'Donnez un cap clair à votre démarche et rendez vos engagements lisibles pour vos parties prenantes.',action:'Créer une politique RSE courte et opérationnelle',time:'2 h',impact:'Fort',proof:'Politique RSE validée'},'Environnement':{title:'Mesurer vos impacts environnementaux',why:'Commencez par quelques données utiles pour cibler les réductions les plus pertinentes.',action:'Sélectionner 3 indicateurs environnementaux',time:'2 h',impact:'Fort',proof:'Tableau de suivi des indicateurs'},'Social & conditions de travail':{title:'Structurer votre feuille de route sociale',why:'Transformez vos pratiques RH existantes en engagements suivis et démontrables.',action:'Formaliser vos actions sociales prioritaires',time:'2 h',impact:'Fort',proof:'Plan d’action social'},'Achats responsables':{title:'Structurer vos achats responsables',why:'Réduisez les risques fournisseurs et valorisez vos pratiques auprès de vos clients.',action:'Créer une charte fournisseurs responsables',time:'3 h',impact:'Fort',proof:'Charte fournisseurs'},'Ancrage territorial':{title:'Valoriser votre contribution locale',why:'Identifiez vos partenariats, emplois et actions locales pour rendre votre impact territorial visible.',action:'Cartographier vos actions et partenaires locaux',time:'1 h',impact:'Moyen',proof:'Cartographie territoriale'},'Clients & marché':{title:'Préparer vos preuves RSE clients',why:'Centralisez les éléments attendus dans les questionnaires et appels d’offres de vos clients.',action:'Constituer votre dossier de preuves RSE',time:'2 h',impact:'Très fort',proof:'Dossier de preuves client'}};
export default function Priorities(){const[result,setResult]=useState<Result|null>(null);const[loaded,setLoaded]=useState(false);const[error,setError]=useState('');useEffect(()=>{(async()=>{try{const {data:{user},error:userError}=await supabase.auth.getUser();if(userError)throw userError;if(!user){setError('Votre session a expiré.');return}const {data:m,error:membershipError}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();if(membershipError)throw membershipError;if(!m){setError('Aucune entreprise n’est associée à ce compte.');return}const {data:d,error:diagnosticError}=await supabase.from('diagnostics').select('id,score,sector,size_band,maturity').eq('company_id',m.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(diagnosticError)throw diagnosticError;if(!d)return;const {data:p,error:priorityError}=await supabase.from('priorities').select('pillar').eq('diagnostic_id',d.id).order('rank').limit(3);if(priorityError)throw priorityError;setResult({score:d.score,sector:d.sector||'',size:d.size_band||'',maturity:d.maturity||'',priorities:(p||[]).map(x=>x.pillar)})}catch{setError('Impossible de charger vos priorités pour le moment.')}finally{setLoaded(true)}})()},[]);if(!loaded)return <p>Chargement de vos priorités…</p>;if(error)return <div className="modulePage"><span className="kicker">MES 3 PRIORITÉS</span><h1>Nous ne pouvons pas afficher vos priorités.</h1><p className="actionLead">{error}</p><div className="nextStep"><div><AlertCircle/><b>Vos données ne sont pas remplacées par des exemples.</b></div><Link className="button" href="/dashboard/">Retour au tableau de bord</Link></div></div>;if(!result)return <div className="modulePage"><span className="kicker">MES 3 PRIORITÉS</span><h1>Commencez par votre diagnostic RSE.</h1><p className="actionLead">Vos trois priorités seront calculées à partir de votre situation réelle.</p><Link className="button" href="/diagnostic/">Lancer mon diagnostic RSE →</Link></div>;if(result.priorities.length<3)return <div className="modulePage"><span className="kicker">MES 3 PRIORITÉS</span><h1>Votre diagnostic est enregistré, mais vos priorités doivent être recalculées.</h1><p className="actionLead">Le cycle actuel est incomplet. Relancez le diagnostic pour générer une feuille de route cohérente, sans mélanger des données partielles.</p><Link className="button" href="/diagnostic/">Relancer mon diagnostic →</Link></div>;return <div className="modulePage"><div className="moduleHead"><span className="kicker">MES 3 PRIORITÉS</span><h1>Concentrez-vous sur ce qui compte maintenant.</h1><p className="actionLead">À partir de votre diagnostic, trois sujets sont sélectionnés en priorité. L’objectif n’est pas de tout faire : c’est d’avancer dans le bon ordre.</p></div><div className="priorityFocus">{result.priorities.slice(0,3).map((pillar,i)=>{const p=library[pillar];if(!p)return null;return <article key={pillar}><div className="priorityFocusTop"><span className="priorityRank">{String(i+1).padStart(2,'0')}</span><span className="pill">{i===0?'À démarrer maintenant':'À planifier'}</span></div><span className="actionPillar">{pillar}</span><h2>{p.title}</h2><p>{p.why}</p><div className="priorityWhy"><b>Pourquoi maintenant ?</b><span>Votre diagnostic indique que ce sujet fait partie de vos marges de progression les plus importantes.</span></div><div className="priorityFacts"><span><Gauge/>Impact <b>{p.impact}</b></span><span><Clock/>Effort <b>{p.time}</b></span><span><CheckCircle2/>Preuve <b>{p.proof}</b></span></div><div className="recommendedAction"><Target/><div><small>ACTION RECOMMANDÉE</small><b>{p.action}</b></div></div><Link className="priorityAction" href="/atelier/">Travailler cette priorité dans l’Atelier <ArrowRight/></Link></article>})}</div><div className="nextStep"><div><span className="kicker">ÉTAPE SUIVANTE</span><h2>Transformez une priorité en action concrète dans l’Atelier.</h2></div><Link className="button" href="/atelier/">Ouvrir l’Atelier RSE <ArrowRight/></Link></div>
<style jsx>{`
.priorityFocus{
  display:grid;
  gap:18px;
  margin-top:22px;
}
.priorityFocus article{
  position:relative;
  overflow:hidden;
  padding:28px 28px 24px;
  border:1px solid #dce8e3;
  border-radius:22px;
  background:#fff;
  box-shadow:0 12px 36px rgba(23,63,71,.055);
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
}
.priorityFocus article:hover{
  transform:translateY(-2px);
  border-color:#c7ddd4;
  box-shadow:0 18px 42px rgba(23,63,71,.085);
}
.priorityFocus article:before{
  content:"";
  position:absolute;
  left:0;
  top:24px;
  bottom:24px;
  width:4px;
  border-radius:0 4px 4px 0;
  background:linear-gradient(180deg,#2f7b5f,#84cba4);
}
.priorityFocusTop{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:5px;
}
.priorityRank{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:36px;
  height:36px;
  border-radius:11px;
  background:#173f47;
  color:#fff;
  font:700 15px Georgia,serif;
  letter-spacing:.2px;
}
.priorityFocus .pill{
  display:inline-flex;
  align-items:center;
  min-height:28px;
  padding:6px 10px;
  border-radius:999px;
  background:#eaf7ef;
  color:#2d7756;
  font-size:9px;
  font-weight:900;
  letter-spacing:.55px;
}
.priorityFocus .actionPillar{
  display:block;
  margin:4px 0 10px 46px;
  color:#4a9b71;
  font-size:9px;
  font-weight:900;
  letter-spacing:1.25px;
  text-transform:uppercase;
}
.priorityFocus h2{
  margin:12px 0 8px;
  color:#173f47;
  font-size:clamp(24px,2.4vw,31px);
  line-height:1.12;
  letter-spacing:-.35px;
}
.priorityFocus article>p{
  max-width:900px;
  margin:0;
  color:#667b75;
  font-size:14px;
  line-height:1.65;
}
.priorityWhy{
  display:grid;
  grid-template-columns:150px 1fr;
  gap:14px;
  align-items:start;
  margin-top:18px;
  padding:14px 16px;
  border-radius:12px;
  background:#f7faf8;
  border:1px solid #e4ece8;
}
.priorityWhy b{
  color:#173f47;
  font-size:11px;
}
.priorityWhy span{
  color:#6f817b;
  font-size:11px;
  line-height:1.55;
}
.priorityFacts{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
  margin-top:14px;
}
.priorityFacts span{
  display:flex;
  align-items:center;
  gap:7px;
  min-height:44px;
  padding:10px 12px;
  border:1px solid #e0e9e5;
  border-radius:11px;
  background:#fff;
  color:#6c817a;
  font-size:10px;
}
.priorityFacts svg{
  flex:0 0 auto;
  width:16px;
  height:16px;
  color:#3f7f65;
}
.priorityFacts b{
  margin-left:auto;
  color:#173f47;
  font-size:10px;
  text-align:right;
}
.priorityFocus .recommendedAction{
  display:flex;
  align-items:center;
  gap:13px;
  margin-top:16px;
  padding:15px 16px;
  border:1px solid #cfe5d9;
  border-radius:14px;
  background:linear-gradient(135deg,#f3faf6,#eaf6ef);
  color:#173f47;
}
.priorityFocus .recommendedAction>svg{
  flex:0 0 auto;
  width:38px;
  height:38px;
  padding:9px;
  border-radius:11px;
  background:#173f47;
  color:#fff;
}
.priorityFocus .recommendedAction>div{
  display:grid;
  gap:3px;
}
.priorityFocus .recommendedAction small{
  color:#5c806f;
  font-size:8px;
  font-weight:900;
  letter-spacing:1px;
}
.priorityFocus .recommendedAction b{
  color:#173f47;
  font-size:13px;
  line-height:1.35;
}
.priorityFocus .priorityAction{
  display:inline-flex;
  align-items:center;
  gap:7px;
  margin-top:15px;
  padding:9px 0;
  color:#1689bd;
  font-size:12px;
  font-weight:900;
  text-decoration:none;
  transition:gap .18s ease,color .18s ease;
}
.priorityFocus .priorityAction:hover{
  gap:10px;
  color:#0f6f9a;
}
.priorityFocus .priorityAction svg{
  width:15px;
  height:15px;
}
@media(max-width:760px){
  .priorityFocus article{
    padding:22px 18px 20px;
  }
  .priorityFocus .actionPillar{
    margin-left:0;
  }
  .priorityWhy{
    grid-template-columns:1fr;
    gap:5px;
  }
  .priorityFacts{
    grid-template-columns:1fr;
  }
  .priorityFacts b{
    margin-left:auto;
  }
}
`}</style></div>}