export type JourneyStep={id:number;slug:string;title:string;shortTitle:string;description:string;href:string;cta:string};
export const journeySteps:JourneyStep[]=[
{id:1,slug:'comprendre',title:'Comprendre',shortTitle:'Comprendre',description:'Sensibiliser les équipes, dépasser les idées reçues et partager un langage commun.',href:'/learning/',cta:'Continuer la sensibilisation'},
{id:2,slug:'diagnostiquer',title:'Diagnostiquer',shortTitle:'Diagnostic',description:'Évaluer la maturité RSE de l’entreprise et faire ressortir les sujets qui comptent.',href:'/diagnostic/',cta:'Réaliser le diagnostic'},
{id:3,slug:'cadrer',title:'Cadrer',shortTitle:'Cadrage',description:'Transformer le diagnostic en 3 priorités, ambition à 12 mois et note de cadrage.',href:'/priorities/',cta:'Cadrer mes priorités'},
{id:4,slug:'agir-prouver',title:'Agir & prouver',shortTitle:'Agir',description:'Mettre en œuvre le plan 90 jours, utiliser les modèles et associer les preuves.',href:'/actions/',cta:'Poursuivre mon plan'},
{id:5,slug:'piloter-progresser',title:'Piloter & progresser',shortTitle:'Progresser',description:'Suivre les indicateurs, consolider les preuves et préparer la prochaine revue.',href:'/progress/',cta:'Piloter ma progression'}
];
export type JourneyState={step:number;progress:number;steps:{id:number;progress:number;done:boolean}[];nextHref:string;nextLabel:string};
