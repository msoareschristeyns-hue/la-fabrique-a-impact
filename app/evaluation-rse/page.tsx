'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,ClipboardCheck,Clock3,Gift,Lightbulb,LockKeyhole,RotateCcw,TrendingUp,Zap} from 'lucide-react';
import styles from './evaluation.module.css';

type Question={q:string;answers:string[]};
const questions:Question[]=[
{q:"La RSE fait-elle aujourd'hui l'objet d'une réflexion ou d'actions au sein de votre entreprise ?",answers:["Non, pas encore","Une réflexion est en cours","Quelques actions existent","Une démarche RSE est engagée"]},
{q:"Les décisions prises intègrent-elles, même partiellement, des critères sociaux ou environnementaux ?",answers:["Jamais","Occasionnellement","Souvent, mais de manière informelle","Oui, de manière structurée"]},
{q:"Les valeurs de l'entreprise sont-elles clairement définies et partagées avec les équipes ?",answers:["Non","Elles sont implicites","Elles sont formalisées et partagées","Elles guident réellement les décisions"]},
{q:"L'entreprise agit-elle pour limiter son impact environnemental (énergie, déchets, ressources) ?",answers:["Aucune action à ce jour","Quelques actions ponctuelles","Des actions régulières sont menées","Une démarche globale est engagée"]},
{q:"Les consommations clés (énergie, eau, matières premières) sont-elles suivies, même de façon simple ?",answers:["Non","De façon très ponctuelle","Oui, sur certains postes","Oui, avec un suivi régulier"]},
{q:"La santé et la sécurité au travail font-elles l'objet d'actions ou de sensibilisations ?",answers:["Non","Oui, principalement réglementaires","Oui, avec des actions de prévention","Oui, avec un suivi et des améliorations continues"]},
{q:"Des actions sont-elles menées pour améliorer les conditions de travail et le bien-être des équipes ?",answers:["Non","Quelques actions isolées","Des actions régulières","Une démarche QVCT structurée"]},
{q:"Les collaborateurs sont-ils accompagnés dans le développement de leurs compétences ?",answers:["Peu ou pas","De manière occasionnelle","De façon régulière","Dans une logique d'anticipation et d'évolution"]},
{q:"Les relations avec les fournisseurs reposent-elles sur des pratiques responsables (délais, transparence, confiance) ?",answers:["Non spécifiquement","Oui, de manière informelle","Oui, avec des règles partagées","Oui, avec des critères clairs et suivis"]},
{q:"L'entreprise agit-elle en faveur de la diversité et de l'inclusion (genre, âge, handicap...) ?",answers:["Non","Une sensibilisation existe","Des actions concrètes sont mises en place","Une politique diversité est engagée"]},
{q:"L'entreprise entretient-elle un lien avec son territoire (emploi local, partenariats, engagements) ?",answers:["Non","De manière ponctuelle","Oui, via des partenariats ou actions locales","Oui, de façon active et durable"]},
{q:"Souhaitez-vous aller plus loin dans une démarche RSE plus structurée et progressive ?",answers:["Pas pour le moment","Oui, mais sans contrainte","Oui, avec des outils et un cadre clair","Oui, avec un accompagnement structuré"]},
];

function level(score:number){
 if(score<26)return{title:"À initier",text:"Votre démarche RSE est encore peu structurée. L'enjeu est de poser des bases simples et de choisir quelques priorités concrètes."};
 if(score<51)return{title:"En construction",text:"Des pratiques existent déjà. Le prochain cap consiste à les structurer, les prioriser et mieux les relier à la performance de l'entreprise."};
 if(score<76)return{title:"Engagée",text:"Votre démarche est réelle et plusieurs sujets sont déjà traités. Vous pouvez maintenant renforcer le pilotage, les preuves et la cohérence d'ensemble."};
 return{title:"Structurée",text:"Votre entreprise dispose de bases solides. Le prochain enjeu est de mesurer les effets, consolider les preuves et inscrire la RSE dans les décisions stratégiques."};
}

export default function EvaluationRSE(){
 const[started,setStarted]=useState(false);
 const[index,setIndex]=useState(0);
 const[answers,setAnswers]=useState<number[]>(Array(12).fill(-1));
 const[contactStep,setContactStep]=useState(false);
 const[resultStep,setResultStep]=useState(false);
 const[contact,setContact]=useState({email:'',firstname:'',lastname:'',company:''});
 const pct=Math.round(((index+1)/questions.length)*100);
 const raw=answers.reduce((s,v)=>s+Math.max(v,0),0);
 const score=Math.round(raw/(questions.length*3)*100);
 const maturity=useMemo(()=>level(score),[score]);
 const answered=answers[index]>=0;
 function reset(){setStarted(false);setIndex(0);setAnswers(Array(12).fill(-1));setContactStep(false);setResultStep(false);setContact({email:'',firstname:'',lastname:'',company:''})}
 function next(){if(!answered)return;if(index<questions.length-1)setIndex(index+1);else setContactStep(true)}
 function showResult(e:React.FormEvent){e.preventDefault();localStorage.setItem('fabrique-impact-public-evaluation',JSON.stringify({answers,score,contact,created_at:new Date().toISOString()}));setResultStep(true)}

 if(!started)return <main className={styles.page}><section className={styles.intro}><Link href="/" className={styles.logo}><img src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link><span className={styles.kicker}>AUTO-DIAGNOSTIC RSE · GRATUIT</span><h1>Évaluez la maturité RSE de votre entreprise</h1><p>Un auto-diagnostic rapide et personnalisé pour identifier vos forces et vos axes d'amélioration en matière de responsabilité sociétale.</p><button className={styles.primary} onClick={()=>setStarted(true)}>Commencer l'auto-diagnostic <ArrowRight/></button><div className={styles.badges}><span><Gift/> Gratuit</span><span><Clock3/> 5 minutes</span><span><LockKeyhole/> Confidentiel</span></div></section><section className={styles.how}><h2>Comment ça marche ?</h2><div className={styles.howGrid}><article><i>1</i><ClipboardCheck/><b>Répondez</b><p>12 questions simples sur vos pratiques actuelles</p></article><article><i>2</i><TrendingUp/><b>Découvrez</b><p>Votre dynamique RSE et vos leviers prioritaires</p></article><article><i>3</i><Lightbulb/><b>Progressez</b><p>Des recommandations personnalisées pour avancer</p></article></div></section><section className={styles.trust}><div><Gift/><b>Gratuit</b><span>Sans engagement</span></div><div><LockKeyhole/><b>Confidentiel</b><span>Données protégées</span></div><div><Clock3/><b>5–10 min</b><span>12 questions</span></div><div><Zap/><b>Immédiat</b><span>Résultats instantanés</span></div></section></main>;

 if(contactStep&&!resultStep)return <main className={styles.quizPage}><div className={styles.contactCard}><Link href="/" className={styles.smallLogo}><img src="/logo-la-fabrique-impact.svg" alt="La Fabrique à Impact"/></Link><h2>Vos coordonnées</h2><p>Pour personnaliser l'affichage de vos résultats et vous permettre de les conserver.</p><form onSubmit={showResult}><label>Email<input type="email" required value={contact.email} placeholder="votre@email.com" onChange={e=>setContact({...contact,email:e.target.value})}/></label><div className={styles.contactGrid}><label>Prénom<input required value={contact.firstname} onChange={e=>setContact({...contact,firstname:e.target.value})}/></label><label>Nom<input required value={contact.lastname} onChange={e=>setContact({...contact,lastname:e.target.value})}/></label></div><label>Entreprise<input required value={contact.company} onChange={e=>setContact({...contact,company:e.target.value})}/></label><button className={styles.resultButton}>Voir mes résultats</button></form><button className={styles.backText} onClick={()=>setContactStep(false)}><ArrowLeft/> Revenir à la dernière question</button></div></main>;

 if(resultStep)return <main className={styles.quizPage}><div className={styles.resultCard}><span className={styles.kicker}>VOTRE MATURITÉ RSE</span><div className={styles.score}><b>{score}</b><small>/100</small></div><h1>{maturity.title}</h1><p>{maturity.text}</p><div className={styles.resultActions}><Link className={styles.primaryLink} href="/inscription/">Créer mon espace gratuit <ArrowRight/></Link><Link className={styles.secondaryLink} href="/tarifs/">Découvrir l'offre Premium</Link></div><small>Votre résultat reste accessible sur cet appareil. Aucun compte n'est nécessaire pour réaliser l'évaluation.</small><button className={styles.restart} onClick={reset}><RotateCcw/> Recommencer l'évaluation</button></div></main>;

 const q=questions[index];
 return <main className={styles.quizPage}><div className={styles.quizWrap}><div className={styles.quizTop}><span>Question {index+1} sur {questions.length}</span><span>{pct}%</span></div><div className={styles.progress}><i style={{width:pct+'%'}}/></div><section className={styles.questionCard}><small>Question {index+1}</small><h2>{q.q}</h2><div className={styles.answerList}>{q.answers.map((a,i)=><button key={a} onClick={()=>setAnswers(v=>v.map((x,n)=>n===index?i:x))} className={answers[index]===i?styles.selected:''}><span className={styles.radio}/>{a}</button>)}</div></section><div className={styles.navButtons}><button disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft/> Précédent</button><button className={styles.next} disabled={!answered} onClick={next}>{index===questions.length-1?'Voir mes résultats':'Suivant'} <ArrowRight/></button></div><button className={styles.restart} onClick={reset}><RotateCcw/> Recommencer depuis le début</button></div></main>
}