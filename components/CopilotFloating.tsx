'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Bot,CheckCircle2,FolderCheck,Maximize2,MessageCircle,Send,Sparkles,Target,X} from 'lucide-react';
import {supabase} from '../lib/supabase';

type Context={score:number;sector:string;size:string;priorities:string[]};
type Msg={role:'user'|'assistant';text:string};
const labels:Record<string,string>={
  'Stratégie & gouvernance':'formaliser vos engagements et votre pilotage RSE',
  'Environnement':'mesurer et réduire vos impacts environnementaux',
  'Social & conditions de travail':'structurer vos actions sociales et conditions de travail',
  'Achats responsables':'structurer vos achats responsables',
  'Ancrage territorial':'valoriser votre contribution territoriale',
  'Clients & marché':'préparer les preuves attendues par vos clients'
};

export default function CopilotFloating(){
  const[open,setOpen]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[ctx,setCtx]=useState<Context>({score:0,sector:'',size:'',priorities:[]});
  const[done,setDone]=useState(0);
  const[total,setTotal]=useState(0);
  const[proofs,setProofs]=useState<{pillar:string}[]>([]);
  const[input,setInput]=useState('');
  const[messages,setMessages]=useState<Msg[]>([]);

  useEffect(()=>{(async()=>{try{
    const{data:{user}}=await supabase.auth.getUser();if(!user)return;
    const{data:m}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();if(!m)return;
    const{data:d}=await supabase.from('diagnostics').select('id,score,sector,size_band').eq('company_id',m.company_id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(!d){setLoaded(true);return}
    const{data:p}=await supabase.from('priorities').select('id,pillar').eq('diagnostic_id',d.id).order('rank').limit(3);
    const priorityIds=(p||[]).map(x=>x.id);
    let cycleActions:any[]=[];
    if(priorityIds.length){const{data}=await supabase.from('actions').select('id,status').in('priority_id',priorityIds);cycleActions=data||[]}
    const actionIds=cycleActions.map(a=>a.id);
    let cycleProofs:{pillar:string}[]=[];
    if(actionIds.length){const{data}=await supabase.from('proofs').select('pillar').in('action_id',actionIds);cycleProofs=data||[]}
    setCtx({score:d.score,sector:d.sector||'',size:d.size_band||'',priorities:(p||[]).map(x=>x.pillar)});
    setDone(cycleActions.filter(a=>a.status==='done').length);setTotal(cycleActions.length);setProofs(cycleProofs);
  }finally{setLoaded(true)}})()},[]);

  function answer(q:string){
    const low=q.toLowerCase();const first=ctx.priorities[0];
    if(!first)return'Commencez par réaliser votre diagnostic RSE. Je pourrai ensuite m’appuyer sur vos priorités réelles pour vous orienter.';
    const missing=ctx.priorities.find(x=>!proofs.some(p=>p.pillar===x))||first;
    if(low.includes('preuve')||low.includes('client'))return`Sur votre cycle actuel, la priorité documentaire est « ${missing} ». Commencez par produire ou centraliser une preuve simple sur ce sujet. Vous avez ${proofs.length} preuve${proofs.length>1?'s':''} liée${proofs.length>1?'s':''} à ce cycle.`;
    if(low.includes('semaine')||low.includes('mois')||low.includes('faire'))return`Votre meilleur prochain pas est de ${labels[first]||'traiter votre première priorité RSE'}. Terminez une action du plan 90 jours puis associez sa preuve. Vous avez réalisé ${done} action${done>1?'s':''} sur ${total}.`;
    if(low.includes('score')||low.includes('progres'))return`Votre maturité issue du dernier diagnostic est de ${ctx.score}/100. Sur le cycle actuel, ${done}/${total} actions sont terminées et ${proofs.length} preuves sont associées. Concentrez-vous sur vos 3 priorités : ${ctx.priorities.join(', ')}.`;
    return`Pour votre profil ${ctx.sector}${ctx.size?' · '+ctx.size:''}, commencez par « ${first} ». Transformez cette priorité en une action courte, mesurable et accompagnée d’une preuve.`;
  }
  function send(q=input){if(!q.trim())return;const text=q.trim();setMessages(m=>[...m,{role:'user',text},{role:'assistant',text:answer(text)}]);setInput('')}
  const prompts=['Que dois-je faire cette semaine ?','Quelle preuve me manque ?','Comment progresser ?'];

  return <>
    <button className="copilotFloatButton" aria-label="Ouvrir le copilote RSE" title="Copilote RSE" onClick={()=>setOpen(true)}><Bot/><span>Copilote RSE</span></button>
    {open&&<div className="copilotFloatBackdrop" onClick={()=>setOpen(false)}/>} 
    <aside className={open?'copilotFloatPanel open':'copilotFloatPanel'} aria-hidden={!open}>
      <header><div className="copilotFace"><Bot/></div><div><small>COPILOTE RSE</small><b>Comment puis-je vous aider ?</b></div><button aria-label="Fermer" onClick={()=>setOpen(false)}><X/></button></header>
      {!loaded?<div className="copilotFloatLoading">Chargement du contexte de l’entreprise…</div>:<>
        <div className="copilotFloatContext"><span><Target/> <b>{ctx.score||'—'}/100</b></span><span><CheckCircle2/> <b>{done}/{total}</b></span><span><FolderCheck/> <b>{proofs.length}</b></span></div>
        <div className="copilotFloatPrompts">{prompts.map(p=><button key={p} onClick={()=>send(p)}>{p}</button>)}</div>
        <div className="copilotFloatMessages">{messages.length===0?<div className="copilotFloatWelcome"><MessageCircle/><b>Posez une question sur votre démarche RSE.</b><p>Je m’appuie sur votre dernier diagnostic, vos 3 priorités, vos actions et vos preuves.</p></div>:messages.map((m,i)=><div key={i} className={'copilotFloatMessage '+m.role}>{m.role==='assistant'&&<Sparkles/>}<p>{m.text}</p></div>)}</div>
        <div className="copilotFloatInput"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Posez votre question…"/><button onClick={()=>send()} disabled={!input.trim()}><Send/></button></div>
        <Link className="copilotFloatExpand" href="/copilot/" onClick={()=>setOpen(false)}><Maximize2/> Ouvrir le copilote en grand</Link>
      </>}
    </aside>
    <style jsx>{`
      .copilotFloatButton{position:fixed;right:24px;bottom:24px;z-index:80;border:0;border-radius:999px;background:#0797d5;color:#fff;display:flex;align-items:center;gap:9px;padding:13px 17px;font-weight:800;box-shadow:0 14px 35px rgba(16,47,57,.22);cursor:pointer}.copilotFloatButton svg{width:22px;height:22px}.copilotFloatBackdrop{position:fixed;inset:0;background:rgba(10,30,36,.18);z-index:81}.copilotFloatPanel{position:fixed;right:18px;bottom:18px;z-index:82;width:min(390px,calc(100vw - 36px));max-height:calc(100vh - 36px);background:#fff;border:1px solid #dce7e5;border-radius:20px;box-shadow:0 24px 70px rgba(16,47,57,.28);display:flex;flex-direction:column;overflow:hidden;transform:translateY(24px) scale(.98);opacity:0;pointer-events:none;transition:.2s ease}.copilotFloatPanel.open{transform:none;opacity:1;pointer-events:auto}.copilotFloatPanel header{display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;background:#102f39;color:#fff;padding:16px}.copilotFloatPanel header small{display:block;color:#72c79a;font-size:9px;font-weight:900;letter-spacing:1.2px}.copilotFloatPanel header b{display:block;margin-top:2px}.copilotFloatPanel header button{border:0;background:transparent;color:#d9e7e7;cursor:pointer;padding:7px}.copilotFace{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#64aa86,#0797d5);color:#fff}.copilotFloatLoading,.copilotFloatWelcome{padding:28px;color:#667c82;line-height:1.5}.copilotFloatContext{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #edf2f0}.copilotFloatContext span{display:flex;justify-content:center;align-items:center;gap:5px;padding:11px 4px;font-size:11px;color:#667c82}.copilotFloatContext svg{width:14px;color:#64aa86}.copilotFloatContext b{color:#153b46}.copilotFloatPrompts{display:flex;gap:6px;padding:10px;overflow:auto;border-bottom:1px solid #edf2f0}.copilotFloatPrompts button{white-space:nowrap;border:1px solid #dce7e5;border-radius:999px;background:#f3f8f6;color:#365c65;padding:8px 10px;font-size:10px;font-weight:750;cursor:pointer}.copilotFloatMessages{min-height:230px;max-height:360px;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}.copilotFloatWelcome{text-align:center;padding:34px 18px}.copilotFloatWelcome svg{width:32px;color:#64aa86;margin-bottom:10px}.copilotFloatWelcome b{display:block;color:#153b46}.copilotFloatWelcome p{font-size:12px}.copilotFloatMessage{max-width:88%;border-radius:14px;padding:10px 12px;display:flex;gap:7px;align-items:flex-start;font-size:12px;line-height:1.5}.copilotFloatMessage p{margin:0}.copilotFloatMessage.user{margin-left:auto;background:#0797d5;color:#fff}.copilotFloatMessage.assistant{background:#f3f8f6;color:#294d55}.copilotFloatMessage.assistant svg{width:15px;flex:0 0 auto;color:#64aa86}.copilotFloatInput{display:grid;grid-template-columns:1fr 44px;gap:7px;padding:10px;border-top:1px solid #edf2f0}.copilotFloatInput input{min-width:0;border:1px solid #cbded9;border-radius:10px;padding:11px 12px;outline:none}.copilotFloatInput button{border:0;border-radius:10px;background:#0797d5;color:#fff;display:grid;place-items:center;cursor:pointer}.copilotFloatInput button:disabled{opacity:.45}.copilotFloatInput svg{width:17px}.copilotFloatExpand{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;color:#55737a;text-decoration:none;font-size:11px;font-weight:800;border-top:1px solid #edf2f0}.copilotFloatExpand svg{width:14px}@media(max-width:700px){.copilotFloatButton{right:14px;bottom:14px;width:54px;height:54px;padding:0;justify-content:center}.copilotFloatButton span{display:none}.copilotFloatPanel{right:10px;bottom:10px;width:calc(100vw - 20px);max-height:calc(100vh - 20px)}}
    `}</style>
  </>;
}
