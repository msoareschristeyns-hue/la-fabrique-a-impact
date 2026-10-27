'use client';
import Link from 'next/link';
import {useMemo, useState} from 'react';
import {Check, X, ShieldCheck, Gift, Clock3, ArrowRight, Calculator, TrendingUp} from 'lucide-react';
import styles from './tarifs.module.css';

const discovery=[
  ['Diagnostic RSE de base',true],
  ['Copilote RSE limité',true],
  ['Parcours de sensibilisation',true],
  ['Export PDF diagnostic',true],
  ['Plan d’actions 90 jours',false],
  ['Suivi d’actions collaboratif',false],
  ['Bibliothèque de modèles opérationnels',false],
  ['Coffre de preuves RSE',false],
  ['Support prioritaire',false],
];

const premium=[
  ['Diagnostic RSE complet',true],
  ['Copilote RSE contextuel',true],
  ['Parcours de sensibilisation',true],
  ['Export PDF diagnostic',true],
  ['Plan d’actions 90 jours',true],
  ['Suivi d’actions collaboratif',true],
  ['Bibliothèque de modèles opérationnels',true],
  ['Coffre de preuves RSE',true],
  ['Support prioritaire',true],
];

const comparison=[
  ['Diagnostic RSE',true,true],
  ['Copilote RSE','Limité','Contextuel'],
  ['Parcours de sensibilisation',true,true],
  ['Export PDF diagnostic',true,true],
  ['Plan d’actions 90 jours',false,true],
  ['Suivi collaboratif',false,true],
  ['Bibliothèque de modèles',false,true],
  ['Coffre de preuves RSE',false,true],
  ['Support prioritaire',false,true],
];

function Mark({value}:{value:boolean|string}){
  if(value===true)return <Check className={styles.yes}/>;
  if(value===false)return <X className={styles.no}/>;
  return <span className={styles.textValue}>{value}</span>;
}

const euro=(value:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);

export default function Tarifs(){
  const[annual,setAnnual]=useState(false);
  const[hours,setHours]=useState(2);
  const[hourlyRate,setHourlyRate]=useState(30);
  const[otherSavings,setOtherSavings]=useState(0);
  const monthly=annual?40:50;
  const annualCost=monthly*12;
  const roi=useMemo(()=>{
    const monthlyTimeValue=hours*4.33*hourlyRate;
    const monthlyBenefits=monthlyTimeValue+otherSavings;
    const net=monthlyBenefits-monthly;
    return {monthlyTimeValue,monthlyBenefits,net,annualNet:net*12,roiPercent:monthly>0?(net/monthly)*100:0};
  },[hours,hourlyRate,otherSavings,monthly]);
  return <main className={styles.page}>
    <section className={styles.hero}>
      <span className="publicEyebrow publicMenuEyebrow">LA RSE QUI RENFORCE LA PERFORMANCE DE VOTRE ENTREPRISE</span>
      <h1>Choisissez votre offre</h1>
      <p>Pas du reporting. Pas du greenwashing. Un outil structurant, accessible par abonnement, pour aider chaque TPE/PME à initier ou renforcer une démarche RSE claire, mesurable et alignée avec ses priorités business.</p>
      <div className={styles.toggleWrap}>
        <button className={!annual?styles.toggleActive:''} onClick={()=>setAnnual(false)}>Mensuel</button>
        <button className={annual?styles.toggleActive:''} onClick={()=>setAnnual(true)}>Annuel <small>-20 %</small></button>
      </div>
    </section>

    <section className={styles.plans}>
      <article className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.planEyebrow}>DÉCOUVRIR</span>
          <h2>Pack Découverte</h2>
          <p>Commencez par situer votre maturité RSE.</p>
          <div className={styles.price}><b>0 €</b><span>/ mois</span></div>
          <small>Gratuit pour toujours</small>
        </div>
        <ul>{discovery.map(([label,ok])=><li key={String(label)}>{ok?<Check/>:<X className={styles.off}/>}<span>{label}</span></li>)}</ul>
        <Link className={styles.secondaryCta} href="/inscription/">Créer mon espace</Link>
        <Link className={styles.inlineLink} href="/evaluation-rse/">Essayer le diagnostic sans inscription</Link>
      </article>

      <article className={styles.card+' '+styles.premium}>
        <div className={styles.recommended}>RECOMMANDÉ</div>
        <div className={styles.cardHead}>
          <span className={styles.planEyebrow}>STRUCTURER & PILOTER</span>
          <h2>Premium</h2>
          <p>Passez du diagnostic à l’action avec votre équipe.</p>
          <div className={styles.price}><b>{monthly} €</b><span>HT / mois</span></div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:8,padding:'5px 10px',borderRadius:999,background:'#e5f5ec',color:'#23744d',fontSize:11,fontWeight:800}}>
            <span style={{fontSize:15}}>−50 %</span> par rapport à l’ancien tarif de 100 €
          </div>
          <small>{annual?'480 € HT facturés annuellement':'600 € HT sur 12 mois, sans engagement annuel'}</small>
        </div>
        <ul>{premium.map(([label])=><li key={String(label)}><Check/><span>{label}</span></li>)}</ul>
        <Link className={styles.primaryCta} href="/inscription/">Choisir Premium <ArrowRight/></Link>
        <span className={styles.planNote}>{annual?'Équivalent à 40 € HT par mois':'Résiliable à tout moment'}</span>
      </article>
    </section>

    <section style={{width:'min(940px,calc(100% - 40px))',margin:'0 auto 64px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:22,alignItems:'start'}}>
      <div style={{padding:'26px',border:'1px solid #dce7e5',borderRadius:16,background:'#fff'}}>
        <span className="publicEyebrow" style={{display:'inline-flex',alignItems:'center',gap:7}}><Calculator size={16}/> SIMULATEUR DE RENTABILITÉ</span>
        <h2 style={{font:'30px Georgia,serif',margin:'10px 0'}}>Quel retour sur investissement pour votre PME ?</h2>
        <p style={{color:'#667c82',fontSize:13,lineHeight:1.6}}>Estimez la valeur du temps que votre équipe pourrait économiser grâce à une démarche RSE mieux structurée : priorités claires, modèles prêts à l’emploi, suivi des actions et preuves centralisées.</p>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginTop:18}}>Temps potentiellement économisé par semaine : <b>{hours} h</b></label>
        <input aria-label="Heures économisées par semaine" type="range" min="0" max="10" step="0.5" value={hours} onChange={e=>setHours(Number(e.target.value))} style={{width:'100%',accentColor:'#0797d5',marginTop:8}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#71868a'}}><span>0 h</span><span>10 h</span></div>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginTop:18}} htmlFor="hourly-rate">Coût horaire chargé estimé (€)</label>
        <input id="hourly-rate" type="number" min="0" max="500" value={hourlyRate} onChange={e=>setHourlyRate(Math.max(0,Number(e.target.value)||0))} style={{width:'100%',boxSizing:'border-box',padding:'11px 12px',border:'1px solid #dce7e5',borderRadius:8,marginTop:7,fontSize:14}}/>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginTop:18}} htmlFor="other-savings">Autres gains mensuels estimés (€), facultatif</label>
        <input id="other-savings" type="number" min="0" max="100000" value={otherSavings} onChange={e=>setOtherSavings(Math.max(0,Number(e.target.value)||0))} style={{width:'100%',boxSizing:'border-box',padding:'11px 12px',border:'1px solid #dce7e5',borderRadius:8,marginTop:7,fontSize:14}}/>
        <p style={{fontSize:10,color:'#71868a',lineHeight:1.5,marginTop:16}}>Les heures économisées et les autres gains sont vos hypothèses, à ajuster selon votre organisation. Il ne s’agit pas de gains garantis.</p>
      </div>
      <div style={{padding:'26px',borderRadius:16,background:'#153b46',color:'#fff'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:10,fontWeight:900,letterSpacing:1,color:'#9de0c0'}}><TrendingUp size={16}/> VOTRE ESTIMATION</span>
        <h3 style={{font:'28px Georgia,serif',margin:'12px 0 4px'}}>Avec l’offre {annual?'annuelle':'mensuelle'}</h3>
        <p style={{fontSize:12,color:'#d2e2e3',marginTop:0}}>Abonnement : {euro(monthly)} HT/mois</p>
        <div style={{borderTop:'1px solid #45666e',paddingTop:16,marginTop:18}}>
          <div style={{fontSize:11,color:'#d2e2e3'}}>Valeur mensuelle du temps économisé</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:4}}>{euro(roi.monthlyTimeValue)}</div>
        </div>
        <div style={{paddingTop:16}}>
          <div style={{fontSize:11,color:'#d2e2e3'}}>Gains mensuels estimés au total</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:4}}>{euro(roi.monthlyBenefits)}</div>
        </div>
        <div style={{paddingTop:16}}>
          <div style={{fontSize:11,color:'#d2e2e3'}}>Solde estimé après abonnement</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:4,color:roi.net>=0?'#9de0c0':'#ffd1bd'}}>{roi.net>=0?'+':''}{euro(roi.net)} / mois</div>
        </div>
        <div style={{paddingTop:16}}>
          <div style={{fontSize:11,color:'#d2e2e3'}}>Retour sur coût de l’abonnement (estimation)</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:4}}>{Math.round(roi.roiPercent)} %</div>
        </div>
        <div style={{borderTop:'1px solid #45666e',paddingTop:16,marginTop:18,fontSize:12,lineHeight:1.6}}>
          Sur 12 mois : coût de l’abonnement <b>{euro(annualCost)} HT</b>. Solde estimé après abonnement : <b>{euro(roi.annualNet)}</b>.
        </div>
        <p style={{fontSize:10,color:'#d2e2e3',lineHeight:1.5,marginBottom:0}}>Calcul indicatif : (gains estimés − abonnement) ÷ abonnement. La plateforme peut aussi contribuer à la coordination, à la préparation des réponses clients et à la centralisation des preuves, sans valorisation automatique de ces bénéfices.</p>
      </div>
    </section>

    <section className={styles.comparison}>
      <div className={styles.sectionHead}>
        <span>COMPARAISON DÉTAILLÉE</span>
        <h2>Choisissez le niveau d’accompagnement adapté à votre entreprise.</h2>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHead}><b>Fonctionnalité</b><b>Découverte</b><b>Premium</b></div>
        {comparison.map(([label,free,pro])=><div className={styles.row} key={String(label)}><span>{label}</span><div><Mark value={free as boolean|string}/></div><div className={styles.proCol}><Mark value={pro as boolean|string}/></div></div>)}
      </div>
    </section>

    <section className={styles.valueStrip}>
      <div><ShieldCheck/><span><b>Confidentiel</b><small>Vos données restent privées</small></span></div>
      <div><Gift/><span><b>Sans engagement</b><small>Commencez simplement</small></span></div>
      <div><ShieldCheck/><span><b>Paiement sécurisé</b><small>Gestion claire de l’abonnement</small></span></div>
      <div><Clock3/><span><b>Résiliation à tout moment</b><small>Vous gardez la maîtrise</small></span></div>
    </section>
  </main>
}