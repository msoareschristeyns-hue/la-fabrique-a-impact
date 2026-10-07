'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {AlertCircle,BookOpen,CalendarDays,CheckCircle2,Circle,FolderCheck,Gauge,Pencil,Plus,Save,Search,Sparkles,Trash2,UserRound,X} from 'lucide-react';
import {supabase} from '../../lib/supabase';
import {buildActionRows} from '../../lib/actionPlan';
import {resources} from '../../lib/library';
import {recommendLibrary} from '../../lib/libraryRecommendations';
import PilotageBar from '../../components/PilotageBar';

type Status='todo'|'in_progress'|'done';
type MemberRole='owner'|'admin'|'member'|'advisor'|'';
type Row={id:string;title:string;description:string|null;pillar:string|null;phase:string|null;owner_name:string|null;due_date:string|null;expected_proof:string|null;impact:string|null;status:Status;priority_id:string|null};
type Priority={id:string;pillar:string;rank:number};
type CompanyContext={sector:string;size:string;maturity:string;priorities:string[]};
type Draft={id?:string;title:string;description:string;priority_id:string;pillar:string;phase:string;owner_name:string;due_date:string;expected_proof:string;impact:string;status:Status};

const phases=[
  {value:'0',label:'0–30 jours',short:'J+30',day:30},
  {value:'1',label:'31–60 jours',short:'J+60',day:60},
  {value:'2',label:'61–90 jours',short:'J+90',day:90},
];
const pillars=['Stratégie & gouvernance','Environnement','Social & conditions de travail','Achats responsables','Ancrage territorial','Clients & marché'];
const impacts=['Faible','Moyen','Fort','Très fort'];
const statuses:{value:Status;label:string}[]=[{value:'todo',label:'À faire'},{value:'in_progress',label:'En cours'},{value:'done',label:'Fait'}];

function normalizePhase(value:string|null|number|undefined){
  if(value===null||value===undefined||value==='')return'0';
  const raw=String(value);
  if(raw==='0'||raw==='1'||raw==='2')return raw;
  if(raw.includes('30'))return'0';
  if(raw.includes('60'))return'1';
  if(raw.includes('90'))return'2';
  return'0';
}
function addDaysISO(days:number){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function makeDraft(priority?:Priority):Draft{return{title:'',description:'',priority_id:priority?.id||'',pillar:priority?.pillar||pillars[0],phase:'0',owner_name:'',due_date:'',expected_proof:'',impact:'Fort',status:'todo'}}

export default function Actions(){
  const[rows,setRows]=useState<Row[]>([]);
  const[priorities,setPriorities]=useState<Priority[]>([]);
  const[loaded,setLoaded]=useState(false);
  const[error,setError]=useState('');
  const[notice,setNotice]=useState('');
  const[companyId,setCompanyId]=useState('');
  const[userId,setUserId]=useState('');
  const[memberRole,setMemberRole]=useState<MemberRole>('');
  const[hasDiagnostic,setHasDiagnostic]=useState(false);
  const[context,setContext]=useState<CompanyContext>({sector:'',size:'',maturity:'',priorities:[]});
  const[query,setQuery]=useState('');
  const[statusFilter,setStatusFilter]=useState<'all'|Status>('all');
  const[phaseFilter,setPhaseFilter]=useState('all');
  const[pillarFilter,setPillarFilter]=useState('all');
  const[editorOpen,setEditorOpen]=useState(false);
  const[saving,setSaving]=useState(false);
  const[draft,setDraft]=useState<Draft>(makeDraft());

  useEffect(()=>{(async()=>{try{
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;
    if(!user){setError('Votre session a expiré.');return}
    setUserId(user.id);
    const{data:m,error:membershipError}=await supabase.from('company_members').select('company_id,role,companies(sector,size_band)').eq('user_id',user.id).limit(1).maybeSingle();
    if(membershipError)throw membershipError;
    if(!m){setError('Aucune entreprise n’est associée à ce compte.');return}
    const membership:any=m;
    setCompanyId(membership.company_id);
    setMemberRole((membership.role||'') as MemberRole);
    const company:any=membership.companies||{};
    const{data:d,error:diagnosticError}=await supabase.from('diagnostics').select('id,maturity').eq('company_id',membership.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(diagnosticError)throw diagnosticError;
    let priorityRows:Priority[]=[];
    if(d){
      setHasDiagnostic(true);
      const{data:p,error:priorityError}=await supabase.from('priorities').select('id,pillar,rank').eq('diagnostic_id',d.id).order('rank').limit(3);
      if(priorityError)throw priorityError;
      priorityRows=(p||[]) as Priority[];
      setPriorities(priorityRows);
    }
    setContext({sector:company.sector||'',size:company.size_band||'',maturity:(d as any)?.maturity||'',priorities:priorityRows.map(x=>x.pillar)});
    const{data:actions,error:actionsError}=await supabase.from('actions').select('id,title,description,pillar,phase,owner_name,due_date,expected_proof,impact,status,priority_id').eq('company_id',membership.company_id).order('created_at');
    if(actionsError)throw actionsError;
    setRows(((actions||[]) as any[]).map(a=>({...a,phase:normalizePhase(a.phase)})) as Row[]);
  }catch{setError('Impossible de charger votre plan d’action pour le moment.')}finally{setLoaded(true)}})()},[]);

  const canDelete=memberRole==='owner'||memberRole==='admin';

  const recommendations=useMemo(()=>{
    const map=new Map<string,ReturnType<typeof recommendLibrary>[number]>();
    rows.forEach(a=>{
      const ranked=recommendLibrary(resources,{sector:context.sector,size:context.size,maturity:context.maturity,priorities:[a.pillar||'',...context.priorities.filter(p=>p!==a.pillar)].filter(Boolean),expectedProofs:a.expected_proof?[a.expected_proof]:[]});
      if(ranked[0]?.recommendationScore>0)map.set(a.id,ranked[0]);
    });
    return map;
  },[rows,context]);

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return rows
      .filter(a=>statusFilter==='all'||a.status===statusFilter)
      .filter(a=>phaseFilter==='all'||normalizePhase(a.phase)===phaseFilter)
      .filter(a=>pillarFilter==='all'||a.pillar===pillarFilter)
      .filter(a=>!q||[a.title,a.description,a.owner_name,a.pillar,a.expected_proof].some(v=>(v||'').toLowerCase().includes(q)))
      .sort((a,b)=>{
        const statusOrder={in_progress:0,todo:1,done:2};
        const byStatus=statusOrder[a.status]-statusOrder[b.status];
        if(byStatus!==0)return byStatus;
        const byPhase=Number(normalizePhase(a.phase))-Number(normalizePhase(b.phase));
        if(byPhase!==0)return byPhase;
        return(a.due_date||'9999-12-31').localeCompare(b.due_date||'9999-12-31');
      });
  },[rows,query,statusFilter,phaseFilter,pillarFilter]);

  const completed=rows.filter(a=>a.status==='done').length;
  const inProgress=rows.filter(a=>a.status==='in_progress').length;
  const today=new Date().toISOString().slice(0,10);
  const overdue=rows.filter(a=>a.status!=='done'&&a.due_date&&a.due_date<today).length;
  const progress=rows.length?Math.round(completed/rows.length*100):0;

  function openCreate(){setDraft(makeDraft(priorities[0]));setEditorOpen(true);setNotice('')}
  function openEdit(a:Row){setDraft({id:a.id,title:a.title,description:a.description||'',priority_id:a.priority_id||'',pillar:a.pillar||pillars[0],phase:normalizePhase(a.phase),owner_name:a.owner_name||'',due_date:a.due_date||'',expected_proof:a.expected_proof||'',impact:a.impact||'Fort',status:a.status});setEditorOpen(true);setNotice('')}
  function closeEditor(){if(!saving)setEditorOpen(false)}
  function choosePriority(id:string){const pr=priorities.find(p=>p.id===id);setDraft(d=>({...d,priority_id:id,pillar:pr?.pillar||d.pillar}))}

  async function saveDraft(){
    if(!draft.title.trim()){setError('Donnez un titre à l’action.');return}
    if(!companyId||!userId){setError('Votre espace entreprise n’est pas disponible.');return}
    setSaving(true);setError('');
    const payload={title:draft.title.trim(),description:draft.description.trim()||null,priority_id:draft.priority_id||null,pillar:draft.pillar||null,phase:normalizePhase(draft.phase),owner_name:draft.owner_name.trim()||null,due_date:draft.due_date||null,expected_proof:draft.expected_proof.trim()||null,impact:draft.impact||null,status:draft.status,completed_at:draft.status==='done'?new Date().toISOString():null,updated_at:new Date().toISOString()};
    try{
      if(draft.id){
        const{data,error:updateError}=await supabase.from('actions').update(payload).eq('id',draft.id).select('id,title,description,pillar,phase,owner_name,due_date,expected_proof,impact,status,priority_id').single();
        if(updateError)throw updateError;
        setRows(r=>r.map(x=>x.id===draft.id?({...data,phase:normalizePhase((data as any).phase)} as Row):x));
        setNotice('Action mise à jour.');
      }else{
        const{data,error:insertError}=await supabase.from('actions').insert({...payload,company_id:companyId,created_by:userId}).select('id,title,description,pillar,phase,owner_name,due_date,expected_proof,impact,status,priority_id').single();
        if(insertError)throw insertError;
        setRows(r=>[...r,{...data,phase:normalizePhase((data as any).phase)} as Row]);
        setNotice('Action créée.');
      }
      setEditorOpen(false);
    }catch{setError('L’action n’a pas pu être enregistrée.')}finally{setSaving(false)}
  }

  async function patchRow(a:Row,patch:Partial<Row>){
    setError('');
    const nextStatus=(patch.status||a.status) as Status;
    const payload:any={...patch,updated_at:new Date().toISOString()};
    if(Object.prototype.hasOwnProperty.call(patch,'status'))payload.completed_at=nextStatus==='done'?new Date().toISOString():null;
    const{error:updateError}=await supabase.from('actions').update(payload).eq('id',a.id);
    if(updateError){setError('La modification n’a pas pu être enregistrée.');return}
    setRows(r=>r.map(x=>x.id===a.id?{...x,...patch}:x));
  }

  async function toggleDone(a:Row){await patchRow(a,{status:a.status==='done'?'todo':'done'})}

  async function removeAction(a:Row){
    if(!canDelete)return;
    if(!window.confirm('Supprimer définitivement l’action « '+a.title+' » ?'))return;
    setError('');
    const{error:deleteError}=await supabase.from('actions').delete().eq('id',a.id);
    if(deleteError){setError('Cette action n’a pas pu être supprimée.');return}
    setRows(r=>r.filter(x=>x.id!==a.id));
    setNotice('Action supprimée.');
  }

  async function generateFromPriorities(){
    if(priorities.length<3||!companyId||!userId)return;
    setSaving(true);setError('');setNotice('');
    try{
      const existingKeys=new Set(rows.map(a=>(a.priority_id||'')+'|'+a.title));
      const suggested=buildActionRows(companyId,userId,priorities)
        .filter(a=>!existingKeys.has((a.priority_id||'')+'|'+a.title))
        .map(a=>{const phase=normalizePhase(a.phase);const p=phases.find(x=>x.value===phase)||phases[2];return{...a,phase,due_date:addDaysISO(p.day)}});
      if(!suggested.length){setNotice('Les actions suggérées sont déjà présentes dans votre plan.');return}
      const{data,error:insertError}=await supabase.from('actions').insert(suggested).select('id,title,description,pillar,phase,owner_name,due_date,expected_proof,impact,status,priority_id');
      if(insertError)throw insertError;
      setRows(r=>[...r,...((data||[]) as any[]).map(a=>({...a,phase:normalizePhase(a.phase)} as Row))]);
      setNotice(String(suggested.length)+' actions suggérées ont été ajoutées.');
    }catch{setError('Le plan suggéré n’a pas pu être généré.')}finally{setSaving(false)}
  }

  if(!loaded)return <p>Chargement de votre plan d’action…</p>;
  if(error&&!companyId)return <div className="modulePage"><span className="kicker">PLAN D’ACTION</span><h1>Votre plan d’action est temporairement indisponible.</h1><p className="actionLead">{error}</p><div className="nextStep"><div><AlertCircle/><b>Aucune donnée fictive n’est affichée.</b></div><Link className="button" href="/dashboard/">Retour au tableau de bord</Link></div></div>;

  return <div className="modulePage actionPage">
    <PilotageBar eyebrow="PILOTAGE · 90 JOURS" title="Plan d’action" description="Créez, modifiez et pilotez vos actions sans quitter cette page." actions={<>
      {priorities.length===3&&<button className="secondaryBtn" onClick={generateFromPriorities} disabled={saving}><Sparkles/> Générer depuis mes priorités</button>}
      <button className="primaryBtn" onClick={openCreate}><Plus/> Nouvelle action</button>
    </>}/>

    {!hasDiagnostic&&<div className="infoStrip"><AlertCircle/><span>Vous pouvez démarrer votre plan manuellement dès maintenant. Le diagnostic permettra ensuite de proposer des actions liées à vos 3 priorités.</span><Link href="/diagnostic/">Faire le diagnostic</Link></div>}
    {notice&&<div className="successStrip"><CheckCircle2/>{notice}</div>}
    {error&&<div className="errorStrip"><AlertCircle/>{error}<button onClick={()=>setError('')} aria-label="Fermer"><X/></button></div>}

    <div className="compactMetrics">
      <div><span>Total</span><b>{rows.length}</b></div>
      <div><span>En cours</span><b>{inProgress}</b></div>
      <div><span>Terminées</span><b>{completed}</b></div>
      <div className={overdue?'metricAlert':''}><span>En retard</span><b>{overdue}</b></div>
      <div className="progressMetric"><span>Avancement</span><b>{progress}%</b><i><em style={{width:String(progress)+'%'}}/></i></div>
    </div>

    <div className="actionToolbar">
      <label className="searchBox"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher une action…"/></label>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}><option value="all">Tous les statuts</option>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
      <select value={phaseFilter} onChange={e=>setPhaseFilter(e.target.value)}><option value="all">Toute la période</option>{phases.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select>
      <select value={pillarFilter} onChange={e=>setPillarFilter(e.target.value)}><option value="all">Tous les piliers</option>{pillars.map(p=><option key={p} value={p}>{p}</option>)}</select>
    </div>

    {rows.length===0?<div className="emptyPlan">
      <div className="emptyIcon"><Plus/></div><h2>Créez votre premier plan d’action.</h2><p>Ajoutez une action librement ou générez une première base à partir de vos 3 priorités RSE.</p>
      <div><button className="primaryBtn" onClick={openCreate}><Plus/> Créer une action</button>{priorities.length===3&&<button className="secondaryBtn" onClick={generateFromPriorities} disabled={saving}><Sparkles/> Générer le plan suggéré</button>}</div>
    </div>:<>
      <div className="taskTable">
        <div className="taskHead"><span>Action</span><span>Statut</span><span>Responsable</span><span>Échéance</span><span>Impact</span><span></span></div>
        <div className="taskRows">
          {filtered.map(a=>{
            const phase=phases.find(p=>p.value===normalizePhase(a.phase))||phases[0];
            const rec=recommendations.get(a.id);
            const isLate=a.status!=='done'&&!!a.due_date&&a.due_date<today;
            return <article className={'taskRow '+(a.status==='done'?'done':'')} id={'action-'+a.id} key={a.id}>
              <div className="taskMain">
                <button className="taskCheck" onClick={()=>toggleDone(a)}>{a.status==='done'?<CheckCircle2/>:<Circle/>}</button>
                <div className="taskCopy" onClick={()=>openEdit(a)} role="button" tabIndex={0}>
                  <div className="taskTitleLine"><b>{a.title}</b><span className="phaseChip">{phase.short}</span></div>
                  <p>{a.description||'Aucune description'}</p>
                  <div className="taskTags">{a.pillar&&<span>{a.pillar}</span>}{a.expected_proof&&<span><FolderCheck/> {a.expected_proof}</span>}</div>
                </div>
              </div>
              <div className="statusCell"><select className={'statusSelect '+a.status} value={a.status} onChange={e=>patchRow(a,{status:e.target.value as Status})}>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div className="ownerCell"><UserRound/><span>{a.owner_name||'À définir'}</span></div>
              <div className={'dateCell '+(isLate?'late':'')}><CalendarDays/><input type="date" value={a.due_date||''} onChange={e=>patchRow(a,{due_date:e.target.value||null})}/></div>
              <div className="impactCell"><Gauge/><span>{a.impact||'—'}</span></div>
              <div className="rowActions">
                {rec&&<Link href={'/library/template/?slug='+rec.slug} title="Ouvrir le modèle recommandé"><BookOpen/></Link>}
                <Link href={'/proofs/?action='+a.id} title="Ajouter une preuve"><FolderCheck/></Link>
                <button onClick={()=>openEdit(a)} title="Modifier"><Pencil/></button>
                {canDelete&&<button className="deleteBtn" onClick={()=>removeAction(a)} title="Supprimer"><Trash2/></button>}
              </div>
            </article>
          })}
        </div>
      </div>
      {!filtered.length&&<div className="noResults">Aucune action ne correspond à vos filtres.</div>}
    </>}

    {editorOpen&&<>
      <button className="drawerBackdrop" onClick={closeEditor} aria-label="Fermer le panneau"/>
      <aside className="actionDrawer">
        <header><div><span className="kicker">{draft.id?'MODIFIER L’ACTION':'NOUVELLE ACTION'}</span><h2>{draft.id?'Mettre à jour l’action':'Ajouter une action au plan'}</h2></div><button onClick={closeEditor}><X/></button></header>
        <div className="drawerBody">
          <label>Titre de l’action<input autoFocus value={draft.title} onChange={e=>setDraft(d=>({...d,title:e.target.value}))} placeholder="Ex. Formaliser une politique RSE"/></label>
          <label>Description<textarea rows={3} value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="Résultat attendu, périmètre, points clés…"/></label>
          <div className="fieldGrid">
            <label>Priorité liée<select value={draft.priority_id} onChange={e=>choosePriority(e.target.value)}><option value="">Action transverse</option>{priorities.map(p=><option key={p.id} value={p.id}>Priorité {p.rank} · {p.pillar}</option>)}</select></label>
            <label>Pilier<select value={draft.pillar} onChange={e=>setDraft(d=>({...d,pillar:e.target.value}))}>{pillars.map(p=><option key={p} value={p}>{p}</option>)}</select></label>
            <label>Période<select value={draft.phase} onChange={e=>setDraft(d=>({...d,phase:e.target.value}))}>{phases.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
            <label>Statut<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value as Status}))}>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
            <label>Responsable<input value={draft.owner_name} onChange={e=>setDraft(d=>({...d,owner_name:e.target.value}))} placeholder="Nom ou fonction"/></label>
            <label>Échéance<input type="date" value={draft.due_date} onChange={e=>setDraft(d=>({...d,due_date:e.target.value}))}/></label>
            <label>Impact<select value={draft.impact} onChange={e=>setDraft(d=>({...d,impact:e.target.value}))}>{impacts.map(i=><option key={i} value={i}>{i}</option>)}</select></label>
            <label>Preuve attendue<input value={draft.expected_proof} onChange={e=>setDraft(d=>({...d,expected_proof:e.target.value}))} placeholder="Ex. Politique signée"/></label>
          </div>
        </div>
        <footer>
          {draft.id&&canDelete?<button className="drawerDelete" onClick={()=>{const row=rows.find(x=>x.id===draft.id);if(row){setEditorOpen(false);removeAction(row)}}}><Trash2/> Supprimer</button>:<span/>}
          <div><button className="secondaryBtn" onClick={closeEditor}>Annuler</button><button className="primaryBtn" onClick={saveDraft} disabled={saving}><Save/> {saving?'Enregistrement…':'Enregistrer'}</button></div>
        </footer>
      </aside>
    </>}

    <style jsx>{"\
.actionPage{max-width:1500px!important}.actionTop{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:18px}.actionTop h1{margin:4px 0 6px;font-size:34px}.actionTop p{margin:0;color:#6b8085;font-size:14px}.topButtons{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.primaryBtn,.secondaryBtn{border:0;border-radius:9px;min-height:40px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:850;cursor:pointer}.primaryBtn{background:#0797d5;color:#fff}.secondaryBtn{background:#fff;color:#153b46;border:1px solid #d5e3df}.primaryBtn:disabled,.secondaryBtn:disabled{opacity:.55;cursor:not-allowed}.primaryBtn :global(svg),.secondaryBtn :global(svg){width:16px}.infoStrip,.successStrip,.errorStrip{display:flex;align-items:center;gap:9px;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:11px}.infoStrip{background:#f4f8fb;border:1px solid #d8e7ef;color:#446570}.successStrip{background:#f1faf5;border:1px solid #d1eadb;color:#2f6b4a}.errorStrip{background:#fff5f4;border:1px solid #efd8d4;color:#8a4d45}.infoStrip :global(svg),.successStrip :global(svg),.errorStrip :global(svg){width:15px;flex:0 0 auto}.infoStrip a{margin-left:auto;color:#087fab;font-weight:800;text-decoration:none}.errorStrip button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.compactMetrics{display:grid;grid-template-columns:repeat(4,minmax(100px,1fr)) minmax(210px,1.5fr);border:1px solid #dde8e5;border-radius:12px;background:#fff;margin-bottom:12px;overflow:hidden}.compactMetrics>div{padding:12px 14px;border-right:1px solid #edf2f0;display:flex;align-items:baseline;gap:9px}.compactMetrics>div:last-child{border-right:0}.compactMetrics span{font-size:9px;font-weight:800;color:#7a8f93;text-transform:uppercase}.compactMetrics b{font-size:18px;color:#153b46}.compactMetrics .metricAlert b{color:#b05b4f}.progressMetric{display:grid!important;grid-template-columns:auto auto;gap:5px 10px!important}.progressMetric b{justify-self:end}.progressMetric i{grid-column:1/-1;height:5px;background:#edf3f1;border-radius:999px;overflow:hidden}.progressMetric em{display:block;height:100%;background:#64aa86;border-radius:999px}.actionToolbar{display:grid;grid-template-columns:minmax(260px,1.7fr) repeat(3,minmax(145px,.65fr));gap:8px;margin-bottom:10px}.searchBox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #dbe6e3;border-radius:9px;padding:0 11px;min-height:40px}.searchBox :global(svg){width:16px;color:#7c9195}.searchBox input{border:0;outline:0;width:100%;font-size:12px;background:transparent}.actionToolbar select{min-width:0;border:1px solid #dbe6e3;border-radius:9px;background:#fff;color:#45656c;padding:0 10px;font-size:11px;font-weight:700}.taskTable{background:#fff;border:1px solid #dce7e4;border-radius:12px;overflow:hidden}.taskHead,.taskRow{display:grid;grid-template-columns:minmax(360px,2.8fr) minmax(105px,.75fr) minmax(120px,.8fr) minmax(145px,.9fr) minmax(90px,.55fr) 132px;align-items:center}.taskHead{min-height:36px;background:#f6f9f8;border-bottom:1px solid #e4ece9;color:#7b9093;font-size:8px;font-weight:900;text-transform:uppercase}.taskHead span{padding:0 12px}.taskRow{min-height:74px;border-bottom:1px solid #edf2f0}.taskRow:last-child{border-bottom:0}.taskRow:hover{background:#fbfdfc}.taskRow.done{opacity:.68}.taskMain{display:grid;grid-template-columns:32px 1fr;align-items:start;padding:11px 10px 11px 8px;min-width:0}.taskCheck{width:30px;height:30px;border:0;background:transparent;color:#94a8aa;display:grid;place-items:center;cursor:pointer}.taskCheck :global(svg){width:19px}.done .taskCheck{color:#64aa86}.taskCopy{min-width:0;cursor:pointer}.taskTitleLine{display:flex;align-items:center;gap:7px;min-width:0}.taskTitleLine b{font-size:12px;color:#183f48;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.done .taskTitleLine b{text-decoration:line-through}.phaseChip{font-size:8px!important;font-weight:900!important;border-radius:999px;background:#edf5f2;color:#5b7a72;padding:3px 6px}.taskCopy p{margin:3px 0 6px;color:#73888c;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.taskTags{display:flex;gap:5px;overflow:hidden}.taskTags span{display:inline-flex;align-items:center;gap:4px;max-width:45%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#f3f7f6;color:#59767c;border-radius:5px;padding:3px 6px;font-size:8px;font-weight:750}.taskTags span :global(svg){width:10px}.statusCell,.ownerCell,.dateCell,.impactCell,.rowActions{padding:8px 10px;min-width:0}.statusSelect{width:100%;border:1px solid transparent;border-radius:999px;padding:6px 8px;font-size:9px;font-weight:850}.statusSelect.todo{background:#f3f5f5;color:#60767a}.statusSelect.in_progress{background:#edf6fb;color:#19769a}.statusSelect.done{background:#edf8f1;color:#3f7c59}.ownerCell,.dateCell,.impactCell{display:flex;align-items:center;gap:6px;color:#617b80;font-size:10px}.ownerCell :global(svg),.dateCell :global(svg),.impactCell :global(svg){width:14px;color:#8aa0a3}.ownerCell span,.impactCell span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dateCell input{min-width:0;width:100%;border:0;background:transparent;color:#617b80;font-size:10px}.dateCell.late,.dateCell.late input{color:#ad574d;font-weight:800}.rowActions{display:flex;justify-content:flex-end;gap:4px}.rowActions a,.rowActions button{width:30px;height:30px;border:1px solid #e0e9e6;border-radius:8px;background:#fff;color:#5f7a80;display:grid;place-items:center;cursor:pointer;text-decoration:none}.rowActions :global(svg){width:14px}.rowActions .deleteBtn{color:#a65a52}.emptyPlan,.noResults{text-align:center;border:1px dashed #cfdfda;border-radius:14px;background:#fbfdfc;padding:38px 24px}.emptyIcon{width:48px;height:48px;border-radius:14px;background:#edf7f2;color:#64aa86;display:grid;place-items:center;margin:0 auto 13px}.emptyIcon :global(svg){width:22px}.emptyPlan h2{margin:0;color:#173f47;font-size:20px}.emptyPlan p{max-width:560px;margin:7px auto 17px;color:#71868a;font-size:12px}.emptyPlan>div:last-child{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.noResults{padding:24px;color:#71868a;font-size:12px;margin-top:8px}.drawerBackdrop{position:fixed;z-index:90;inset:0;border:0;background:rgba(10,31,37,.34)}.actionDrawer{position:fixed;z-index:91;right:0;top:0;width:min(560px,94vw);height:100dvh;background:#fff;box-shadow:-24px 0 60px rgba(16,47,57,.18);display:flex;flex-direction:column}.actionDrawer header{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 24px 16px;border-bottom:1px solid #e6eeeb}.actionDrawer header h2{margin:4px 0 0;font-size:22px;color:#153b46}.actionDrawer header>button{width:38px;height:38px;border:0;border-radius:9px;background:#f1f6f4;color:#506e74;display:grid;place-items:center;cursor:pointer}.drawerBody{padding:18px 24px;overflow:auto;display:grid;gap:14px}.drawerBody label{display:grid;gap:6px;color:#536f75;font-size:10px;font-weight:850}.drawerBody input,.drawerBody textarea,.drawerBody select{width:100%;border:1px solid #d7e4e0;border-radius:9px;background:#fff;color:#244c55;padding:10px 11px;font-size:12px}.fieldGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.actionDrawer footer{margin-top:auto;padding:14px 24px;border-top:1px solid #e6eeeb;display:flex;justify-content:space-between;align-items:center;gap:12px}.actionDrawer footer>div{display:flex;gap:8px}.drawerDelete{border:0;background:transparent;color:#a65a52;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;cursor:pointer}@media(max-width:900px){.actionToolbar{grid-template-columns:1fr 1fr}.searchBox{grid-column:1/-1}.compactMetrics{grid-template-columns:repeat(4,1fr)}.progressMetric{grid-column:1/-1}.taskHead{display:none}.taskRow{grid-template-columns:1fr 110px;padding:8px 6px}.taskMain{grid-column:1/-1}.statusCell,.ownerCell,.dateCell,.impactCell{padding:5px 10px}.ownerCell,.dateCell{grid-column:1}.impactCell{display:none}.statusCell{grid-column:2;grid-row:2}.rowActions{grid-column:2;grid-row:3/5;align-self:end}}@media(max-width:650px){.actionTop{display:grid}.actionTop h1{font-size:28px}.topButtons{justify-content:stretch}.topButtons button{flex:1}.compactMetrics{grid-template-columns:1fr 1fr}.progressMetric{grid-column:1/-1}.actionToolbar{grid-template-columns:1fr}.searchBox{grid-column:auto}.taskRow{grid-template-columns:1fr}.taskMain,.statusCell,.ownerCell,.dateCell,.rowActions{grid-column:1;grid-row:auto}.rowActions{justify-content:flex-start}.fieldGrid{grid-template-columns:1fr}.actionDrawer{width:100vw}.actionDrawer header,.drawerBody,.actionDrawer footer{padding-left:18px;padding-right:18px}.actionDrawer footer{align-items:stretch;flex-direction:column-reverse}.actionDrawer footer>div{display:grid;grid-template-columns:1fr 1fr}}\
"}</style>
  </div>;
}
