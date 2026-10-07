'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {AlertCircle,ArrowRight,CheckCircle2,Clock,Gauge,RefreshCw,Target} from 'lucide-react';
import {supabase} from '../../lib/supabase';
import PilotageBar from '../../components/PilotageBar';

type Result={score:number;sector:string;size:string;maturity:string;priorities:string[]};
const library:Record<string,{title:string;why:string;action:string;time:string;impact:string;proof:string}>={
  'Stratégie & gouvernance':{title:'Formaliser vos engagements RSE',why:'Donnez un cap clair à votre démarche et rendez vos engagements lisibles pour vos parties prenantes.',action:'Créer une politique RSE courte et opérationnelle',time:'2 h',impact:'Fort',proof:'Politique RSE validée'},
  'Environnement':{title:'Mesurer vos impacts environnementaux',why:'Commencez par quelques données utiles pour cibler les réductions les plus pertinentes.',action:'Sélectionner 3 indicateurs environnementaux',time:'2 h',impact:'Fort',proof:'Tableau de suivi des indicateurs'},
  'Social & conditions de travail':{title:'Structurer votre feuille de route sociale',why:'Transformez vos pratiques RH existantes en engagements suivis et démontrables.',action:'Formaliser vos actions sociales prioritaires',time:'2 h',impact:'Fort',proof:'Plan d’action social'},
  'Achats responsables':{title:'Structurer vos achats responsables',why:'Réduisez les risques fournisseurs et valorisez vos pratiques auprès de vos clients.',action:'Créer une charte fournisseurs responsables',time:'3 h',impact:'Fort',proof:'Charte fournisseurs'},
  'Ancrage territorial':{title:'Valoriser votre contribution locale',why:'Identifiez vos partenariats, emplois et actions locales pour rendre votre impact territorial visible.',action:'Cartographier vos actions et partenaires locaux',time:'1 h',impact:'Moyen',proof:'Cartographie territoriale'},
  'Clients & marché':{title:'Préparer vos preuves RSE clients',why:'Centralisez les éléments attendus dans les questionnaires et appels d’offres de vos clients.',action:'Constituer votre dossier de preuves RSE',time:'2 h',impact:'Très fort',proof:'Dossier de preuves client'}
};

export default function Priorities(){
  const[result,setResult]=useState<Result|null>(null);
  const[loaded,setLoaded]=useState(false);
  const[error,setError]=useState('');
  useEffect(()=>{(async()=>{try{
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;if(!user){setError('Votre session a expiré.');return}
    const{data:m,error:membershipError}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();
    if(membershipError)throw membershipError;if(!m){setError('Aucune entreprise n’est associée à ce compte.');return}
    const{data:d,error:diagnosticError}=await supabase.from('diagnostics').select('id,score,sector,size_band,maturity').eq('company_id',m.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(diagnosticError)throw diagnosticError;if(!d)return;
    const{data:p,error:priorityError}=await supabase.from('priorities').select('pillar').eq('diagnostic_id',d.id).order('rank').limit(3);
    if(priorityError)throw priorityError;
    setResult({score:d.score,sector:d.sector||'',size:d.size_band||'',maturity:d.maturity||'',priorities:(p||[]).map(x=>x.pillar)});
  }catch{setError('Impossible de charger vos priorités pour le moment.')}finally{setLoaded(true)}})()},[]);

  if(!loaded)return <p>Chargement de vos priorités…</p>;
  if(error)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Mes 3 priorités" description="Les sujets à traiter en premier à partir de votre dernier diagnostic."/><div className="pilotageNotice"><AlertCircle/>{error}</div></div>;
  if(!result)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Mes 3 priorités" description="Les sujets à traiter en premier à partir de votre dernier diagnostic." actions={<Link className="pilotagePrimary" href="/diagnostic/">Lancer le diagnostic</Link>}/><div className="pilotageEmpty"><Target/><h2>Aucune priorité calculée</h2><p>Réalisez votre diagnostic RSE pour obtenir trois priorités adaptées à votre entreprise.</p></div></div>;

  return <div className="modulePage">
    <PilotageBar eyebrow="PILOTAGE" title="Mes 3 priorités" description="Trois sujets issus de votre diagnostic. L’objectif est de concentrer vos efforts, pas de tout traiter en même temps." actions={<Link className="pilotageSecondary" href="/diagnostic/"><RefreshCw/> Refaire le diagnostic</Link>}/>

    <div className="pilotageMetrics">
      <div><span>Score diagnostic</span><b>{result.score}/100</b></div>
      <div><span>Secteur</span><b>{result.sector||'—'}</b></div>
      <div><span>Taille</span><b>{result.size||'—'}</b></div>
      <div><span>Maturité</span><b>{result.maturity||'—'}</b></div>
    </div>

    <div className="priorityList pilotagePanel">
      <div className="priorityHead"><span>Priorité</span><span>Impact</span><span>Effort</span><span>Preuve attendue</span><span></span></div>
      {result.priorities.slice(0,3).map((pillar,i)=>{
        const p=library[pillar];if(!p)return null;
        return <article key={pillar} className="priorityRow">
          <div className="priorityMain">
            <span className="priorityRank">{i+1}</span>
            <div><small>{pillar}</small><h2>{p.title}</h2><p>{p.why}</p><div className="recommended"><Target/><span><small>ACTION RECOMMANDÉE</small><b>{p.action}</b></span></div></div>
          </div>
          <div className="priorityFact"><Gauge/><b>{p.impact}</b></div>
          <div className="priorityFact"><Clock/><b>{p.time}</b></div>
          <div className="priorityFact proof"><CheckCircle2/><b>{p.proof}</b></div>
          <div className="priorityLinks"><Link href="/actions/">Plan d’action <ArrowRight/></Link><Link href="/atelier/">Atelier</Link></div>
        </article>
      })}
    </div>

    <div className="pilotageSectionHead"><div><span className="kicker">ÉTAPE SUIVANTE</span><h2>Transformez vos priorités en actions pilotables.</h2><p>Vous pouvez générer une base de plan ou créer vos actions manuellement.</p></div><Link className="pilotagePrimary" href="/actions/">Ouvrir le plan d’action <ArrowRight/></Link></div>

    <style jsx>{`
      .priorityList{overflow:hidden}.priorityHead,.priorityRow{display:grid;grid-template-columns:minmax(360px,2.4fr) 90px 90px minmax(170px,1fr) 150px;align-items:center}.priorityHead{min-height:36px;background:#f6f9f8;border-bottom:1px solid #e4ece9;color:#7b9093;font-size:8px;font-weight:900;text-transform:uppercase}.priorityHead span{padding:0 12px}.priorityRow{border-bottom:1px solid #edf2f0;padding:14px 0}.priorityRow:last-child{border-bottom:0}.priorityMain{display:grid;grid-template-columns:42px 1fr;gap:10px;padding:0 12px;min-width:0}.priorityRank{width:34px;height:34px;border-radius:9px;background:#153b46;color:#fff;display:grid;place-items:center;font-weight:900}.priorityMain small{font-size:8px;color:#64aa86;font-weight:900;text-transform:uppercase;letter-spacing:.6px}.priorityMain h2{margin:3px 0 4px;font-size:16px}.priorityMain p{margin:0;color:#72878b;font-size:10px;line-height:1.45}.recommended{margin-top:8px;display:flex;align-items:center;gap:7px}.recommended>svg{width:14px;color:#64aa86}.recommended span{display:grid}.recommended span small{color:#7a8f93}.recommended b{font-size:10px;color:#294f57}.priorityFact{display:flex;gap:6px;align-items:center;padding:0 10px;color:#607a80;font-size:10px}.priorityFact svg{width:14px;color:#86a09d}.priorityFact b{font-size:10px}.priorityFact.proof b{white-space:normal}.priorityLinks{display:flex;justify-content:flex-end;gap:6px;padding:0 10px;flex-wrap:wrap}.priorityLinks a{display:inline-flex;align-items:center;gap:4px;border:1px solid #dce7e4;border-radius:8px;padding:7px 8px;color:#45666e;text-decoration:none;font-size:9px;font-weight:850}.priorityLinks a:first-child{background:#edf7fb;color:#087faf;border-color:#d0e9f3}.priorityLinks svg{width:12px}@media(max-width:900px){.priorityHead{display:none}.priorityRow{grid-template-columns:1fr 1fr 1fr;padding:14px}.priorityMain{grid-column:1/-1;padding:0 0 10px}.priorityFact{padding:6px 0}.priorityLinks{grid-column:1/-1;justify-content:flex-start;padding:7px 0 0}}@media(max-width:620px){.priorityRow{grid-template-columns:1fr}.priorityFact,.priorityLinks{grid-column:1}.priorityLinks a{flex:1;justify-content:center}}
    `}</style>
  </div>;
}
