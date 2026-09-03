export type DiagnosticSnapshot={date:string;score:number;pillarScores:Record<string,number>;actions:number;proofs:number};

export const storageKeys={diagnostic:'fabrique-impact-diagnostic',actions:'fabrique-impact-actions',proofs:'fabrique-impact-proofs',history:'fabrique-impact-history'} as const;

function readArray(key:string){
  try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return []}
}

export function archiveCurrentCycle(){
  try{
    const raw=localStorage.getItem(storageKeys.diagnostic);
    if(!raw)return;
    const current=JSON.parse(raw);
    if(typeof current?.score!=='number')return;
    const history=readArray(storageKeys.history) as DiagnosticSnapshot[];
    const snapshot:DiagnosticSnapshot={date:current.date||new Date().toISOString(),score:current.score,pillarScores:current.pillarScores||{},actions:readArray(storageKeys.actions).length,proofs:readArray(storageKeys.proofs).length};
    const alreadySaved=history.some(item=>item.date===snapshot.date&&item.score===snapshot.score);
    const next=alreadySaved?history:[...history,snapshot].slice(-12);
    localStorage.setItem(storageKeys.history,JSON.stringify(next));
  }catch{}
}

export function startNewCycle(result:unknown){
  archiveCurrentCycle();
  localStorage.setItem(storageKeys.diagnostic,JSON.stringify(result));
  localStorage.setItem(storageKeys.actions,'[]');
}
