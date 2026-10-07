'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {AlertCircle,ArrowRight,CheckCircle2,Circle,Compass,FileCheck2,FolderCheck,GraduationCap,LineChart,RotateCcw,Target} from 'lucide-react';
import {supabase} from '../../lib/supabase';
import {journeySteps} from '../../lib/journey';
import PilotageBar from '../../components/PilotageBar';

type StepState={id:number;progress:number;done:boolean};
const icons=[GraduationCap,Compass,Target,FileCheck2,LineChart];

export default function JourneyPage(){
  const[steps,setSteps]=useState<StepState[]>(journeySteps.map(s=>({id:s.id,progress:0,done:false})));
  const[ready,setReady]=useState(false);
  const[error,setError]=useState('');
  useEffect(()=>{(async()=>{try{
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;if(!user){setError('Votre session a expiré.');return}
    const{data:m,error:memberError}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();
    if(memberError)throw memberError;if(!m){setError('Aucune entreprise n’est associée à ce compte.');return}
    const companyId=m.company_id;let s1=0,s2=0,s3=0,s4=0,s5=0;
    const{data:req,error:reqError}=await supabase.from('learning_resources').select('id').eq('is_published',true).eq('is_required',true).eq('journey_step',1);
    if(reqError)throw reqError;
    const ids=(req||[]).map(x=>x.id);
    if(ids.length){
      const{data:p,error:learningError}=await supabase.from('learning_progress').select('resource_id,status').eq('company_id',companyId).eq('user_id',user.id).in('resource_id',ids);
      if(learningError)throw learningError;
      s1=Math.round((p||[]).filter(x=>x.status==='completed').length/ids.length*100);
    }
    const{data:d,error:diagError}=await supabase.from('diagnostics').select('id').eq('company_id',companyId).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(diagError)throw diagError;
    if(d){
      s2=100;
      const{data:pr,error:priorityError}=await supabase.from('priorities').select('id').eq('diagnostic_id',d.id).limit(3);
      if(priorityError)throw priorityError;
      s3=(pr||[]).length>=3?100:Math.round((pr||[]).length/3*100);
      const pids=(pr||[]).map(x=>x.id);
      if(pids.length){
        const{data:a,error:actionError}=await supabase.from('actions').select('id,status').in('priority_id',pids);
        if(actionError)throw actionError;
        const actions=a||[];
        const actionDone=actions.filter(x=>x.status==='done').length;
        const actionPct=actions.length?Math.round(actionDone/actions.length*70):0;
        const aids=actions.map(x=>x.id);
        let proofPct=0;
        if(aids.length){
          const{data:proofs,error:proofError}=await supabase.from('proofs').select('action_id').in('action_id',aids);
          if(proofError)throw proofError;
          const covered=new Set((proofs||[]).map(x=>x.action_id)).size;
          proofPct=actions.length?Math.round(covered/actions.length*30):0;
        }
        s4=Math.min(100,actionPct+proofPct);
        s5=s4===100?70:Math.round(s4*.5);
        const{data:snap,error:snapshotError}=await supabase.from('progress_snapshots').select('id').eq('company_id',companyId).eq('diagnostic_id',d.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
        if(snapshotError)throw snapshotError;
        if(snap&&s4===100)s5=100;
      }
    }
    setSteps([{id:1,progress:s1,done:s1===100},{id:2,progress:s2,done:s2===100},{id:3,progress:s3,done:s3===100},{id:4,progress:s4,done:s4===100},{id:5,progress:s5,done:s5===100}]);
  }catch{setError('Impossible de charger votre parcours RSE pour le moment.')}finally{setReady(true)}})()},[]);

  if(!ready)return <p>Chargement de votre parcours RSE…</p>;
  if(error)return <div className="modulePage"><PilotageBar eyebrow="PILOTAGE" title="Parcours RSE" description="Votre chemin de la compréhension au pilotage."/><div className="pilotageNotice"><AlertCircle/>{error}</div></div>;

  const current=steps.find(x=>!x.done)||steps[steps.length-1];
  const overall=Math.round(steps.reduce((a,b)=>a+b.progress,0)/steps.length);
  const doneCount=steps.filter(x=>x.done).length;

  return <div className="modulePage">
    <PilotageBar eyebrow="PILOTAGE" title="Parcours RSE" description="Visualisez votre avancement global et accédez directement à l’étape qui mérite votre attention." actions={<Link className="pilotagePrimary" href={journeySteps.find(s=>s.id===current.id)?.href||'/dashboard/'}>Continuer mon parcours <ArrowRight/></Link>}/>

    <div className="pilotageMetrics">
      <div><span>Avancement global</span><b>{overall}%</b></div>
      <div><span>Étapes terminées</span><b>{doneCount}/5</b></div>
      <div><span>Étape actuelle</span><b>{current.id}/5</b></div>
      <div><span>Prochaine action</span><b>{journeySteps.find(s=>s.id===current.id)?.title||'Terminé'}</b></div>
    </div>

    <div className="journeyCompact pilotagePanel">
      <div className="journeyHead"><span>Étape</span><span>Progression</span><span>Statut</span><span></span></div>
      {journeySteps.map((step,i)=>{
        const st=steps.find(x=>x.id===step.id)!;
        const Icon=icons[i];
        const state=st.done?'Terminé':step.id===current.id?'En cours':'À venir';
        return <article key={step.id} className={'journeyRow '+(step.id===current.id?'current ':'')+(st.done?'done':'')}>
          <div className="journeyMain">
            <span className="journeyIcon"><Icon/></span>
            <div><small>ÉTAPE {step.id}</small><h2>{step.title}</h2><p>{step.description}</p></div>
          </div>
          <div className="journeyProgress"><div className="pilotageProgress"><i style={{width:String(st.progress)+'%'}}/></div><b>{st.progress}%</b></div>
          <div><span className={'state '+(st.done?'doneState':step.id===current.id?'currentState':'')}>{st.done?<CheckCircle2/>:<Circle/>}{state}</span></div>
          <div className="journeyActions">
            {st.done
              ? <Link className="journeyButton secondary" href={step.href}><RotateCcw/> Revoir l’étape</Link>
              : <Link className={'journeyButton '+(step.id===current.id?'primary':'future')} href={step.href}><span>{step.cta}</span><ArrowRight/></Link>}
            {step.id===4&&<Link className="journeyButton proof" href="/proofs/"><FolderCheck/><span>Gérer mes preuves</span></Link>}
          </div>
        </article>
      })}
    </div>

    <style jsx>{`
      .journeyCompact{overflow:hidden}.journeyHead,.journeyRow{display:grid;grid-template-columns:minmax(340px,2.1fr) minmax(160px,.9fr) 115px minmax(210px,1fr);align-items:center}.journeyHead{min-height:36px;background:#f6f9f8;border-bottom:1px solid #e4ece9;color:#7b9093;font-size:8px;font-weight:900;text-transform:uppercase}.journeyHead span{padding:0 12px}.journeyRow{min-height:82px;border-bottom:1px solid #edf2f0;padding:10px 0}.journeyRow:last-child{border-bottom:0}.journeyRow.current{background:#f7fbfd}.journeyMain{display:grid;grid-template-columns:42px 1fr;gap:10px;padding:0 12px;min-width:0}.journeyIcon{width:36px;height:36px;border-radius:10px;background:#eef6f3;color:#4a8069;display:grid;place-items:center}.current .journeyIcon{background:#e9f6fb;color:#0797d5}.journeyIcon :global(svg){width:17px}.journeyMain small{font-size:8px;color:#789095;font-weight:900}.journeyMain h2{margin:2px 0 3px;font-size:15px}.journeyMain p{margin:0;color:#72878b;font-size:10px;line-height:1.4}.journeyProgress{display:grid;grid-template-columns:1fr 38px;gap:8px;align-items:center;padding:0 12px}.journeyProgress b{font-size:10px;color:#5f787e}.state{display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border-radius:999px;background:#f1f4f4;color:#74888c;font-size:8px;font-weight:850}.state :global(svg){width:12px}.currentState{background:#e8f6fb;color:#087faf}.doneState{background:#edf8f1;color:#3f7c59}.journeyActions{display:grid;gap:7px;padding:0 14px}.journeyButton{width:100%;min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:0 13px;text-decoration:none;font-size:10px;font-weight:900;line-height:1.15;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease,background .15s ease}.journeyButton:hover{transform:translateY(-1px)}.journeyButton span{min-width:0}.journeyButton :global(svg){width:15px;flex:0 0 auto}.journeyButton.primary{background:#0797d5;color:#fff;border:1px solid #0797d5;box-shadow:0 7px 16px rgba(7,151,213,.18)}.journeyButton.primary:hover{background:#0788c0;box-shadow:0 9px 19px rgba(7,151,213,.22)}.journeyButton.future{background:#153b46;color:#fff;border:1px solid #153b46;box-shadow:0 6px 14px rgba(21,59,70,.12)}.journeyButton.future:hover{background:#102f39}.journeyButton.secondary{background:#fff;color:#3f6f61;border:1px solid #cfe2da;box-shadow:0 3px 9px rgba(21,59,70,.05)}.journeyButton.secondary:hover{border-color:#afcfc1;background:#f9fcfb}.journeyButton.proof{background:#eef8f4;color:#327354;border:1px solid #cfe5db}.journeyButton.proof:hover{background:#e5f4ed}@media(max-width:850px){.journeyHead{display:none}.journeyRow{grid-template-columns:1fr 1fr;padding:13px}.journeyMain{grid-column:1/-1;padding:0 0 8px}.journeyProgress{padding:6px 0}.journeyActions{justify-content:flex-start;padding:6px 0}}@media(max-width:560px){.journeyRow{grid-template-columns:1fr}.journeyMain,.journeyProgress,.journeyActions{grid-column:1}}
    `}</style>
  </div>;
}
