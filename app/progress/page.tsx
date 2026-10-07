'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {Activity,AlertCircle,CheckCircle2,FolderCheck,RefreshCw,Target,TrendingUp} from 'lucide-react';
import {supabase} from '../../lib/supabase';
import PilotageBar from '../../components/PilotageBar';

type Snapshot={id:string;created_at:string;score:number;pillar_scores:Record<string,number>;actions_count:number;proofs_count:number};
type Result={id:string;score:number;pillarScores:Record<string,number>};
const pillars=['Stratégie & gouvernance','Environnement','Social & conditions de travail','Achats responsables','Ancrage territorial','Clients & marché'];

export default function Progress(){
  const[current,setCurrent]=useState<Result|null>(null);
  const[history,setHistory]=useState<Snapshot[]>([]);
  const[actions,setActions]=useState(0);
  const[totalActions,setTotalActions]=useState(0);
  const[proofs,setProofs]=useState(0);
  const[priorityCoverage,setPriorityCoverage]=useState(0);
  const[companyId,setCompanyId]=useState('');
  const[userId,setUserId]=useState('');
  const[coverage,setCoverage]=useState(0);
  const[loaded,setLoaded]=useState(false);
  const[accessError,setAccessError]=useState('');
  const[snapshotError,setSnapshotError]=useState('');
  const[saving,setSaving]=useState(false);
  const[priorityCount,setPriorityCount]=useState(0);

  useEffect(()=>{(async()=>{try{
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;if(!user){setAccessError('Votre session a expiré.');return}
    setUserId(user.id);
    const{data:m,error:membershipError}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();
    if(membershipError)throw membershipError;if(!m){setAccessError('Aucune entreprise n’est associée à ce compte.');return}
    setCompanyId(m.company_id);
    const{data:d,error:diagnosticError}=await supabase.from('diagnostics').select('id,score,pillar_scores').eq('company_id',m.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(diagnosticError)throw diagnosticError;if(!d)return;
    setCurrent({id:d.id,score:d.score,pillarScores:d.pillar_scores||{}});
    const{data:priorities,error:priorityError}=await supabase.from('priorities').select('id').eq('diagnostic_id',d.id).order('rank').limit(3);
    if(priorityError)throw priorityError;
    const priorityIds=(priorities||[]).map(p=>p.id);
    setPriorityCount(priorityIds.length);
    let currentActions:any[]=[];
    if(priorityIds.length){
      const{data,error}=await supabase.from('actions').select('id,status,priority_id').in('priority_id',priorityIds);
      if(error)throw error;currentActions=data||[];
    }
    const actionIds=currentActions.map(a=>a.id);
    const done=currentActions.filter(a=>a.status==='done').length;
    let currentProofs:any[]=[];
    if(actionIds.length){
      const{data,error}=await supabase.from('proofs').select('id,pillar,action_id').in('action_id',actionIds);
      if(error)throw error;currentProofs=data||[];
    }
    const proofActionIds=new Set(currentProofs.map(x=>x.action_id).filter(Boolean));
    const coveredPriorityIds=new Set(currentActions.filter(a=>a.status==='done'||proofActionIds.has(a.id)).map(a=>a.priority_id).filter(Boolean));
    const{data:h,error:historyError}=await supabase.from('progress_snapshots').select('id,created_at,score,pillar_scores,actions_count,proofs_count').eq('company_id',m.company_id).eq('diagnostic_id',d.id).order('created_at',{ascending:false}).limit(12);
    if(historyError)throw historyError;
    setActions(done);setTotalActions(currentActions.length);setProofs(currentProofs.length);setCoverage(new Set(currentProofs.map(x=>x.pillar)).size);setPriorityCoverage(coveredPriorityIds.size);setHistory(((h||[]) as Snapshot[]).reverse());
  }catch{setAccessError('Impossible de charger votre progression pour le moment.')}finally{setLoaded(true)}})()},[]);

  const pct=useMemo(()=>totalActions?Math.round(actions/totalActions*100):0,[actions,totalActions]);
  const evidencePct=Math.round(coverage/6*100);
  const priorityPct=Math.round(priorityCoverage/3*100);
  const executionScore=current?Math.round(current.score*.55+pct*.25+evidencePct*.10+priorityPct*.10):0;
  const baseline=history[0];
  const delta=baseline?executionScore-baseline.score:0;

  async function snapshot(){
    if(!current||!companyId||!userId||saving||totalActions===0)return;
    setSaving(true);setSnapshotError('');
    const pillarScores={...current.pillarScores,'Avancement du plan':pct,'Couverture des preuves':evidencePct,'Couverture des priorités':priorityPct};
    const{data,error}=await supabase.from('progress_snapshots').insert({company_id:companyId,diagnostic_id:current.id,score:executionScore,pillar_scores:pillarScores,actions_count:actions,proofs_count:proofs,created_by:userId}).select('id,created_at,score,pillar_scores,actions_count,proofs_count').single();
    if(error)setSnapshotError('Le point de suivi n’a pas pu être enregistré.');
    else if(data)setHistory(h=>[...h,data as Snapshot].slice(-12));
    setSaving(false);
  }

  if(!loaded)return <p>Chargement de votre progression…</p>;
  if(accessError)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Ma progression" description="Suivez l’évolution de votre cycle RSE."/><div className="pilotageNotice"><AlertCircle/>{accessError}</div></div>;
  if(!current)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Ma progression" description="Suivez l’évolution de votre cycle RSE." actions={<Link className="pilotagePrimary" href="/diagnostic/">Lancer le diagnostic</Link>}/><div className="pilotageEmpty"><TrendingUp/><h2>Le suivi commencera après le diagnostic.</h2><p>Votre progression sera calculée uniquement à partir de vos données réelles.</p></div></div>;
  if(priorityCount<3)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Ma progression" description="Suivez l’évolution de votre cycle RSE." actions={<Link className="pilotagePrimary" href="/diagnostic/">Recalculer mon cycle</Link>}/><div className="pilotageEmpty"><Target/><h2>Le cycle doit disposer de ses 3 priorités.</h2></div></div>;

  return <div className="modulePage">
    <PilotageBar eyebrow="PILOTAGE" title="Ma progression" description="Mesurez l’exécution du plan, la couverture des preuves et l’évolution de votre maturité." actions={<>
      <button className="pilotageSecondary" disabled={saving||totalActions===0} onClick={snapshot}>{saving?'Enregistrement…':'Enregistrer un point'}</button>
      <Link className="pilotagePrimary" href="/diagnostic/"><RefreshCw/> Nouveau diagnostic</Link>
    </>}/>

    {snapshotError&&<div className="pilotageNotice"><AlertCircle/>{snapshotError}</div>}

    <div className="pilotageMetrics">
      <div><span>Indice de progression</span><b>{executionScore}/100</b></div>
      <div><span>Plan réalisé</span><b>{pct}%</b></div>
      <div><span>Priorités couvertes</span><b>{priorityCoverage}/3</b></div>
      <div><span>Preuves disponibles</span><b>{proofs}</b></div>
    </div>

    <div className="progressGrid">
      <section className="pilotagePanel scoreCard">
        <div className="scoreTop"><div className="pilotageScoreRing" style={{'--pct':String(executionScore)+'%'} as React.CSSProperties}><b>{executionScore}</b></div><div><span className="kicker">INDICE GLOBAL</span><h2>Progression du cycle</h2><p>{baseline?(delta>=0?'+':'')+delta+' point'+(Math.abs(delta)>1?'s':'')+' depuis le premier suivi':'Créez un premier point de suivi pour mesurer l’évolution.'}</p></div></div>
        <div className="scoreBreakdown">
          <div><span>Maturité</span><b>{current.score}/100</b><i><em style={{width:String(current.score)+'%'}}/></i></div>
          <div><span>Plan 90 jours</span><b>{actions}/{totalActions}</b><i><em style={{width:String(pct)+'%'}}/></i></div>
          <div><span>Couverture preuves</span><b>{evidencePct}%</b><i><em style={{width:String(evidencePct)+'%'}}/></i></div>
          <div><span>Priorités couvertes</span><b>{priorityPct}%</b><i><em style={{width:String(priorityPct)+'%'}}/></i></div>
        </div>
      </section>

      <section className="pilotagePanel pillarCard">
        <div className="sectionMiniHead"><div><span className="kicker">6 PILIERS</span><h2>Maturité actuelle</h2></div><Activity/></div>
        <div className="pillarCompact">{pillars.map(p=>{const s=current.pillarScores[p]??0;return <div key={p}><span>{p}</span><div className="pilotageProgress"><i style={{width:String(s)+'%'}}/></div><b>{s}</b></div>})}</div>
      </section>
    </div>

    <div className="pilotageSectionHead"><div><span className="kicker">HISTORIQUE</span><h2>Points de suivi du cycle</h2><p>Conservez des jalons pour visualiser votre progression réelle dans le temps.</p></div></div>

    {history.length?<div className="historyTable pilotagePanel">
      <div className="historyHead"><span>Date</span><span>Indice</span><span>Actions réalisées</span><span>Preuves</span></div>
      {[...history].reverse().map(h=><article key={h.id}><span>{new Date(h.created_at).toLocaleDateString('fr-FR')}</span><b>{h.score}/100</b><span>{h.actions_count}/{totalActions}</span><span>{h.proofs_count}</span></article>)}
    </div>:<div className="pilotageEmpty"><TrendingUp/><h2>Aucun point de suivi enregistré</h2><p>Enregistrez votre situation actuelle pour créer votre point de départ.</p><button className="pilotagePrimary" disabled={saving||totalActions===0} onClick={snapshot}>Créer mon point de départ</button></div>}

    <style jsx>{`
      .progressGrid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:12px}.scoreCard,.pillarCard{padding:18px}.scoreTop{display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid #edf2f0}.scoreTop h2{margin:2px 0 3px;font-size:18px}.scoreTop p{margin:0;color:#73888c;font-size:10px}.scoreBreakdown{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px}.scoreBreakdown>div{display:grid;grid-template-columns:1fr auto;gap:6px}.scoreBreakdown span{font-size:9px;color:#71868b}.scoreBreakdown b{font-size:10px}.scoreBreakdown i{grid-column:1/-1;height:6px;background:#eaf0ee;border-radius:999px;overflow:hidden}.scoreBreakdown em{display:block;height:100%;background:#64aa86}.sectionMiniHead{display:flex;justify-content:space-between;align-items:center}.sectionMiniHead h2{margin:2px 0 0;font-size:18px}.sectionMiniHead>svg{width:20px;color:#64aa86}.pillarCompact{display:grid;gap:10px;margin-top:15px}.pillarCompact>div{display:grid;grid-template-columns:145px 1fr 28px;align-items:center;gap:8px}.pillarCompact span{font-size:9px;color:#5f787e}.pillarCompact b{font-size:9px;text-align:right}.historyTable{overflow:hidden}.historyHead,.historyTable article{display:grid;grid-template-columns:1.1fr .7fr 1fr .7fr;align-items:center}.historyHead{min-height:36px;background:#f6f9f8;border-bottom:1px solid #e4ece9;color:#7b9093;font-size:8px;font-weight:900;text-transform:uppercase}.historyHead span,.historyTable article>*{padding:0 12px}.historyTable article{min-height:48px;border-bottom:1px solid #edf2f0;color:#607980;font-size:10px}.historyTable article:last-child{border-bottom:0}.historyTable article b{color:#153b46;font-size:11px}@media(max-width:900px){.progressGrid{grid-template-columns:1fr}}@media(max-width:560px){.scoreBreakdown{grid-template-columns:1fr}.pillarCompact>div{grid-template-columns:115px 1fr 24px}.historyHead{display:none}.historyTable article{grid-template-columns:1fr 1fr;gap:7px;padding:10px}.historyTable article>*{padding:0}}
    `}</style>
  </div>;
}
