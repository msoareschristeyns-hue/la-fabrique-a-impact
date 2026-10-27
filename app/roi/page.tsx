'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowRight,ChartNoAxesCombined,CheckCircle2} from 'lucide-react';
import RoiCalculator from '../../components/RoiCalculator';
import styles from '../tarifs/tarifs.module.css';

export default function RoiPage(){
  const [annual,setAnnual]=useState(false);
  return <main className={styles.page}>
    <section className={styles.hero}>
      <span className="publicEyebrow publicMenuEyebrow">SIMULATEUR ROI</span>
      <h1>Combien votre PME pourrait-elle gagner en structurant sa RSE ?</h1>
      <p>Estimez l'impact économique potentiel de La Fabrique à Impact en quelques ajustements. Priorités mieux ciblées, temps de recherche réduit, suivi des actions plus simple et documents centralisés : renseignez vos propres hypothèses pour obtenir un résultat réaliste.</p>
      <div className={styles.toggleWrap} role="group" aria-label="Formule d'abonnement">
        <button type="button" className={!annual?styles.toggleActive:''} onClick={()=>setAnnual(false)}>Mensuel : 50 € HT</button>
        <button type="button" className={annual?styles.toggleActive:''} onClick={()=>setAnnual(true)}>Annuel : 40 € HT/mois <small>−20 %</small></button>
      </div>
    </section>
    <RoiCalculator annual={annual}/>
    <section style={{width:'min(940px,calc(100% - 40px))',margin:'0 auto 70px',padding:'28px',border:'1px solid #dce7e5',borderRadius:16,background:'#fff',boxSizing:'border-box'}}>
      <h2 style={{font:'28px Georgia,serif',margin:'0 0 14px'}}>La valeur ne se limite pas aux heures gagnées</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:18,fontSize:13,lineHeight:1.6,color:'#365c65'}}>
        <div><CheckCircle2 size={19} color="#64aa86"/><h3 style={{margin:'8px 0 5px',fontSize:15,color:'#153b46'}}>Structurer</h3>Clarifier les priorités et faciliter les décisions.</div>
        <div><CheckCircle2 size={19} color="#64aa86"/><h3 style={{margin:'8px 0 5px',fontSize:15,color:'#153b46'}}>Agir</h3>Suivre les actions en équipe sans multiplier les tableaux.</div>
        <div><CheckCircle2 size={19} color="#64aa86"/><h3 style={{margin:'8px 0 5px',fontSize:15,color:'#153b46'}}>Prouver</h3>Retrouver les preuves et préparer les réponses aux clients.</div>
      </div>
      <p style={{fontSize:11,color:'#71868a',lineHeight:1.6,marginTop:20}}>Les résultats de la simulation sont purement indicatifs. Ils représentent une estimation de gains potentiels et ne constituent ni une promesse de résultat ni une évaluation financière de tous les effets de la RSE.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:20}}>
        <Link className={styles.primaryCta} href="/tarifs/">Découvrir l'offre à 50 € HT/mois <ArrowRight size={16}/></Link>
        <Link className={styles.secondaryCta} href="/evaluation-rse/">Commencer par mon diagnostic RSE</Link>
      </div>
    </section>
  </main>
}
