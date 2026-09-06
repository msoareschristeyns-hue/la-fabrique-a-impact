'use client';
import Link from'next/link';
import{useEffect,useMemo,useState}from'react';
import{BookOpen,FilePenLine,Plus,Search,SlidersHorizontal,ArrowRight,RotateCcw,ShieldCheck,Sparkles,Target,Building2}from'lucide-react';
import{msdgCatalogVersion,msdgRseTemplates}from'../../../lib/msdgRseCatalog';
import{sourceCatalog,sourceCatalogCategories,sourceCatalogTypes,sourceCatalogModels,sourceCatalogCount}from'../../../lib/sourceCatalog';
import{recommendCatalog}from'../../../lib/catalogRecommendations';
import{supabase}from'../../../lib/supabase';

const enrichedIds=new Set(msdgRseTemplates.map(x=>x.id));
const enrichedFrameworks=Object.fromEntries(msdgRseTemplates.map(x=>[x.id,x.frameworks]));
const priorityOrder:Record<string,number>={P1:1,P2:2,P3:3};
const frameworkTargets=['Démarche RSE générale','EcoVadis','ISO 26000','B Corp','LUCIE 26000','Engagé RSE'];

type CompanyContext={name:string;sector:string;size:string;maturity:string;priorities:string[]};

export default function CatalogPage(){
 const[q,setQ]=useState('');
 const[category,setCategory]=useState('Toutes');
 const[type,setType]=useState('Tous');
 const[priority,setPriority]=useState('Toutes');
 const[model,setModel]=useState('Tous');
 const[status,setStatus]=useState('Tous');
 const[legal,setLegal]=useState('Tous');
 const[limit,setLimit]=useState(30);
 const[targetFramework,setTargetFramework]=useState('Démarche RSE générale');
 const[companyContext,setCompanyContext]=useState<CompanyContext>({name:'',sector:'',size:'',maturity:'',priorities:[]});
 const[contextLoaded,setContextLoaded]=useState(false);

 useEffect(()=>{(async()=>{try{
  const{data:{user}}=await supabase.auth.getUser();if(!user)return;
  const{data:m}=await supabase.from('company_members').select('company_id,companies(name,sector,size_band)').eq('user_id',user.id).limit(1).maybeSingle();
  if(!m)return;const row:any=m;const company:any=row.companies||{};
  let sector=company.sector||'',size=company.size_band||'',maturity='',priorities:string[]=[];
  const{data:d}=await supabase.from('diagnostics').select('id,sector,size_band,maturity').eq('company_id',row.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(d){sector=d.sector||sector;size=d.size_band||size;maturity=d.maturity||'';const{data:p}=await supabase.from('priorities').select('pillar').eq('diagnostic_id',d.id).order('rank').limit(3);priorities=(p||[]).map((x:any)=>x.pillar)}
  setCompanyContext({name:company.name||'',sector,size,maturity,priorities});
 }finally{setContextLoaded(true)}})()},[]);

 const rows=useMemo(()=>sourceCatalog.filter(x=>{
   const hay=`${x.id} ${x.title} ${x.category} ${x.type} ${x.model}`.toLowerCase();
   return(!q.trim()||hay.includes(q.trim().toLowerCase()))
    &&(category==='Toutes'||x.category===category)
    &&(type==='Tous'||x.type===type)
    &&(priority==='Toutes'||x.priority===priority)
    &&(model==='Tous'||x.model===model)
    &&(legal==='Tous'||x.legalReview===legal)
    &&(status==='Tous'||(status==='Enrichis'?enrichedIds.has(x.id):!enrichedIds.has(x.id)));
 }).sort((a,b)=>(priorityOrder[a.priority]||9)-(priorityOrder[b.priority]||9)||a.id.localeCompare(b.id)),[q,category,type,priority,model,status,legal]);

 const recommendations=useMemo(()=>recommendCatalog(sourceCatalog,{sector:companyContext.sector,size:companyContext.size,maturity:companyContext.maturity,priorities:companyContext.priorities,targetFramework},enrichedFrameworks).slice(0,6),[companyContext,targetFramework]);
 const visible=rows.slice(0,limit);
 const activeFilters=[category!=='Toutes',type!=='Tous',priority!=='Toutes',model!=='Tous',status!=='Tous',legal!=='Tous',!!q.trim()].filter(Boolean).length;
 function reset(){setQ('');setCategory('Toutes');setType('Tous');setPriority('Toutes');setModel('Tous');setStatus('Tous');setLegal('Tous');setLimit(30)}
 function focusRecommendation(item:{category:string;type:string;priority:string}){setCategory(item.category);setType(item.type);setPriority(item.priority);setModel('Tous');setStatus('Tous');setLegal('Tous');setQ('');setLimit(30);document.getElementById('catalogue-source')?.scrollIntoView({behavior:'smooth',block:'start'})}
 return <div className="modulePage">
  <div className="moduleHead"><span className="kicker">BIBLIOTHÈQUE DOCUMENTAIRE RSE</span><h1>Choisissez le document utile, puis adaptez-le à votre entreprise.</h1><p className="actionLead">Deux façons de travailler : créer un document libre ou partir du catalogue expert, filtrer les 342 références et sélectionner celle à personnaliser.</p></div>

  <div className="catalogActions">
   <Link href="/library/catalog/new/" className="free"><Plus/><div><small>CRÉATION LIBRE</small><b>Créer un document libre</b><span>Construire une page sur mesure avec vos propres sections.</span></div><ArrowRight/></Link>
   <a href="#catalogue-source" className="expert"><Sparkles/><div><small>CATALOGUE EXPERT</small><b>Partir d’un modèle expert</b><span>Explorer, filtrer puis personnaliser l’un des {sourceCatalogCount} documents source.</span></div><ArrowRight/></a>
  </div>

  <div className="catalogPilot">
   <div><BookOpen/><span><b>{sourceCatalogCount}</b> documents disponibles</span><small>catalogue source complet</small></div>
   <div><FilePenLine/><span><b>{msdgRseTemplates.length}</b> modèles enrichis</span><small>trames spécialisées déjà détaillées</small></div>
   <div><SlidersHorizontal/><span><b>{rows.length}</b> résultats</span><small>{activeFilters?`${activeFilters} filtre${activeFilters>1?'s':''} actif${activeFilters>1?'s':''}`:'aucun filtre actif'}</small></div>
  </div>

  <section className="recommendPanel">
   <div className="recommendHead"><div className="recommendTitle"><Target/><div><span className="kicker">PILOTAGE DOCUMENTAIRE</span><h2>Les documents recommandés pour votre entreprise.</h2><p>{companyContext.priorities.length?'Le classement combine votre secteur, votre taille, votre maturité et les 3 priorités de votre dernier diagnostic.':'Le classement utilise votre profil disponible et privilégie le socle P1. Réalisez le diagnostic pour obtenir une recommandation plus précise.'}</p></div></div><label><span>Objectif / référentiel visé</span><select value={targetFramework} onChange={e=>setTargetFramework(e.target.value)}>{frameworkTargets.map(x=><option key={x}>{x}</option>)}</select><small>Ce choix affine le classement recommandé.</small></label></div>
   <div className="contextLine">{contextLoaded?<><Building2/><span>{companyContext.name||'Votre entreprise'}</span>{companyContext.sector&&<b>{companyContext.sector}</b>}{companyContext.size&&<b>{companyContext.size} personnes</b>}{companyContext.maturity&&<b>{companyContext.maturity}</b>}{companyContext.priorities.map((x,i)=><em key={x}>P{i+1} · {x}</em>)}</>:<span>Analyse de votre contexte…</span>}</div>
   <div className="recommendGrid">{recommendations.map((item,index)=><article key={item.id} className={index===0?'top':''}><div className="recommendRank"><span>#{index+1}</span><b>{item.priority}</b></div><small>{item.category}</small><h3>{item.title}</h3><div className="recommendReasons">{item.reasons.slice(0,3).map(x=><span key={x}>✓ {x}</span>)}</div><footer><button type="button" onClick={()=>focusRecommendation(item)}>Voir les documents proches</button><Link href={`/library/catalog/editor/?id=${item.id}`}>Personnaliser <ArrowRight/></Link></footer></article>)}</div>
   <div className="recommendFoot"><span>Les recommandations servent à prioriser le travail documentaire ; elles ne remplacent pas l’analyse de l’applicabilité réglementaire ou contractuelle.</span><a href="#catalogue-source">Explorer les {sourceCatalogCount} documents →</a></div>
  </section>

  <section id="catalogue-source" className="catalogBrowser">
   <div className="catalogBrowserHead"><div><span className="kicker">CATALOGUE SOURCE · VERSION {msdgCatalogVersion}</span><h2>Trouvez le bon document en quelques secondes.</h2><p>Commencez par la priorité P1 pour le socle, puis affinez par thème, type de document ou niveau de revue juridique.</p></div>{activeFilters>0&&<button type="button" className="resetFilters" onClick={reset}><RotateCcw/> Réinitialiser</button>}</div>

   <div className="catalogFilters">
    <label className="catalogSearch"><Search/><input value={q} onChange={e=>{setQ(e.target.value);setLimit(30)}} placeholder="Rechercher par nom, ID, thème, type…"/></label>
    <label><span>Thème</span><select value={category} onChange={e=>{setCategory(e.target.value);setLimit(30)}}><option>Toutes</option>{sourceCatalogCategories.map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>Type</span><select value={type} onChange={e=>{setType(e.target.value);setLimit(30)}}><option>Tous</option>{sourceCatalogTypes.map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>Priorité</span><select value={priority} onChange={e=>{setPriority(e.target.value);setLimit(30)}}><option>Toutes</option><option>P1</option><option>P2</option><option>P3</option></select></label>
    <label><span>Modèle</span><select value={model} onChange={e=>{setModel(e.target.value);setLimit(30)}}><option>Tous</option>{sourceCatalogModels.map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>Niveau d’édition</span><select value={status} onChange={e=>{setStatus(e.target.value);setLimit(30)}}><option>Tous</option><option value="Enrichis">Modèles enrichis</option><option value="Source">Catalogue source</option></select></label>
    <label><span>Revue juridique</span><select value={legal} onChange={e=>{setLegal(e.target.value);setLimit(30)}}><option>Tous</option><option>Oui</option><option>Selon contexte</option></select></label>
   </div>

   <div className="catalogLegend"><span><b>P1</b> socle prioritaire</span><span><b>P2</b> important selon activité</span><span><b>P3</b> avancé ou conditionnel</span><span><ShieldCheck/> Les mentions de revue juridique restent visibles avant personnalisation.</span></div>

   {rows.length?<><div className="catalogList">{visible.map(item=>{const enriched=enrichedIds.has(item.id);return <article key={item.id} className={enriched?'enriched':''}>
    <div className="catalogIdentity"><span className="catalogId">{item.id}</span><span className={`priorityBadge ${item.priority.toLowerCase()}`}>{item.priority}</span>{enriched&&<span className="enrichedBadge">Modèle enrichi</span>}</div>
    <div className="catalogMain"><small>{item.category}</small><h3>{item.title}</h3><div className="catalogTags"><span>{item.type}</span><span>{item.model}</span><span>{item.refCount} réf.</span>{item.legalReview==='Oui'&&<span className="legal">Revue juridique requise</span>}</div></div>
    <div className="catalogAction"><p>{enriched?'Trame spécialisée prête à préremplir.':'Base structurée à adapter au contexte de l’entreprise.'}</p><Link href={`/library/catalog/editor/?id=${item.id}`}>{enriched?'Personnaliser':'Utiliser ce modèle'} <ArrowRight/></Link></div>
   </article>})}</div>{visible.length<rows.length&&<div className="loadMore"><button type="button" className="secondaryButton" onClick={()=>setLimit(x=>x+30)}>Afficher 30 documents de plus <span>{visible.length}/{rows.length}</span></button></div>}</>:<div className="catalogEmpty"><Search/><h3>Aucun document ne correspond à ces filtres.</h3><p>Élargissez votre recherche ou réinitialisez les filtres.</p><button type="button" className="secondaryButton" onClick={reset}>Réinitialiser les filtres</button></div>}
  </section>

  <p className="catalogNote">Le catalogue source comporte {sourceCatalogCount} références. Les {msdgRseTemplates.length} modèles enrichis disposent d’une trame éditoriale spécialisée ; les autres ouvrent une base structurée à personnaliser et à valider selon le contexte de l’entreprise.</p>
  <style jsx>{`
   .catalogActions{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.catalogActions :global(a){display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:20px;border:1px solid #cfe0dc;border-radius:16px;background:#fff;color:#153b46;text-decoration:none}.catalogActions :global(a.expert){border-color:#9bcdb6;background:#f3faf7}.catalogActions :global(svg){width:24px;color:#64aa86}.catalogActions :global(a>svg:last-child){width:17px}.catalogActions small{display:block;font-size:9px;font-weight:900;letter-spacing:.08em;color:#578171}.catalogActions b{display:block;font-size:15px;margin:3px 0}.catalogActions span{display:block;font-size:10px;color:#6f8387}.catalogPilot{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 24px}.catalogPilot>div{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;padding:14px;border:1px solid #dbe6e3;border-radius:12px;background:#fff}.catalogPilot svg{grid-row:1/3;width:19px;color:#64aa86}.catalogPilot span{font-size:11px;color:#153b46}.catalogPilot span b{font-size:20px;margin-right:4px}.catalogPilot small{font-size:9px;color:#7b8f93}.recommendPanel{margin:0 0 28px;padding:20px;border:1px solid #b9d9ca;border-radius:17px;background:linear-gradient(180deg,#f5fbf8 0,#fff 100%)}.recommendHead{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:20px;align-items:end}.recommendTitle{display:flex;gap:12px}.recommendTitle>svg{width:25px;color:#64aa86;flex:none;margin-top:4px}.recommendHead h2{font-size:23px;margin:4px 0 5px}.recommendHead p{font-size:11px;color:#657d82;margin:0;line-height:1.5}.recommendHead label>span{display:block;font-size:9px;font-weight:900;color:#56747a;margin-bottom:5px}.recommendHead select{width:100%;height:42px;border:1px solid #bcd3cc;border-radius:9px;background:#fff;padding:0 10px;color:#153b46}.recommendHead label small{display:block;margin-top:4px;font-size:8px;color:#7d9195}.contextLine{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:16px 0 12px;padding:9px 11px;border-radius:9px;background:#eef7f3;color:#58727a;font-size:9px}.contextLine svg{width:14px;color:#39785b}.contextLine>span{font-weight:900;color:#153b46}.contextLine b,.contextLine em{padding:3px 6px;border-radius:999px;background:#fff;font-style:normal;font-weight:700}.contextLine em{color:#39785b}.recommendGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.recommendGrid article{min-width:0;padding:14px;border:1px solid #dae7e3;border-radius:12px;background:#fff}.recommendGrid article.top{border-color:#83bea2;box-shadow:inset 0 3px 0 #64aa86}.recommendRank{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.recommendRank span{font-size:15px;font-weight:900;color:#64aa86}.recommendRank b{font-size:8px;padding:4px 6px;border-radius:999px;background:#e9f5ef;color:#2e7757}.recommendGrid article>small{font-size:8px;color:#798d91}.recommendGrid h3{font-size:13px;margin:5px 0 8px}.recommendReasons{display:grid;gap:3px;min-height:44px}.recommendReasons span{font-size:8px;color:#657d82}.recommendGrid footer{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #edf2f1;margin-top:10px;padding-top:9px}.recommendGrid footer button{border:0;background:transparent;padding:0;color:#72888c;font-size:8px;cursor:pointer;text-align:left}.recommendGrid footer :global(a){display:flex;align-items:center;gap:4px;color:#297a59;font-size:9px;font-weight:900;text-decoration:none}.recommendGrid footer :global(svg){width:12px}.recommendFoot{display:flex;justify-content:space-between;gap:15px;margin-top:12px;color:#7b8f93;font-size:8px}.recommendFoot a{color:#39785b;font-weight:900;text-decoration:none;white-space:nowrap}.catalogBrowser{scroll-margin-top:20px;border-top:1px solid #dbe6e3;padding-top:22px}.catalogBrowserHead{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:16px}.catalogBrowserHead h2{margin:4px 0 6px;font-size:23px}.catalogBrowserHead p{margin:0;color:#6c8185;font-size:11px}.resetFilters{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:#39785b;font-weight:800;cursor:pointer;padding:8px}.resetFilters svg{width:15px}.catalogFilters{display:grid;grid-template-columns:2fr repeat(3,1fr);gap:9px;padding:14px;border:1px solid #dbe6e3;border-radius:14px;background:#f7faf9}.catalogFilters label{min-width:0}.catalogFilters label>span{display:block;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#6f8589;margin:0 0 4px}.catalogFilters select,.catalogFilters input{width:100%;height:42px;border:1px solid #cbdad6;border-radius:9px;background:#fff;padding:0 10px;color:#153b46;font:inherit;font-size:11px}.catalogSearch{grid-column:span 2;position:relative}.catalogSearch svg{position:absolute;left:12px;bottom:11px;width:18px;color:#789096}.catalogSearch input{padding-left:38px}.catalogLegend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:12px 2px 16px;color:#6d8286;font-size:9px}.catalogLegend span{display:flex;align-items:center;gap:5px}.catalogLegend b{color:#153b46}.catalogLegend svg{width:13px}.catalogList{display:grid;gap:8px}.catalogList article{display:grid;grid-template-columns:115px minmax(0,1fr) 250px;gap:14px;align-items:center;padding:14px 16px;border:1px solid #dbe6e3;border-radius:12px;background:#fff}.catalogList article.enriched{border-color:#acd4c2;background:#fbfefd}.catalogIdentity{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.catalogId,.priorityBadge,.enrichedBadge{font-size:8px;font-weight:900;padding:4px 6px;border-radius:999px;background:#eef4f2;color:#4f6f73}.priorityBadge.p1{background:#e6f5ee;color:#287251}.priorityBadge.p2{background:#f4f2e8;color:#776c34}.priorityBadge.p3{background:#f2f2f2;color:#6d7374}.enrichedBadge{background:#eaf5fb;color:#177aa4}.catalogMain small{display:block;color:#71868a;font-size:8px;margin-bottom:3px}.catalogMain h3{font-size:14px;margin:0 0 6px;color:#153b46}.catalogTags{display:flex;flex-wrap:wrap;gap:5px}.catalogTags span{font-size:8px;padding:3px 5px;border-radius:5px;background:#f1f5f4;color:#60787d}.catalogTags .legal{background:#fff2e7;color:#9a5d21}.catalogAction{border-left:1px solid #e4ecea;padding-left:14px}.catalogAction p{margin:0 0 6px;color:#71868a;font-size:9px;line-height:1.4}.catalogAction :global(a){display:inline-flex;align-items:center;gap:6px;color:#297a59;font-size:10px;font-weight:900;text-decoration:none}.catalogAction :global(svg){width:14px}.loadMore{text-align:center;padding:18px}.loadMore :global(button){min-width:260px;justify-content:center}.loadMore span{opacity:.65;margin-left:6px}.catalogEmpty{text-align:center;padding:42px 20px;border:1px dashed #cddbd7;border-radius:14px}.catalogEmpty svg{width:26px;color:#789096}.catalogEmpty h3{margin:10px 0 5px}.catalogEmpty p{font-size:11px;color:#71868a}.catalogNote{font-size:9px;color:#7c9195;margin-top:18px;line-height:1.5}@media(max-width:1000px){.catalogFilters{grid-template-columns:1fr 1fr}.catalogSearch{grid-column:span 2}.catalogList article{grid-template-columns:95px minmax(0,1fr)}.catalogAction{grid-column:2;border-left:0;border-top:1px solid #e4ecea;padding:8px 0 0}.recommendGrid{grid-template-columns:1fr 1fr}}@media(max-width:700px){.catalogActions,.catalogPilot,.catalogFilters,.recommendHead,.recommendGrid{grid-template-columns:1fr}.catalogSearch{grid-column:auto}.catalogList article{grid-template-columns:1fr}.catalogAction{grid-column:auto}.catalogBrowserHead{display:block}.resetFilters{margin-top:8px}.catalogActions :global(a){padding:16px}.recommendFoot{display:block}.recommendFoot a{display:block;margin-top:8px}}
  `}</style>
 </div>
}
