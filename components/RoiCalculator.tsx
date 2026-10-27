'use client';
import {useMemo, useState} from 'react';
import {Calculator,TrendingUp} from 'lucide-react';

const euro=(value:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);

/** Simulateur partagé entre la page Tarifs et la page ROI. */
export default function RoiCalculator({annual=false}:{annual?:boolean}){
  const [hours,setHours]=useState(2);
  const [hourlyRate,setHourlyRate]=useState(30);
  const [otherSavings,setOtherSavings]=useState(0);
  const monthly=annual?40:50;
  const annualCost=monthly*12;
  const roi=useMemo(()=>{
    const monthlyTimeValue=hours*4.33*hourlyRate;
    const monthlyBenefits=monthlyTimeValue+otherSavings;
    const net=monthlyBenefits-monthly;
    return {monthlyTimeValue,monthlyBenefits,net,annualNet:net*12,roiPercent:monthly>0?(net/monthly)*100:0};
  },[hours,hourlyRate,otherSavings,monthly]);
  return (
    <section id="simulateur-roi" aria-label="Simulateur de retour sur investissement" style={{scrollMarginTop:110,width:'min(940px,calc(100% - 40px))',margin:'0 auto 64px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:22,alignItems:'start'}}>
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
  );
}
