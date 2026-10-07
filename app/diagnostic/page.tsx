'use client';
import {useMemo,useState} from 'react';
import {AlertCircle,ArrowLeft,ArrowRight,CheckCircle2,ClipboardCheck} from 'lucide-react';
import {supabase} from '../../lib/supabase';
import PilotageBar from '../../components/PilotageBar';

type Q={id:string;label:string;pillar:string;key:string};
const groups=[
  {pillar:'Stratégie & gouvernance',key:'strategy',questions:['Vos engagements et objectifs RSE sont-ils formalisés ?','Une personne est-elle clairement responsable du pilotage de la démarche RSE ?','Suivez-vous régulièrement des objectifs ou indicateurs RSE ?']},
  {pillar:'Environnement',key:'environment',questions:['Suivez-vous vos principaux impacts environnementaux (énergie, eau, déchets, émissions) ?','Avez-vous engagé des actions concrètes pour réduire vos consommations ou vos déchets ?','Mesurez-vous les résultats de vos actions environnementales ?']},
  {pillar:'Social & conditions de travail',key:'social',questions:['Avez-vous des actions structurées sur la santé, la sécurité ou les conditions de travail ?','Les compétences et besoins de formation de vos collaborateurs sont-ils suivis ?','Suivez-vous des indicateurs sociaux simples (absentéisme, turnover, accidents, formation) ?']},
  {pillar:'Achats responsables',key:'purchases',questions:['Intégrez-vous des critères RSE dans le choix de certains fournisseurs ?','Avez-vous formalisé vos attentes responsables auprès de vos fournisseurs ?','Évaluez-vous les risques ou performances RSE de vos fournisseurs stratégiques ?']},
  {pillar:'Ancrage territorial',key:'territory',questions:['Identifiez-vous vos principales parties prenantes locales ?','Votre entreprise mène-t-elle des actions ou partenariats avec son territoire ?','Savez-vous mesurer ou valoriser votre contribution locale (emplois, achats locaux, partenariats) ?']},
  {pillar:'Clients & marché',key:'clients',questions:['Pouvez-vous fournir facilement des preuves RSE à vos clients et donneurs d’ordre ?','Identifiez-vous les exigences RSE de vos principaux clients ou marchés ?','Valorisez-vous vos engagements RSE de manière factuelle dans vos offres ou réponses commerciales ?']}
];
const questions:Q[]=groups.flatMap(g=>g.questions.map((label,i)=>({id:g.key+'_'+(i+1),label,pillar:g.pillar,key:g.key})));
const levels=[{label:'Pas encore',value:0},{label:'En partie',value:1},{label:'Structuré',value:2}];
const sectorWeights:Record<string,Record<string,number>>={
  'Industrie':{environment:18,purchases:14,social:8,clients:8},
  'Commerce':{purchases:16,clients:14,social:8,environment:6},
  'Services':{social:14,clients:12,strategy:8,environment:4},
  'BTP':{environment:16,social:14,purchases:12,clients:8},
  'Transport & logistique':{environment:18,social:12,purchases:10,clients:8},
  'Autre':{strategy:8,clients:8,social:6,purchases:6}
};
const effort:Record<string,number>={strategy:2,environment:3,social:3,purchases:2,territory:1,clients:2};

function pillarAverage(answers:Record<string,number>,key:string){
  const qs=questions.filter(q=>q.key===key);
  return qs.reduce((s,q)=>s+(answers[q.id]??0),0)/qs.length;
}
function rankPriorities(answers:Record<string,number>,sector:string,size:string,maturity:string){
  const sw=sectorWeights[sector]||sectorWeights.Autre;
  return groups.map((g,index)=>{
    const avg=pillarAverage(answers,g.key);
    const maturityGap=(2-avg)*30;
    const sectorFit=sw[g.key]||0;
    const clientUrgency=g.key==='clients'?16:g.key==='strategy'?8:g.key==='purchases'?7:0;
    const sizeFactor=(size==='50–249'||size==='250+')&&(g.key==='strategy'||g.key==='social'||g.key==='purchases')?8:0;
    const beginnerBoost=maturity==='Nous débutons'&&(g.key==='strategy'||g.key==='clients')?7:0;
    const quickWin=(4-(effort[g.key]||2))*3;
    return{pillar:g.pillar,key:g.key,average:avg,priorityScore:Math.round(maturityGap+sectorFit+clientUrgency+sizeFactor+beginnerBoost+quickWin),index};
  }).sort((a,b)=>b.priorityScore-a.priorityScore||a.index-b.index);
}

export default function Diagnostic(){
  const[step,setStep]=useState(0);
  const[sector,setSector]=useState('');
  const[size,setSize]=useState('');
  const[maturity,setMaturity]=useState('');
  const[answers,setAnswers]=useState<Record<string,number>>({});
  const[saving,setSaving]=useState(false);
  const[saveError,setSaveError]=useState('');
  const complete=!!(sector&&size&&maturity);
  const answered=Object.keys(answers).length;
  const score=useMemo(()=>Math.round((Object.values(answers).reduce((a,b)=>a+b,0)/(questions.length*2))*100)||0,[answers]);
  const ranked=useMemo(()=>rankPriorities(answers,sector,size,maturity),[answers,sector,size,maturity]);
  const progressPct=step===0?0:Math.round(answered/questions.length*100);

  async function finish(){
    if(saving||answered!==18||!complete)return;
    setSaving(true);setSaveError('');
    let diagnosticId='';
    const pillarScores=Object.fromEntries(groups.map(g=>[g.pillar,Math.round(pillarAverage(answers,g.key)*50)]));
    const priorityScores=Object.fromEntries(ranked.map(p=>[p.pillar,p.priorityScore]));
    try{
      const{data:{user},error:userError}=await supabase.auth.getUser();
      if(userError)throw userError;if(!user)throw new Error('Votre session a expiré. Reconnectez-vous.');
      const{data:membership,error:membershipError}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();
      if(membershipError)throw membershipError;if(!membership)throw new Error("Aucune entreprise n’est associée à votre compte.");
      const{data:diagnostic,error:diagnosticError}=await supabase.from('diagnostics').insert({company_id:membership.company_id,created_by:user.id,score,sector,size_band:size,maturity,pillar_scores:pillarScores,priority_scores:priorityScores,ranking_version:'v3-18q-contextual'}).select('id').single();
      if(diagnosticError||!diagnostic)throw diagnosticError||new Error('Diagnostic non créé.');
      diagnosticId=diagnostic.id;
      const{error:answersError}=await supabase.from('diagnostic_answers').insert(questions.map(q=>({diagnostic_id:diagnostic.id,question_key:q.id,pillar:q.pillar,answer:answers[q.id]})));
      if(answersError)throw answersError;
      const top=ranked.slice(0,3);
      const{data:priorityRows,error:prioritiesError}=await supabase.from('priorities').insert(top.map((p,i)=>({company_id:membership.company_id,diagnostic_id:diagnostic.id,pillar:p.pillar,rank:i+1,score:p.priorityScore,title:p.pillar,rationale:'Priorité calculée selon votre maturité, votre secteur et l’effort estimé.'}))).select('id');
      if(prioritiesError||!priorityRows||priorityRows.length!==3)throw prioritiesError||new Error('Priorités non créées.');
      window.location.href='/priorities/';
    }catch(e:any){
      if(diagnosticId){
        await supabase.from('diagnostic_answers').delete().eq('diagnostic_id',diagnosticId);
        await supabase.from('priorities').delete().eq('diagnostic_id',diagnosticId);
        await supabase.from('diagnostics').delete().eq('id',diagnosticId);
      }
      setSaveError(e?.message?.includes('session')||e?.message?.includes('entreprise')?e.message:'Impossible de créer votre nouveau cycle RSE. Aucune donnée partielle n’a été conservée.');
      setSaving(false);
    }
  }

  return <div className="modulePage">
    <PilotageBar eyebrow="PILOTAGE" title="Diagnostic RSE" description="18 questions pour situer votre maturité et calculer vos 3 priorités. Le diagnostic ne crée plus automatiquement votre plan d’action."/>

    <div className="pilotageMetrics">
      <div><span>Étape</span><b>{step===0?'Cadrage':'Évaluation'}</b></div>
      <div><span>Réponses</span><b>{answered}/18</b></div>
      <div><span>Progression</span><b>{progressPct}%</b></div>
      <div><span>Score provisoire</span><b>{step===0?'—':score+'/100'}</b></div>
    </div>

    {saveError&&<div className="pilotageNotice"><AlertCircle/>{saveError}</div>}

    {step===0?<section className="diagCompact pilotagePanel">
      <div className="diagIntro"><ClipboardCheck/><div><span className="kicker">CADRAGE</span><h2>Votre entreprise</h2><p>Trois informations permettent d’adapter le calcul des priorités à votre contexte.</p></div></div>
      <div className="diagFields">
        <label>Secteur d’activité<select value={sector} onChange={e=>setSector(e.target.value)}><option value="">Sélectionner</option>{['Industrie','Commerce','Services','BTP','Transport & logistique','Autre'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Effectif<select value={size} onChange={e=>setSize(e.target.value)}><option value="">Sélectionner</option>{['1–9','10–49','50–249','250+'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Maturité actuelle<select value={maturity} onChange={e=>setMaturity(e.target.value)}><option value="">Sélectionner</option><option>Nous débutons</option><option>Quelques actions existent</option><option>Notre démarche est structurée</option></select></label>
      </div>
      <footer><span/><button className="pilotagePrimary" disabled={!complete} onClick={()=>setStep(1)}>Commencer les 18 questions <ArrowRight/></button></footer>
    </section>:<section className="diagnosticList pilotagePanel">
      <div className="diagnosticTop"><div><span className="kicker">18 QUESTIONS</span><h2>Évaluez simplement la situation actuelle.</h2></div><div className="diagProgress"><div className="pilotageProgress"><i style={{width:String(progressPct)+'%'}}/></div><b>{progressPct}%</b></div></div>
      {groups.map((g,gi)=><div className="diagGroup" key={g.key}>
        <div className="diagGroupTitle"><span>{String(gi+1).padStart(2,'0')}</span><b>{g.pillar}</b></div>
        {questions.filter(q=>q.key===g.key).map(q=><div className="diagRow" key={q.id}>
          <strong>{q.label}</strong>
          <div className="answerChoices">{levels.map(l=><button type="button" className={answers[q.id]===l.value?'selected':''} onClick={()=>setAnswers(a=>({...a,[q.id]:l.value}))} key={l.value}>{answers[q.id]===l.value&&<CheckCircle2/>}{l.label}</button>)}</div>
        </div>)}
      </div>)}
      <footer><button className="pilotageSecondary" disabled={saving} onClick={()=>setStep(0)}><ArrowLeft/> Modifier le cadrage</button><span>{answered}/18 réponses</span><button className="pilotagePrimary" disabled={answered!==18||saving} onClick={finish}>{saving?'Création du cycle…':'Calculer mes 3 priorités'} <ArrowRight/></button></footer>
    </section>}

    <style jsx>{`
      .diagCompact{padding:20px}.diagIntro{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #edf2f0}.diagIntro>svg{width:38px;height:38px;padding:9px;border-radius:10px;background:#edf7f2;color:#4d806a}.diagIntro h2{margin:2px 0 3px;font-size:19px}.diagIntro p{margin:0;color:#74898d;font-size:11px}.diagFields{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px 0}.diagFields label{display:grid;gap:6px;color:#536f75;font-size:10px;font-weight:850}.diagFields select{min-height:42px;border:1px solid #d7e4e0;border-radius:9px;background:#fff;color:#244c55;padding:0 10px}.diagCompact footer,.diagnosticList footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:14px;border-top:1px solid #edf2f0}.diagnosticList{overflow:hidden}.diagnosticTop{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:16px 18px;border-bottom:1px solid #e7eeec}.diagnosticTop h2{margin:2px 0 0;font-size:18px}.diagProgress{display:grid;grid-template-columns:160px 35px;gap:8px;align-items:center}.diagProgress b{font-size:10px}.diagGroup{border-bottom:1px solid #e7eeec}.diagGroup:last-of-type{border-bottom:0}.diagGroupTitle{display:flex;align-items:center;gap:9px;padding:10px 16px;background:#f7faf9}.diagGroupTitle span{width:26px;height:26px;border-radius:8px;background:#153b46;color:#fff;display:grid;place-items:center;font-size:9px;font-weight:900}.diagGroupTitle b{font-size:10px;color:#44636a}.diagRow{display:grid;grid-template-columns:minmax(280px,1.5fr) minmax(330px,1fr);gap:16px;align-items:center;padding:12px 16px;border-top:1px solid #f0f4f2}.diagRow strong{font-size:11px;color:#284f57;line-height:1.45}.answerChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.answerChoices button{min-height:34px;border:1px solid #dce7e4;border-radius:8px;background:#fff;color:#607980;font-size:9px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px}.answerChoices button.selected{background:#eaf6ef;color:#337252;border-color:#cde5d7}.answerChoices svg{width:12px}.diagnosticList footer{padding:14px 16px}.diagnosticList footer>span{font-size:10px;color:#74898d;font-weight:800}@media(max-width:800px){.diagFields{grid-template-columns:1fr}.diagRow{grid-template-columns:1fr}.diagnosticTop{align-items:flex-start;flex-direction:column}.diagProgress{width:100%;grid-template-columns:1fr 35px}}@media(max-width:560px){.answerChoices{grid-template-columns:1fr}.diagCompact footer,.diagnosticList footer{align-items:stretch;flex-direction:column}.diagCompact footer>*,.diagnosticList footer>*{width:100%;justify-content:center;text-align:center}}
    `}</style>
  </div>;
}
