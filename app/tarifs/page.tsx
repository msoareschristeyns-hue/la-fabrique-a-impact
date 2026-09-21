'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Check, X, ShieldCheck, Gift, Clock3, ArrowRight} from 'lucide-react';
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

export default function Tarifs(){
  const[annual,setAnnual]=useState(false);
  const monthly=annual?80:100;
  return <main className={styles.page}>
    <header className={styles.topbar}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><img src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link>
        <div className={styles.navLinks}>
          <Link href="/#apropos">À propos</Link>
          <Link href="/#methode">La méthode</Link>
          <Link href="/#solution">La plateforme</Link>
          <Link className={styles.active} href="/tarifs/">Tarifs</Link>
          <Link href="/connexion/">Connexion</Link>
          <Link className={styles.ctaMini} href="/diagnostic/">Évaluer ma maturité RSE</Link>
        </div>
      </nav>
    </header>

    <section className={styles.hero}>
      <span>LA RSE QUI RENFORCE LA PERFORMANCE DE VOTRE ENTREPRISE</span>
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
        <Link className={styles.inlineLink} href="/diagnostic/">Essayer le diagnostic sans inscription</Link>
      </article>

      <article className={styles.card+' '+styles.premium}>
        <div className={styles.recommended}>RECOMMANDÉ</div>
        <div className={styles.cardHead}>
          <span className={styles.planEyebrow}>STRUCTURER & PILOTER</span>
          <h2>Premium</h2>
          <p>Passez du diagnostic à l’action avec votre équipe.</p>
          <div className={styles.price}><b>{monthly} €</b><span>/ mois</span></div>
          <small>{annual?'960 € facturés annuellement':'Sans engagement annuel'}</small>
        </div>
        <ul>{premium.map(([label])=><li key={String(label)}><Check/><span>{label}</span></li>)}</ul>
        <Link className={styles.primaryCta} href="/inscription/">Choisir Premium <ArrowRight/></Link>
        <span className={styles.planNote}>Résiliable à tout moment</span>
      </article>
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