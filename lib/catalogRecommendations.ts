import type{SourceCatalogItem}from'./sourceCatalog';

export type CatalogRecommendationContext={
 sector:string;
 size:string;
 maturity:string;
 priorities:string[];
 targetFramework:string;
};

export type RecommendedCatalogItem=SourceCatalogItem&{
 recommendationScore:number;
 reasons:string[];
};

const pillarCategories:Record<string,string[]>={
 'Stratégie & gouvernance':['02','03','12','01'],
 'Environnement':['08','09','12'],
 'Social & conditions de travail':['06','07','12'],
 'Achats responsables':['05','04','12'],
 'Ancrage territorial':['10','03'],
 'Clients & marché':['10','12','02']
};

const sectorCategories:Record<string,string[]>={
 'Industrie':['08','09','05','07'],
 'Commerce':['10','05','06','11'],
 'Services':['06','10','11','02'],
 'BTP':['07','08','09','05'],
 'Transport & logistique':['08','07','05','10'],
 'Autre':['02','03','12']
};

const foundationIds=new Set(['01-001','02-001','02-004','02-005','02-006','03-001','03-014','12-001','12-002','12-028']);

function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function prefix(item:SourceCatalogItem){return item.id.slice(0,2)}
function frameworkMatch(item:SourceCatalogItem,target:string){
 if(!target||target==='Démarche RSE générale')return false;
 const hay=normalize(`${item.title} ${item.category}`);
 const variants:Record<string,string[]>={
  'EcoVadis':['ecovadis'],
  'ISO 26000':['iso 26000'],
  'B Corp':['b corp','bcorp'],
  'LUCIE 26000':['lucie'],
  'Engagé RSE':['engage rse','engagé rse']
 };
 return(variants[target]||[normalize(target)]).some(v=>hay.includes(normalize(v)));
}

export function recommendCatalog(items:SourceCatalogItem[],ctx:CatalogRecommendationContext,enrichedFrameworks:Record<string,string[]>={}):RecommendedCatalogItem[]{
 return items.map(item=>{
  let score=0;
  const reasons:string[]=[];
  if(item.priority==='P1'){score+=18;reasons.push('socle prioritaire P1')}
  else if(item.priority==='P2')score+=6;

  const pfx=prefix(item);
  ctx.priorities.slice(0,3).forEach((pillar,index)=>{
   if((pillarCategories[pillar]||[]).includes(pfx)){
    score+=[34,25,18][index]||12;
    if(reasons.length<3)reasons.push(`lié à votre priorité ${index+1} : ${pillar}`);
   }
  });

  if((sectorCategories[ctx.sector]||sectorCategories.Autre).includes(pfx)){
   score+=10;
   if(reasons.length<3)reasons.push(`pertinent pour le secteur ${ctx.sector||'de votre entreprise'}`);
  }

  if((ctx.size==='50–249'||ctx.size==='250+')&&['02','04','06','07','11','12'].includes(pfx))score+=7;
  if((ctx.size==='1–9'||ctx.size==='10–49')&&['02','05','08','10'].includes(pfx))score+=5;

  if(ctx.maturity==='Nous débutons'&&foundationIds.has(item.id)){
   score+=22;
   if(reasons.length<3)reasons.push('adapté à une démarche en démarrage');
  }

  if(ctx.targetFramework&&ctx.targetFramework!=='Démarche RSE générale'){
   const enriched=(enrichedFrameworks[item.id]||[]).some(x=>normalize(x).includes(normalize(ctx.targetFramework))||normalize(ctx.targetFramework).includes(normalize(x)));
   if(frameworkMatch(item,ctx.targetFramework)){
    score+=item.category.startsWith('14 ')?60:38;
    if(reasons.length<3)reasons.push(`directement lié à ${ctx.targetFramework}`);
   }else if(enriched){
    score+=32;
    if(reasons.length<3)reasons.push(`modèle enrichi couvrant ${ctx.targetFramework}`);
   }else if(item.priority==='P1')score+=3;
  }

  if(item.model==='EXPERT V3')score+=3;
  if(item.legalReview==='Oui')score-=2;
  return{...item,recommendationScore:score,reasons};
 }).sort((a,b)=>b.recommendationScore-a.recommendationScore||a.id.localeCompare(b.id,'fr'));
}
