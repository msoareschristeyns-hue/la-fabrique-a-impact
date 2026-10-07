'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {
  ArrowLeft,ArrowRight,BookOpen,CheckCircle2,Clock3,Download,ExternalLink,
  FileText,Headphones,Lightbulb,Play,PlayCircle,RefreshCw,Rocket,Search,
  Settings2,Sparkles,Target
} from 'lucide-react';
import {supabase} from '../../lib/supabase';

type Resource={
  id:string;title:string;description:string|null;resource_type:'video'|'podcast'|'support';
  theme:string|null;duration_minutes:number|null;url:string|null;sort_order:number;
  journey_block:string;is_required:boolean;access_level:'free'|'premium'
};
type Progress={resource_id:string;status:'not_started'|'in_progress'|'completed';progress_percent:number};

const types=[['all','Tous'],['video','Vidéos'],['podcast','Podcasts'],['support','Supports']] as const;
const blocks=[
  {key:'comprendre',title:'Comprendre la RSE',desc:'Les fondamentaux pour partager un langage commun.',icon:BookOpen},
  {key:'idees-recues',title:'Dépasser les idées reçues',desc:'Lever les freins et remettre les faits au centre.',icon:Lightbulb},
  {key:'enjeux',title:'Structurer les enjeux',desc:'Relier la RSE aux attentes clients, aux risques et aux enjeux de l’entreprise.',icon:Target},
  {key:'passer-action',title:'Passer à l’action',desc:'Transformer les intentions en premières actions concrètes.',icon:Rocket},
  {key:'aller-plus-loin',title:'Aller plus loin',desc:'Approfondir et structurer la démarche dans la durée.',icon:Sparkles}
];

function youtubeId(url:string|null){
  if(!url)return null;
  try{
    const u=new URL(url);const host=u.hostname.replace(/^www\./,'');
    if(host==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||null;
    if(host==='youtube.com'||host==='m.youtube.com'||host==='music.youtube.com'){
      if(u.pathname==='/watch')return u.searchParams.get('v');
      const parts=u.pathname.split('/').filter(Boolean);
      if(['embed','shorts','live'].includes(parts[0]))return parts[1]||null;
    }
  }catch{}
  return null;
}

function YoutubeCapsule({resource,onStart}:{resource:Resource;onStart:()=>void}){
  const id=youtubeId(resource.url);const[playing,setPlaying]=useState(false);
  if(!id)return null;
  const play=()=>{setPlaying(true);onStart()};
  return <div className="youtubeCapsule">
    {playing
      ?<div className="youtubeFrame"><iframe src={'https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1'} title={resource.title} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen/></div>
      :<button className="youtubePreview" onClick={play} aria-label={'Lire '+resource.title}>
        <img src={'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'} alt="" loading="lazy"/>
        <span className="youtubePlay"><Play/></span>
        <span className="youtubePreviewLabel">Lire la vidéo</span>
      </button>}
    <div className="youtubeCapsuleBar"><span><PlayCircle/> Vidéo</span><a href={resource.url||'#'} target="_blank" rel="noreferrer"><ExternalLink/> YouTube</a></div>
  </div>
}

export default function LearningPage(){
  const[resources,setResources]=useState<Resource[]>([]);
  const[progress,setProgress]=useState<Record<string,Progress>>({});
  const[companyId,setCompanyId]=useState('');
  const[userId,setUserId]=useState('');
  const[isAdmin,setIsAdmin]=useState(false);
  const[type,setType]=useState('all');
  const[theme,setTheme]=useState('Tous');
  const[q,setQ]=useState('');
  const[activeBlock,setActiveBlock]=useState(0);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState('');

  async function load(){
    setLoading(true);setError('');
    try{
      const{data:{user}}=await supabase.auth.getUser();
      if(!user){setError('Session utilisateur introuvable.');return}
      setUserId(user.id);

      const[{data:r,error:rError},{data:a}]=await Promise.all([
        supabase.from('learning_resources').select('id,title,description,resource_type,theme,duration_minutes,url,sort_order,journey_block,is_required,access_level').eq('is_published',true).eq('journey_step',1).order('sort_order').order('updated_at',{ascending:false}),
        supabase.from('platform_admins').select('user_id').eq('user_id',user.id).maybeSingle()
      ]);
      if(rError){setError('Les contenus publiés n’ont pas pu être chargés.');return}
      setResources((r||[]) as Resource[]);
      setIsAdmin(!!a);

      const{data:m}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();
      if(!m){setCompanyId('');setProgress({});return}
      setCompanyId(m.company_id);
      const{data:p}=await supabase.from('learning_progress').select('resource_id,status,progress_percent').eq('company_id',m.company_id).eq('user_id',user.id);
      const map:Record<string,Progress>={};
      (p||[]).forEach((x:any)=>map[x.resource_id]=x);
      setProgress(map);

      const published=(r||[]) as Resource[];
      const nextIndex=blocks.findIndex(b=>{
        const required=published.filter(x=>x.journey_block===b.key&&x.is_required);
        return required.length>0&&required.some(x=>map[x.id]?.status!=='completed');
      });
      if(nextIndex>=0)setActiveBlock(nextIndex);
    }finally{setLoading(false)}
  }

  useEffect(()=>{load()},[]);

  const themes=useMemo(()=>['Tous',...resources.map(r=>r.theme||'Autre').filter((x,i,a)=>a.indexOf(x)===i)],[resources]);
  const required=resources.filter(r=>r.is_required);
  const requiredDone=required.filter(r=>progress[r.id]?.status==='completed').length;
  const stepPct=required.length?Math.round(requiredDone/required.length*100):0;
  const completed=Object.values(progress).filter(p=>p.status==='completed').length;

  const block=blocks[activeBlock];
  const blockResources=resources.filter(r=>(r.journey_block||'aller-plus-loin')===block.key);
  const blockRequired=blockResources.filter(r=>r.is_required);
  const blockRequiredDone=blockRequired.filter(r=>progress[r.id]?.status==='completed').length;
  const blockPct=blockRequired.length?Math.round(blockRequiredDone/blockRequired.length*100):0;

  const filtered=useMemo(()=>blockResources.filter(r=>
    (type==='all'||r.resource_type===type)&&
    (theme==='Tous'||(r.theme||'Autre')===theme)&&
    ((r.title+' '+(r.description||'')+' '+(r.theme||'')).toLowerCase().includes(q.toLowerCase()))
  ),[blockResources,type,theme,q]);

  async function setStatus(resourceId:string,status:'in_progress'|'completed'){
    if(!companyId||!userId)return;
    const existing=progress[resourceId];
    if(existing?.status==='completed'&&status==='in_progress')return;
    const pct=status==='completed'?100:25;
    const payload={company_id:companyId,user_id:userId,resource_id:resourceId,status,progress_percent:pct,completed_at:status==='completed'?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const{error}=await supabase.from('learning_progress').upsert(payload,{onConflict:'company_id,user_id,resource_id'});
    if(!error)setProgress(v=>({...v,[resourceId]:{resource_id:resourceId,status,progress_percent:pct}}));
  }

  function iconFor(r:Resource){return r.resource_type==='video'?<PlayCircle/>:r.resource_type==='podcast'?<Headphones/>:<FileText/>}
  function selectBlock(index:number){setActiveBlock(index);setQ('');setType('all');setTheme('Tous');window.scrollTo({top:0,behavior:'smooth'})}

  if(loading)return <p>Chargement de votre espace de formation…</p>;

  const ActiveIcon=block.icon;

  return <div className="modulePage learningPage">
    <section className="learningHeader">
      <div className="learningHeaderTop">
        <div>
          <span className="kicker">ÉTAPE 1 SUR 5 · COMPRENDRE</span>
          <h1>Poser les bases d’une démarche RSE qui tient la route.</h1>
          <p>Avancez bloc par bloc, validez les contenus recommandés puis passez au diagnostic quand vous êtes prêt.</p>
        </div>
        {isAdmin&&<Link className="adminShortcut" href="/admin/"><Settings2/> Gérer les contenus</Link>}
      </div>
      <div className="learningGlobalProgress">
        <div><span>Progression de l’étape</span><b>{stepPct}%</b></div>
        <div className="progressTrack"><i style={{width:String(stepPct)+'%'}}/></div>
      </div>
    </section>

    {error&&<div className="learningError"><span>{error}</span><button onClick={load}><RefreshCw/> Réessayer</button></div>}

    <div className="learningStats">
      <article><span>Terminés</span><b>{completed}</b><small>contenus</small></article>
      <article><span>Publiés</span><b>{resources.length}</b><small>ressources</small></article>
      <article><span>Recommandés</span><b>{requiredDone}/{required.length}</b><small>validés</small></article>
      <article><span>Bloc actuel</span><b>{activeBlock+1}/5</b><small>{block.title}</small></article>
    </div>

    <nav className="blockStepper" aria-label="Blocs de sensibilisation">
      {blocks.map((b,index)=>{
        const Icon=b.icon;
        const items=resources.filter(r=>r.journey_block===b.key);
        const req=items.filter(r=>r.is_required);
        const done=req.length>0&&req.every(r=>progress[r.id]?.status==='completed');
        return <button key={b.key} className={(index===activeBlock?'active ':'')+(done?'done':'')} onClick={()=>selectBlock(index)}>
          <span className="blockNumber">{done?<CheckCircle2/>:index+1}</span>
          <span><small>BLOC {index+1}</small><b>{b.title}</b></span>
          {index===activeBlock&&<ArrowRight/>}
        </button>
      })}
    </nav>

    <section className="activeBlock">
      <header className="activeBlockHead">
        <div className="blockIdentity"><span className="blockIcon"><ActiveIcon/></span><div><span className="kicker">BLOC {activeBlock+1} SUR 5</span><h2>{block.title}</h2><p>{block.desc}</p></div></div>
        <div className="blockCompletion"><b>{blockPct}%</b><span>{blockRequiredDone}/{blockRequired.length} recommandé{blockRequired.length>1?'s':''}</span></div>
      </header>

      <div className="learningControls">
        <label className="learningSearch"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher dans ce bloc…"/></label>
        <div className="formatButtons">{types.map(([value,label])=><button key={value} className={type===value?'active':''} onClick={()=>setType(value)}>{label}</button>)}</div>
        <select value={theme} onChange={e=>setTheme(e.target.value)}>{themes.map(t=><option key={t}>{t}</option>)}</select>
      </div>

      {filtered.length?<div className="resourceGrid">
        {filtered.map(r=>{
          const done=progress[r.id]?.status==='completed';
          const yt=r.resource_type==='video'?youtubeId(r.url):null;
          return <article className={'resourceCard '+(done?'completed':'')} key={r.id}>
            {yt?<YoutubeCapsule resource={r} onStart={()=>setStatus(r.id,'in_progress')}/>:<div className="resourceVisual">{iconFor(r)}</div>}
            <div className="resourceBody">
              <div className="resourceMeta"><span>{r.theme||'RSE'}</span>{r.duration_minutes&&<span><Clock3/> {r.duration_minutes} min</span>}</div>
              <h3>{r.title}</h3>
              <p>{r.description||'Contenu pédagogique de sensibilisation RSE.'}</p>
              <div className="resourceBadges"><span>{r.resource_type==='video'?'VIDÉO':r.resource_type==='podcast'?'PODCAST':'SUPPORT'}</span>{r.is_required&&<span className="required">RECOMMANDÉ</span>}{r.access_level==='premium'&&<span className="premium">PREMIUM</span>}</div>
              <div className="resourceActions">
                {!yt&&r.url?<a className="resourcePrimary" href={r.url} target="_blank" rel="noreferrer" onClick={()=>setStatus(r.id,'in_progress')}>{r.resource_type==='support'?<Download/>:<Headphones/>}{r.resource_type==='support'?'Ouvrir le support':'Écouter'}</a>:!r.url?<button className="resourceDisabled" disabled>Contenu bientôt disponible</button>:null}
                {companyId&&<button className={'resourceComplete '+(done?'done':'')} onClick={()=>setStatus(r.id,'completed')}><CheckCircle2/>{done?'Terminé':'Marquer comme terminé'}</button>}
              </div>
            </div>
          </article>
        })}
      </div>:<div className="blockEmpty"><BookOpen/><h3>Aucun contenu dans ce bloc</h3><p>{isAdmin?'Ajoutez une vidéo, un podcast ou un support depuis le mode administrateur.':'Aucun contenu publié ne correspond aux filtres actuels.'}</p>{isAdmin&&<Link href="/admin/" className="adminShortcut"><Settings2/> Ajouter un contenu</Link>}</div>}

      <footer className="blockNavigation">
        <div>{activeBlock>0&&<button className="navSecondary" onClick={()=>selectBlock(activeBlock-1)}><ArrowLeft/> Bloc précédent</button>}</div>
        <div className="blockNavCenter"><span>BLOC {activeBlock+1} / 5</span><div className="miniDots">{blocks.map((_,i)=><i key={i} className={i<=activeBlock?'active':''}/>)}</div></div>
        <div>{activeBlock<blocks.length-1
          ?<button className="navPrimary" onClick={()=>selectBlock(activeBlock+1)}>Bloc suivant <ArrowRight/></button>
          :<Link className="navPrimary" href="/diagnostic/">Passer au diagnostic <ArrowRight/></Link>}
        </div>
      </footer>
    </section>

    <style jsx>{`
      .learningPage{max-width:1320px}.learningHeader{background:linear-gradient(135deg,#fff 58%,#eef8fc);border:1px solid #dce7e5;border-radius:18px;padding:28px 30px;margin-bottom:14px}.learningHeaderTop{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}.learningHeader h1{max-width:760px;margin:6px 0 9px;font-size:38px;line-height:1.08}.learningHeader p{max-width:760px;margin:0;color:#60767b;line-height:1.55;font-size:13px}.adminShortcut{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 13px;border-radius:10px;background:#153b46;color:#fff;text-decoration:none;font-size:10px;font-weight:900;white-space:nowrap}.adminShortcut :global(svg){width:15px}.learningGlobalProgress{display:grid;grid-template-columns:180px 1fr;gap:16px;align-items:center;margin-top:22px}.learningGlobalProgress>div:first-child{display:flex;justify-content:space-between;gap:8px}.learningGlobalProgress span{font-size:9px;color:#72878b;font-weight:850}.learningGlobalProgress b{font-size:11px;color:#153b46}.progressTrack{height:8px;background:#e5eeeb;border-radius:999px;overflow:hidden}.progressTrack i{display:block;height:100%;background:linear-gradient(90deg,#64aa86,#0797d5);border-radius:999px}.learningError{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff1ee;border:1px solid #f0c8be;color:#8a4235;padding:11px 13px;border-radius:10px;margin-bottom:12px;font-size:11px}.learningError button{border:0;background:transparent;color:inherit;font-weight:850;display:flex;align-items:center;gap:6px;cursor:pointer}.learningError :global(svg){width:14px}.learningStats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #dce7e5;background:#fff;border-radius:12px;overflow:hidden;margin-bottom:14px}.learningStats article{padding:12px 14px;border-right:1px solid #edf2f0}.learningStats article:last-child{border-right:0}.learningStats span{display:block;font-size:8px;font-weight:900;color:#7a8f93;text-transform:uppercase;letter-spacing:.55px}.learningStats b{display:block;margin:3px 0 1px;font-size:18px;color:#153b46}.learningStats small{font-size:9px;color:#71868b}.blockStepper{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:14px}.blockStepper button{min-width:0;min-height:62px;border:1px solid #dce7e4;border-radius:11px;background:#fff;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;padding:9px 10px;text-align:left;color:#607980;cursor:pointer;transition:.15s ease}.blockStepper button:hover{border-color:#bcd7cf;transform:translateY(-1px)}.blockStepper button.active{background:#153b46;color:#fff;border-color:#153b46;box-shadow:0 7px 16px rgba(21,59,70,.13)}.blockStepper button.done:not(.active){background:#f3faf6;border-color:#cee4d8;color:#3e7059}.blockNumber{width:28px;height:28px;border-radius:9px;background:#eef5f3;display:grid;place-items:center;font-size:10px;font-weight:900;color:#55746e}.active .blockNumber{background:#ffffff1c;color:#fff}.done:not(.active) .blockNumber{background:#dff1e7;color:#39785b}.blockNumber :global(svg){width:14px}.blockStepper small{display:block;font-size:7px;font-weight:900;opacity:.7}.blockStepper b{display:block;margin-top:2px;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.blockStepper>button>svg{width:13px}.activeBlock{background:#fff;border:1px solid #dce7e5;border-radius:16px;overflow:hidden}.activeBlockHead{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 20px;border-bottom:1px solid #edf2f0;background:#fbfdfc}.blockIdentity{display:flex;align-items:center;gap:12px}.blockIcon{width:42px;height:42px;border-radius:12px;background:#eaf7fc;color:#0797d5;display:grid;place-items:center}.blockIcon :global(svg){width:20px}.blockIdentity h2{margin:2px 0 3px;font-size:20px}.blockIdentity p{margin:0;color:#6f8589;font-size:10px}.blockCompletion{text-align:right}.blockCompletion b{display:block;font-size:19px;color:#153b46}.blockCompletion span{font-size:8px;color:#788d91}.learningControls{display:grid;grid-template-columns:minmax(240px,1fr) auto 180px;gap:9px;padding:14px 20px;border-bottom:1px solid #edf2f0}.learningSearch{display:flex;align-items:center;gap:8px;border:1px solid #dbe6e3;border-radius:9px;padding:0 10px;min-height:38px}.learningSearch :global(svg){width:15px;color:#809397}.learningSearch input{width:100%;border:0;outline:0;background:transparent;font-size:11px}.formatButtons{display:flex;gap:5px}.formatButtons button{min-height:38px;padding:0 10px;border:1px solid #dbe6e3;border-radius:9px;background:#fff;color:#607980;font-size:9px;font-weight:850;cursor:pointer}.formatButtons button.active{background:#153b46;color:#fff;border-color:#153b46}.learningControls select{border:1px solid #dbe6e3;border-radius:9px;background:#fff;color:#607980;padding:0 9px;font-size:10px}.resourceGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:16px 20px}.resourceCard{border:1px solid #dce7e4;border-radius:13px;overflow:hidden;background:#fff;display:flex;flex-direction:column;min-width:0;box-shadow:0 5px 16px rgba(21,59,70,.035)}.resourceCard.completed{border-color:#cde3d7;background:#fcfefc}.resourceVisual{height:110px;background:linear-gradient(135deg,#eef8f4,#edf7fb);display:grid;place-items:center;color:#0797d5}.resourceVisual :global(svg){width:32px}.resourceBody{padding:15px;display:flex;flex-direction:column;flex:1}.resourceMeta{display:flex;gap:8px;justify-content:space-between;color:#7a8e92;font-size:8px}.resourceMeta span{display:flex;align-items:center;gap:4px}.resourceMeta :global(svg){width:11px}.resourceBody h3{margin:7px 0 4px;font-size:15px;color:#153b46}.resourceBody p{margin:0;color:#71868a;font-size:10px;line-height:1.5}.resourceBadges{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}.resourceBadges span{font-size:7px;font-weight:900;padding:4px 6px;border-radius:999px;background:#edf2f0;color:#657b80}.resourceBadges .required{background:#e6f5ec;color:#39785b}.resourceBadges .premium{background:#fff4d9;color:#8a6418}.resourceActions{display:flex;gap:7px;margin-top:auto;padding-top:14px}.resourcePrimary,.resourceComplete,.resourceDisabled{flex:1;min-height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 9px;font-size:9px;font-weight:900;text-decoration:none}.resourcePrimary{background:#0797d5;color:#fff;border:1px solid #0797d5}.resourceComplete{background:#fff;color:#456b62;border:1px solid #d2e2dc;cursor:pointer}.resourceComplete.done{background:#edf8f1;color:#39785b;border-color:#cde5d7}.resourceDisabled{border:1px solid #e1e8e6;background:#f5f7f6;color:#8b9a9d}.resourceActions :global(svg){width:13px}.youtubeCapsule{background:#102f39}.youtubeFrame{position:relative;width:100%;aspect-ratio:16/9;background:#071d24}.youtubeFrame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.youtubePreview{position:relative;display:block;width:100%;aspect-ratio:16/9;padding:0;border:0;background:#071d24;overflow:hidden;cursor:pointer}.youtubePreview img{width:100%;height:100%;object-fit:cover;display:block;opacity:.9}.youtubePreview:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(5,23,29,.58))}.youtubePlay{position:absolute;left:50%;top:50%;z-index:2;transform:translate(-50%,-50%);width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#0797d5;box-shadow:0 8px 26px rgba(0,0,0,.22)}.youtubePlay :global(svg){width:23px;fill:currentColor}.youtubePreviewLabel{position:absolute;left:13px;bottom:11px;z-index:2;color:#fff;font-size:10px;font-weight:900}.youtubeCapsuleBar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 11px;color:#d8e8e7;font-size:8px;font-weight:850}.youtubeCapsuleBar span,.youtubeCapsuleBar a{display:flex;align-items:center;gap:5px}.youtubeCapsuleBar a{color:#fff;text-decoration:none}.youtubeCapsuleBar :global(svg){width:12px}.blockEmpty{text-align:center;padding:42px 20px}.blockEmpty>svg{width:34px;color:#64aa86}.blockEmpty h3{margin:8px 0 4px}.blockEmpty p{margin:0 auto 14px;color:#71868a;font-size:11px}.blockNavigation{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:14px 20px;border-top:1px solid #edf2f0;background:#fbfdfc}.blockNavigation>div:last-child{display:flex;justify-content:flex-end}.navPrimary,.navSecondary{min-height:40px;border-radius:10px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:10px;font-weight:900;cursor:pointer;text-decoration:none}.navPrimary{background:#0797d5;color:#fff;border:1px solid #0797d5;box-shadow:0 6px 14px rgba(7,151,213,.15)}.navSecondary{background:#fff;color:#456b62;border:1px solid #d2e2dc}.navPrimary :global(svg),.navSecondary :global(svg){width:14px}.blockNavCenter{text-align:center}.blockNavCenter>span{font-size:8px;font-weight:900;color:#7a8e92}.miniDots{display:flex;justify-content:center;gap:4px;margin-top:5px}.miniDots i{width:16px;height:4px;border-radius:999px;background:#dce5e2}.miniDots i.active{background:#64aa86}@media(max-width:1000px){.blockStepper{grid-template-columns:repeat(3,1fr)}.learningControls{grid-template-columns:1fr 180px}.formatButtons{grid-column:1/-1;order:3}.resourceGrid{grid-template-columns:1fr}}@media(max-width:700px){.learningHeader{padding:22px}.learningHeaderTop{display:grid}.learningHeader h1{font-size:30px}.learningGlobalProgress{grid-template-columns:1fr}.learningStats{grid-template-columns:1fr 1fr}.learningStats article:nth-child(2){border-right:0}.learningStats article:nth-child(-n+2){border-bottom:1px solid #edf2f0}.blockStepper{grid-template-columns:1fr}.activeBlockHead{align-items:flex-start}.learningControls{grid-template-columns:1fr}.formatButtons{grid-column:auto;overflow:auto}.learningControls select{min-height:38px}.resourceGrid{padding:12px}.blockNavigation{grid-template-columns:1fr 1fr}.blockNavCenter{grid-column:1/-1;grid-row:1}.blockNavigation>div:first-child,.blockNavigation>div:last-child{grid-row:2}.navPrimary,.navSecondary{width:100%;padding:0 10px}.blockIdentity{align-items:flex-start}.blockCompletion{display:none}}
    `}</style>
  </div>;
}
