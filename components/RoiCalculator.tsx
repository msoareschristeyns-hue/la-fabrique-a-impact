'use client';
import {useMemo,useState} from 'react';
import {Calculator,TrendingUp,FileText,RotateCcw} from 'lucide-react';
import styles from './RoiCalculator.module.css';

type Activity={
  id:string;
  title:string;
  detail:string;
  count:number;
  before:number;
  after:number;
};

const examples:Activity[]=[
  {id:'documents',title:'Création de documents RSE',detail:'Chartes, procédures, politiques, supports rédigés avec les modèles.',count:2,before:90,after:45},
  {id:'questionnaires',title:'Réponses aux questionnaires clients',detail:'Demandes RSE / ESG, formulaires donneurs d’ordres, préparation des réponses.',count:2,before:60,after:35},
  {id:'preuves',title:'Recherche et classement des preuves',detail:'Retrouver une attestation, joindre un justificatif, classer les documents.',count:6,before:15,after:7},
  {id:'actions',title:'Suivi des actions et relances',detail:'Mise à jour des plans d’action, coordination, rappels et suivi des responsables.',count:4,before:25,after:15},
  {id:'reporting',title:'Préparation des synthèses RSE',detail:'Bilan de progression, préparation de réunions, synthèse des indicateurs.',count:1,before:90,after:50},
  {id:'sensibilisation',title:'Préparation des sensibilisations',detail:'Supports et contenus pour sensibiliser les collaborateurs.',count:0,before:60,after:30}
];

const euro=(v:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
const numberFR=(v:number,digits=1)=>new Intl.NumberFormat('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:digits}).format(v);
const clamp=(v:number,max:number)=>Number.isFinite(v)?Math.min(Math.max(0,v),max):0;

export default function RoiCalculator({annual=false}:{annual?:boolean}){
  const[activities,setActivities]=useState<Activity[]>(()=>examples.map(x=>({...x})));
  const[hourlyRate,setHourlyRate]=useState(30);
  const[avoidedCosts,setAvoidedCosts]=useState(0);
  const[setupHours,setSetupHours]=useState(3);
  const[setupExpenses,setSetupExpenses]=useState(0);
  const subscriptionMonthly=annual?40:50;

  const report=useMemo(()=>{
    const breakdown=activities.map(a=>({id:a.id,monthlyHours:(a.count*(a.before-a.after))/60}));
    const monthlyHours=breakdown.reduce((total,a)=>total+a.monthlyHours,0);
    const monthlyTimeValue=monthlyHours*hourlyRate;
    const monthlyBenefit=monthlyTimeValue+avoidedCosts;
    const monthlyNet=monthlyBenefit-subscriptionMonthly;
    const annualBenefits=monthlyBenefit*12;
    const annualCosts=subscriptionMonthly*12+setupHours*hourlyRate+setupExpenses;
    const annualNet=annualBenefits-annualCosts;
    const annualROI=annualCosts>0?(annualNet/annualCosts)*100:0;
    return {breakdown,monthlyHours,monthlyTimeValue,monthlyBenefit,monthlyNet,annualBenefits,annualCosts,annualNet,annualROI};
  },[activities,hourlyRate,avoidedCosts,setupHours,setupExpenses,subscriptionMonthly]);

  const change=(id:string,field:'count'|'before'|'after',value:number)=>{
    setActivities(items=>items.map(item=>item.id===id?{...item,[field]:clamp(value,field==='count'?1000:1440)}:item));
  };
  const clear=()=>{
    setActivities(examples.map(x=>({...x,count:0})));
    setHourlyRate(30);
    setAvoidedCosts(0);
    setSetupHours(0);
    setSetupExpenses(0);
  };
  const restore=()=>{
    setActivities(examples.map(x=>({...x})));
    setHourlyRate(30);
    setAvoidedCosts(0);
    setSetupHours(3);
    setSetupExpenses(0);
  };

  return <section id="simulateur-roi" aria-label="Simulateur de retour sur investissement" className={styles.section}>
    <div className={styles.intro}>
      <div>
        <span className={styles.eyebrow}><Calculator size={16}/> SIMULATEUR ROI</span>
        <h2>Calculez les gains activité par activité</h2>
        <p>Combien de documents créez-vous, de demandes clients traitez-vous et de preuves recherchez-vous ? Comparez votre temps actuel au temps estimé avec La Fabrique à Impact pour une simulation adaptée à votre entreprise.</p>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.secondaryButton} onClick={restore}><RotateCcw size={14}/> Exemple</button>
        <button type="button" className={styles.secondaryButton} onClick={clear}>Partir de zéro</button>
      </div>
    </div>
    <div className={styles.mainGrid}>
      <div className={styles.workPanel}>
        <h3 className={styles.panelHeading}><FileText size={19} style={{verticalAlign:'middle',marginRight:8}}/>Vos activités RSE</h3>
        <p className={styles.hint}>Pour chaque activité, indiquez son nombre de réalisations <strong>par mois</strong>, puis les minutes nécessaires <strong>aujourd’hui</strong> et <strong>avec la plateforme</strong>. Les chiffres proposés sont des exemples modifiables, pas des gains constatés.</p>
        {activities.map(item=>{
          const monthlyHours=report.breakdown.find(x=>x.id===item.id)?.monthlyHours??0;
          const negative=monthlyHours<0;
          return <div className={styles.activity} key={item.id}>
            <div className={styles.activityHeading}>
              <div>
                <h4 className={styles.activityTitle}>{item.title}</h4>
                <p className={styles.activityDescription}>{item.detail}</p>
              </div>
              <span className={styles.activitySave+(negative?' '+styles.activityLoss:'')}>
                {monthlyHours>0?'+':''}{numberFR(monthlyHours)} h/mois
              </span>
            </div>
            <div className={styles.fields}>
              <label className={styles.field} htmlFor={'roi-'+item.id+'-count'}>
                <span>Nombre / mois</span>
                <input id={'roi-'+item.id+'-count'} type="number" min={0} max={1000} step={1} value={item.count} onChange={e=>change(item.id,'count',Number(e.target.value))}/>
              </label>
              <label className={styles.field} htmlFor={'roi-'+item.id+'-before'}>
                <span>Avant (min / activité)</span>
                <input id={'roi-'+item.id+'-before'} type="number" min={0} max={1440} step={5} value={item.before} onChange={e=>change(item.id,'before',Number(e.target.value))}/>
              </label>
              <label className={styles.field} htmlFor={'roi-'+item.id+'-after'}>
                <span>Avec la plateforme (min)</span>
                <input id={'roi-'+item.id+'-after'} type="number" min={0} max={1440} step={5} value={item.after} onChange={e=>change(item.id,'after',Number(e.target.value))}/>
              </label>
            </div>
          </div>;
        })}
        <div className={styles.settings}>
          <h3 className={styles.panelHeading}>Vos hypothèses financières</h3>
          <p className={styles.hint}>Ces paramètres sont utilisés pour valoriser le temps libéré et tenir compte du coût de mise en place la première année.</p>
          <div className={styles.settingsGrid}>
            <label className={styles.field} htmlFor="roi-hourly"><span>Coût horaire chargé (€ / h)</span><input id="roi-hourly" type="number" min={0} max={500} value={hourlyRate} onChange={e=>setHourlyRate(clamp(Number(e.target.value),500))}/></label>
            <label className={styles.field} htmlFor="roi-other"><span>Dépenses réellement évitées (€ / mois)</span><input id="roi-other" type="number" min={0} max={100000} value={avoidedCosts} onChange={e=>setAvoidedCosts(clamp(Number(e.target.value),100000))}/></label>
            <label className={styles.field} htmlFor="roi-setup-hours"><span>Temps initial de mise en route (h)</span><input id="roi-setup-hours" type="number" min={0} max={1000} step={0.5} value={setupHours} onChange={e=>setSetupHours(clamp(Number(e.target.value),1000))}/></label>
            <label className={styles.field} htmlFor="roi-setup-cost"><span>Autres frais initiaux (€ HT)</span><input id="roi-setup-cost" type="number" min={0} max={100000} value={setupExpenses} onChange={e=>setSetupExpenses(clamp(Number(e.target.value),100000))}/></label>
          </div>
          <p className={styles.notes}>Ne renseignez dans « dépenses évitées » que les charges effectivement supprimées, en dehors du temps valorisé ci-dessus. Aucun gain commercial, environnemental ou réglementaire n’est chiffré automatiquement.</p>
        </div>
      </div>
      <aside className={styles.results} aria-label="Résultats de la simulation" aria-live="polite">
        <div className={styles.resultEyebrow}><TrendingUp size={17}/> ESTIMATION ACTUALISÉE</div>
        <h3>Vos résultats</h3>
        <p className={styles.summaryPrice}>Abonnement {annual?'annuel':'mensuel'} : <strong>{euro(subscriptionMonthly)} HT / mois</strong></p>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Temps libéré estimé chaque mois</div>
          <div className={styles.kpiValue}>{numberFR(report.monthlyHours)} h</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Valeur mensuelle du temps libéré</div>
          <div className={styles.kpiValue}>{euro(report.monthlyTimeValue)}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Bénéfice mensuel estimé, temps et charges évitées</div>
          <div className={styles.kpiValue}>{euro(report.monthlyBenefit)}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Solde mensuel après abonnement, hors mise en route</div>
          <div className={styles.kpiValue+' '+(report.monthlyNet>=0?styles.highlight:styles.negative)}>{report.monthlyNet>0?'+':''}{euro(report.monthlyNet)}</div>
        </div>
        <div className={styles.annual}>
          <div className={styles.annualLabel}>Bilan net sur 12 mois, mise en route incluse</div>
          <div className={styles.annualValue+' '+(report.annualNet>=0?styles.highlight:styles.negative)}>{report.annualNet>0?'+':''}{euro(report.annualNet)}</div>
          <div className={styles.metrics}>
            <div><span>Bénéfices estimés sur 12 mois</span><b>{euro(report.annualBenefits)}</b></div>
            <div><span>Abonnement sur 12 mois</span><b>{euro(subscriptionMonthly*12)}</b></div>
            <div><span>Coût de mise en route valorisé</span><b>{euro(setupHours*hourlyRate+setupExpenses)}</b></div>
            <div><span>Total des coûts pris en compte</span><b>{euro(report.annualCosts)}</b></div>
            <div><span>ROI estimé de la 1re année</span><b>{numberFR(report.annualROI,0)} %</b></div>
          </div>
        </div>
        <p className={styles.disclaimer}>Méthode : nombre de tâches × différence de minutes ÷ 60 × coût horaire, plus les dépenses réellement évitées. Le ROI annuel correspond au bilan net divisé par les coûts inclus. Les gains de temps valorisés ne sont pas nécessairement des économies de trésorerie. Résultats indicatifs, à vérifier avec vos propres données.</p>
      </aside>
    </div>
  </section>;
}
