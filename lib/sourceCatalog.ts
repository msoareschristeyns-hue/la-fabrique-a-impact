import part1 from './catalog-source/part1';
import part2 from './catalog-source/part2';
import part3 from './catalog-source/part3';
import part4 from './catalog-source/part4';
import part5 from './catalog-source/part5';

export type SourceCatalogItem={
  id:string;
  title:string;
  category:string;
  type:string;
  priority:string;
  model:string;
  refCount:number;
  legalReview:string;
};

type RawRow=readonly [string,string,string,string,string,string,number,string];
const raw=[...part1,...part2,...part3,...part4,...part5] as ReadonlyArray<RawRow>;

export const sourceCatalog:SourceCatalogItem[]=raw.map(r=>({
  id:r[0],title:r[1],category:r[2],type:r[3],priority:r[4],model:r[5],refCount:r[6],legalReview:r[7]
}));
export const sourceCatalogCount=sourceCatalog.length;
export const sourceCatalogCategories=Array.from(new Set(sourceCatalog.map(x=>x.category)));
export const sourceCatalogTypes=Array.from(new Set(sourceCatalog.map(x=>x.type))).sort((a,b)=>a.localeCompare(b,'fr'));
export const sourceCatalogPriorities=['P1','P2','P3'];
export const sourceCatalogModels=Array.from(new Set(sourceCatalog.map(x=>x.model)));
export function sourceCatalogById(id:string){return sourceCatalog.find(x=>x.id===id)}
