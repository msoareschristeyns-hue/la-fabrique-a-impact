import type{SourceCatalogItem}from'./sourceCatalog';
import type{MsdgCatalogTemplate}from'./msdgRseCatalog';

export type FrameworkName='EcoVadis'|'B Corp'|'LUCIE 26000'|'Engagé RSE'|'ISO 26000';
export const frameworkNames:FrameworkName[]=['EcoVadis','B Corp','LUCIE 26000','Engagé RSE','ISO 26000'];

const variants:Record<FrameworkName,string[]>={
 'EcoVadis':['ecovadis'],
 'B Corp':['b corp','bcorp'],
 'LUCIE 26000':['lucie'],
 'Engagé RSE':['engagé rse','engage rse'],
 'ISO 26000':['iso 26000']
};
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function frameworkMatchesText(value:string,framework:FrameworkName){const hay=normalize(value);return variants[framework].some(v=>hay.includes(normalize(v)))}
export function frameworkDocuments(items:SourceCatalogItem[],templates:MsdgCatalogTemplate[],framework:FrameworkName){
 const direct=items.filter(item=>item.category.startsWith('14 ')&&frameworkMatchesText(item.title,framework));
 const supportingIds=new Set(templates.filter(t=>t.frameworks.some(f=>frameworkMatchesText(f,framework))).map(t=>t.id));
 const supporting=items.filter(item=>supportingIds.has(item.id));
 const evidence=items.filter(item=>item.category.startsWith('13 ')&&frameworkMatchesText(item.title,framework));
 const seen=new Set<string>();
 return[...direct,...supporting,...evidence].filter(item=>seen.has(item.id)?false:(seen.add(item.id),true));
}
