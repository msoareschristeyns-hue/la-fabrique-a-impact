'use client';
import Link from'next/link';
import{useEffect,useMemo,useState}from'react';
import{ArrowRight,CalendarDays,CheckCircle2,Clock3,FilePenLine,FolderKanban,Plus,RefreshCw,ShieldAlert,UserRound}from'lucide-react';
import{supabase}from'../../../lib/supabase';
import{sourceCatalog,sourceCatalogById,type SourceCatalogItem}from'../../../lib/sourceCatalog';
import{recommendCatalog}from'../../../lib/catalogRecommendations';
import{msdgRseTemplates}from'../../../lib/msdgRseCatalog';

type PlanStatus='À créer'|'À compléter'|'À valider'|'Disponible';
type Workspace={resource_slug:string;template_title:string;values:Record<string,unknown>|null;status:string;updated_at:string|null};
type PlanRow={item:SourceCatalogItem;workspace:Workspace;status:PlanStatus;owner:string;deadline:string};
type Context={companyName:string;sector:string;size:string;maturity:string;priorities:string[]};

const statuses:PlanStatus[]=['À créer','À compléter','À valider','Disponible'];
const weights:Record<PlanStatus,number>={'À créer':0,'À compléter':35,'À valider':75,'Disponible':100};
const enrichedFrameworks=Object.fromEntries(msdgRseTemplates.map(x=>[x.id,x.frameworks]));

function statusFor(workspace:Workspace):PlanStatus{
 const values=workspace.values||{};
 const saved=values.__plan_status;
 if(typeof saved==='string'&&statuses.includes(saved as PlanStatus))return saved as PlanStatus;
 if(workspace.status==='completed')return'Disponible';
 const hasContent=Object.entries(values).some(([key,value])=>!key.startsWith('__')&&String(value??'').trim().length>0);
 return hasContent?'À compléter':'À créer';
}
function textValue(value:unknown,fallback=''){return typeof value==='string'?value:fallback}
function deadlineForRank(index:number){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+(index<2?30:index<4?60:90));const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`}
function isOverdue(deadline:string,status:PlanStatus){if(!deadline||status==='Disponible')return false;const today=new Date();today.setHours(0,0,0,0);const due=new Date(`${deadline}T00:00:00`);return due<today}

export default function DocumentPlan(){
 const[companyId,setCompanyId]=useState('');
 const[userId,setUserId]=useState('');
 const[context,setContext]=useState<Context>({companyName:'',sector:'',size:'',maturity:'',priorities:[]});
 const[rows,setRows]=useState<PlanRow[]>([]);
 const[loaded,setLoaded]=useState(false);
 const[saving,setSaving]=useState('');
 const[msg,setMsg]=useState('');

 async function load(){
  setLoaded(false);setMsg('');
  try{
   const{data:{user}}=await supabase.auth.getUser();if(!user){setMsg('Connectez-vous pour piloter votre plan documentaire.');return}setUserId(user.id);
   const{data:m}=await supabase.from('company_members').select('company_id,companies(name,sector,size_band)').eq('user_id',user.id).limit(1).maybeSingle();if(!m){setMsg('Aucune entreprise n’est associée à ce compte.');return}
   const member:any=m;const company:any=member.companies||{};setCompanyId(member.company_id);
   let sector=company.sector||'',size=company.size_band||'',maturity='',priorities:string[]=[];
   const{data:d}=await supabase.from('diagnostics').select('id,sector,size_band,maturity').eq('company_id',member.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
   if(d){sector=d.sector||sector;size=d.size_band||size;maturity=d.maturity||'';const{data:p}=await supabase.from('priorities').select('pillar').eq('diagnostic_id',d.id).order('rank').limit(3);priorities=(p||[]).map((x:any)=>x.pillar)}
   setContext({companyName:company.name||'',sector,size,maturity,priorities});
   const{data:w,error}=await supabase.from('template_workspaces').select('resource_slug,template_title,values,status,updated_at').eq('company_id',member.company_id).like('resource_slug','catalog-%').order('updated_at',{ascending:false});
   if(error){setMsg(`Impossible de charger le plan documentaire : ${error.message}`);return}
   const mapped=((w||[]) as Workspace[]).map(workspace=>{const item=sourceCatalogById(workspace.resource_slug.replace('catalog-',''));if(!item)return null;const values=workspace.values||{};return{item,workspace,status:statusFor(workspace),owner:textValue(values.__plan_owner,'À désigner'),deadline:textValue(values.__plan_deadline,'')}}).filter(Boolean) as PlanRow[];
   setRows(mapped);
  }finally{setLoaded(true)}
 }
 useEffect(()=>{load()},[]);

 const metrics=useMemo(()=>{
  const available=rows.filter(r=>r.status==='Disponible').length;
  const validation=rows.filter(r=>r.status==='À valider').length;
  const overdue=rows.filter(r=>isOverdue(r.deadline,r.status)).length;
  const coverage=rows.length?Math.round(rows.reduce((sum,r)=>sum+weights[r.status],0)/rows.length):0;
  const p1=rows.filter(r=>r.item.priority==='P1');
  const p1Available=p1.filter(r=>r.status==='Disponible').length;
  return{available,validation,overdue,coverage,p1:p1.length,p1Available};
 },[rows]);

 async function seedPlan(){
  if(!companyId||!userId)return;setSaving('seed');setMsg('');
  const recommended=recommendCatalog(sourceCatalog,{sector:context.sector,size:context.size,maturity:context.maturity,priorities:context.priorities,targetFramework:'Démarche RSE générale'},enrichedFrameworks).slice(0,6);
  const existing=new Map(rows.map(r=>[r.item.id,r]));
  const payloads=recommended.map((item,index)=>{const current=existing.get(item.id);const values={...(current?.workspace.values||{})} as Record<string,unknown>;if(!values.__plan_status)values.__plan_status=current?current.status:'À créer';if(!values.__plan_owner)values.__plan_owner=current?.owner||'À désigner';if(!values.__plan_deadline)values.__plan_deadline=current?.deadline||deadlineForRank(index);return{company_id:companyId,resource_slug:`catalog-${item.id}`,template_title:item.title,values,status:current?.workspace.status==='completed'?'completed':'draft',created_by:userId,updated_at:new Date().toISOString()}});
  const{error}=await supabase.from('template_workspaces').upsert(payloads,{onConflict:'company_id,resource_slug'});
  if(error)setMsg(`Impossible de générer le plan : ${error.message}`);else{setMsg(rows.length?'Le plan a été complété avec les recommandations manquantes.':'Votre premier plan documentaire a été généré sur 90 jours.');await load()}
  setSaving('');
 }

 function patchLocal(id:string,patch:Partial<Pick<PlanRow,'status'|'owner'|'deadline'>>){setRows(current=>current.map(row=>row.item.id===id?{...row,...patch}:row))}
 async function saveRow(row:PlanRow){
  if(!companyId||!userId)return;setSaving(row.item.id);setMsg('');
  const values={...(row.workspace.values||{}),__plan_status:row.status,__plan_owner:row.owner.trim()||'À désigner',__plan_deadline:row.deadline};
  const payload={company_id:companyId,resource_slug:`catalog-${row.item.id}`,template_title:row.item.title,values,status:row.status==='Disponible'?'completed':'draft',created_by:userId,updated_at:new Date().toISOString(),completed_at:row.status==='Disponible'?new Date().toISOString():null};
  const{data,error}=await supabase.from('template_workspaces').upsert(payload,{onConflict:'company_id,resource_slug'}).select('resource_slug,template_title,values,status,updated_at').single();
  if(error)setMsg(`Impossible d’enregistrer ${row.item.title} : ${error.message}`);else if(data){const workspace=data as Workspace;setRows(current=>current.map(r=>r.item.id===row.item.id?{...r,workspace,status:statusFor(workspace),owner:textValue(workspace.values?.__plan_owner,'À désigner'),deadline:textValue(workspace.values?.__plan_deadline,'')}:r));setMsg(`« ${row.item.title} » a été mis à jour.`)}
  setSaving('');
 }

 if(!loaded)return <div className="modulePage"><p>Préparation de votre plan documentaire…</p></div>;
 return <div className="modulePage">
  <div className="planHead"><div><span className="kicker">PLAN DOCUMENTAIRE RSE</span><h1>Pilotez les documents à créer, compléter et valider.</h1><p className="actionLead">Transformez les recommandations du catalogue en feuille de route : statut, responsable, échéance et niveau de couverture.</p></div><div className="planHeadActions"><Link className="secondaryButton" href="/library/catalog/"><Plus/> Ajouter un document</Link><button className="button" onClick={seedPlan} disabled={saving==='seed'}><RefreshCw/> {rows.length?'Mettre à jour les recommandations':'Générer mon plan'}</button></div></div>

  {msg&&<p className={msg.startsWith('Impossible')?'auth-error':'planMessage'}>{msg}</p>}

  {rows.length>0?<>
   <div className="planMetrics"><article><FolderKanban/><span>Couverture documentaire</span><b>{metrics.coverage}%</b><small>progression moyenne du plan</small></article><article><CheckCircle2/><span>Documents disponibles</span><b>{metrics.available}/{rows.length}</b><small>{metrics.p1Available}/{metrics.p1} documents P1 disponibles</small></article><article><Clock3/><span>À valider</span><b>{metrics.validation}</b><small>documents proches de la finalisation</small></article><article className={metrics.overdue?'warning':''}><ShieldAlert/><span>Échéances dépassées</span><b>{metrics.overdue}</b><small>{metrics.overdue?'à traiter en priorité':'aucun retard détecté'}</small></article></div>

   <div className="planProgress"><div><b>Couverture du plan</b><span>{metrics.coverage}%</span></div><i><em style={{width:`${metrics.coverage}%`}}/></i><p>À créer 0% · À compléter 35% · À valider 75% · Disponible 100%. Cet indicateur mesure l’avancement documentaire, pas la conformité de l’entreprise.</p></div>

   <div className="planTableHead"><div><span className="kicker">FEUILLE DE ROUTE</span><h2>{rows.length} document{rows.length>1?'s':''} piloté{rows.length>1?'s':''}</h2></div><Link href="/library/catalog/">Explorer les 342 documents <ArrowRight/></Link></div>
   <div className="planRows">{rows.map(row=>{const overdue=isOverdue(row.deadline,row.status);return <article key={row.item.id} className={overdue?'overdue':''}>
    <div className="planDoc"><div className="planBadges"><span>{row.item.id}</span><b className={row.item.priority.toLowerCase()}>{row.item.priority}</b>{row.item.legalReview==='Oui'&&<em>Revue juridique</em>}</div><small>{row.item.category}</small><h3>{row.item.title}</h3><Link href={`/library/catalog/editor/?id=${row.item.id}`}><FilePenLine/> Ouvrir et personnaliser</Link></div>
    <label><span>Statut</span><select value={row.status} onChange={e=>patchLocal(row.item.id,{status:e.target.value as PlanStatus})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
    <label><span>Responsable</span><div className="inputIcon"><UserRound/><input value={row.owner} onChange={e=>patchLocal(row.item.id,{owner:e.target.value})}/></div></label>
    <label><span>Échéance</span><div className="inputIcon"><CalendarDays/><input type="date" value={row.deadline} onChange={e=>patchLocal(row.item.id,{deadline:e.target.value})}/></div>{overdue&&<small className="late">Échéance dépassée</small>}</label>
    <button className="savePlan" disabled={saving===row.item.id} onClick={()=>saveRow(row)}>{saving===row.item.id?'Enregistrement…':'Enregistrer'}</button>
   </article>})}</div>
  </>:<div className="emptyPlan"><FolderKanban/><span className="kicker">VOTRE PLAN EST VIDE</span><h2>Transformez les recommandations en feuille de route documentaire.</h2><p>Nous sélectionnerons les 6 documents les plus pertinents selon votre secteur, votre taille, votre maturité et vos priorités RSE, puis nous proposerons des échéances sur 90 jours.</p><div><button className="button" onClick={seedPlan} disabled={saving==='seed'}>Générer mon premier plan documentaire</button><Link className="secondaryButton" href="/library/catalog/">Explorer le catalogue</Link></div></div>}

  <div className="planMethod"><b>Logique de pilotage</b><span>À créer → À compléter → À valider → Disponible</span><p>Un document « Disponible » signifie qu’il est finalisé dans votre espace. Une revue juridique ou réglementaire reste nécessaire lorsque le catalogue l’indique.</p></div>
  <style jsx>{`
   .planHead{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}.planHeadActions{display:flex;gap:8px;flex-wrap:wrap}.planHeadActions :global(a),.planHeadActions button{white-space:nowrap}.planMessage{padding:10px 12px;border-radius:9px;background:#edf8f3;color:#2f7355;font-size:11px}.planMetrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0 12px}.planMetrics article{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;align-items:center;padding:15px;border:1px solid #dce7e4;border-radius:13px;background:#fff}.planMetrics svg{grid-row:1/4;width:20px;color:#64aa86}.planMetrics span{font-size:9px;color:#71868a}.planMetrics b{font-size:22px;color:#153b46}.planMetrics small{font-size:8px;color:#7e9194}.planMetrics .warning{border-color:#eccaaa;background:#fffaf5}.planMetrics .warning svg{color:#ae6b27}.planProgress{padding:14px 16px;border:1px solid #dce7e4;border-radius:12px;background:#f8fbfa;margin-bottom:24px}.planProgress>div{display:flex;justify-content:space-between;font-size:11px}.planProgress>i{display:block;height:8px;margin:8px 0;border-radius:99px;background:#e0eae7;overflow:hidden}.planProgress>i em{display:block;height:100%;background:#64aa86;border-radius:inherit}.planProgress p{margin:0;color:#778b8f;font-size:8px}.planTableHead{display:flex;justify-content:space-between;align-items:end;gap:14px;margin:4px 0 10px}.planTableHead h2{font-size:21px;margin:3px 0 0}.planTableHead :global(a){display:flex;align-items:center;gap:5px;color:#39785b;font-size:10px;font-weight:900;text-decoration:none}.planTableHead :global(svg){width:13px}.planRows{display:grid;gap:8px}.planRows article{display:grid;grid-template-columns:minmax(260px,1.5fr) minmax(130px,.65fr) minmax(170px,.8fr) 155px 95px;gap:10px;align-items:center;padding:13px;border:1px solid #dce7e4;border-radius:12px;background:#fff}.planRows article.overdue{border-left:4px solid #c9833b}.planDoc{min-width:0}.planBadges{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px}.planBadges span,.planBadges b,.planBadges em{font-size:7px;font-style:normal;padding:3px 5px;border-radius:999px;background:#eef4f2;color:#5f777c}.planBadges b.p1{background:#e6f5ee;color:#287251}.planBadges b.p2{background:#f4f2e8;color:#776c34}.planBadges b.p3{background:#f2f2f2;color:#6d7374}.planBadges em{background:#fff1e4;color:#9a5d21}.planDoc>small{display:block;font-size:7px;color:#819397;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.planDoc h3{font-size:12px;margin:3px 0 6px}.planDoc :global(a){display:flex;align-items:center;gap:5px;color:#39785b;font-size:8px;font-weight:800;text-decoration:none}.planDoc :global(svg){width:12px}.planRows label>span{display:block;margin-bottom:4px;font-size:7px;font-weight:900;text-transform:uppercase;color:#71868a}.planRows select,.planRows input{width:100%;height:38px;border:1px solid #cbdad6;border-radius:8px;background:#fff;padding:0 8px;color:#153b46;font:inherit;font-size:10px}.inputIcon{position:relative}.inputIcon svg{position:absolute;width:13px;left:8px;top:12px;color:#82969a}.inputIcon input{padding-left:27px}.late{display:block;color:#a76525;font-size:7px;margin-top:3px}.savePlan{height:38px;border:0;border-radius:8px;background:#153b46;color:#fff;font-size:9px;font-weight:900;cursor:pointer;padding:0 8px}.savePlan:disabled{opacity:.55}.emptyPlan{text-align:center;padding:42px 24px;border:1px dashed #bcd5cb;border-radius:16px;background:#fafdfc}.emptyPlan>svg{width:34px;color:#64aa86}.emptyPlan h2{font-size:23px;margin:7px 0}.emptyPlan p{max-width:650px;margin:0 auto 18px;color:#6f8488;font-size:11px;line-height:1.6}.emptyPlan>div{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.planMethod{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin-top:20px;padding:14px;border-radius:11px;background:#eef6f3}.planMethod b{font-size:9px;text-transform:uppercase;color:#39785b}.planMethod span{font-size:11px;font-weight:900;color:#153b46}.planMethod p{grid-column:2;margin:0;color:#74898d;font-size:8px}@media(max-width:1100px){.planMetrics{grid-template-columns:1fr 1fr}.planRows article{grid-template-columns:1fr 1fr}.planDoc{grid-column:1/-1}.savePlan{justify-self:end;min-width:120px}}@media(max-width:700px){.planHead{display:block}.planHeadActions{margin-top:12px}.planMetrics,.planRows article{grid-template-columns:1fr}.planDoc,.savePlan{grid-column:auto}.savePlan{width:100%}.planTableHead{display:block}.planTableHead :global(a){margin-top:7px}.planMethod{grid-template-columns:1fr}.planMethod p{grid-column:auto}}
  `}</style>
 </div>
}
