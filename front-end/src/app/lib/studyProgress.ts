/**
 * Offline spaced-repetition practice for 78 Tarot cards.
 * Dates are stored in UTC milliseconds (relative intervals, not prophecy).
 * No analytics or personal responses are sent to a server.
 */
export const STUDY_KEY="pocket-tarot-study-v1";
export interface CardProgress {
  id:number;
  seen:number;
  correct:number;
  streak:number;
  intervalDays:number;
  dueAt:number;
  lastReviewedAt:number;
}
const DAY=24*60*60*1000;
export const STUDY_LIMIT=78;
export function validateStudyProgress(raw:unknown):CardProgress[]{
  if(!Array.isArray(raw)||raw.length>STUDY_LIMIT)
    throw new Error("Сургалтын хадгалсан мэдээллийн бүтэц буруу байна.");
  const ids=new Set<number>();
  const out:CardProgress[]=[];
  for(const item of raw){
    if(!item||typeof item!=="object"||Array.isArray(item))
      throw new Error("Сургалтын картын мэдээлэл буруу байна.");
    const p=item as Record<string,unknown>;
    const numbers=["id","seen","correct","streak","intervalDays","dueAt","lastReviewedAt"] as const;
    if(numbers.some(key=>!Number.isSafeInteger(p[key])||(p[key] as number)<0)
      ||(p.id as number)>=STUDY_LIMIT||(p.correct as number)>(p.seen as number)
      ||(p.streak as number)>(p.correct as number)
      ||(p.intervalDays as number)>365
      ||(p.seen as number)>100000||(p.dueAt as number)>8.64e15
      ||(p.lastReviewedAt as number)>8.64e15
      ||ids.has(p.id as number)){
      throw new Error("Сургалтын зарим мөр буруу эсвэл давхардсан байна.");
    }
    ids.add(p.id as number);
    out.push(Object.fromEntries(numbers.map(key=>[key,p[key]])) as unknown as CardProgress);
  }
  return out;
}
export function loadStudyProgress():CardProgress[]{
  const text=localStorage.getItem(STUDY_KEY);
  if(!text)return [];
  try{return validateStudyProgress(JSON.parse(text));}
  catch{throw new Error("Сургалтын өгөгдөл эвдэрсэн байна. Backup-аа шалгана уу.");}
}
export function saveStudyProgress(rows:CardProgress[]):void{
  const valid=validateStudyProgress(rows);
  localStorage.setItem(STUDY_KEY,JSON.stringify(valid));
}
export function reviewCard(
  rows:readonly CardProgress[],id:number,isCorrect:boolean,now=Date.now()
):CardProgress[]{
  if(!Number.isInteger(id)||id<0||id>=STUDY_LIMIT||!Number.isSafeInteger(now)||now<0)
    throw new Error("Сургалтын карт эсвэл огноо буруу.");
  const current=rows.find(p=>p.id===id);
  const streak=isCorrect?(current?.streak||0)+1:0;
  const intervalDays=isCorrect?(streak===1?1:streak===2?3:
    Math.min(365,Math.round((current?.intervalDays||3)*2.1))):0;
  const next:CardProgress={
    id,seen:(current?.seen||0)+1,
    correct:(current?.correct||0)+(isCorrect?1:0),
    streak,intervalDays,lastReviewedAt:now,
    dueAt:now+intervalDays*DAY
  };
  return [...rows.filter(p=>p.id!==id),next].sort((a,b)=>a.id-b.id);
}
export function learningStats(rows:readonly CardProgress[],now=Date.now()){
  return {
    studied:rows.length,
    due:rows.filter(p=>p.dueAt<=now).length,
    mastered:rows.filter(p=>p.streak>=4).length,
    attempts:rows.reduce((sum,p)=>sum+p.seen,0),
    correct:rows.reduce((sum,p)=>sum+p.correct,0),
  };
}
/**
 * Prefer due and never-seen cards. Avoid repeating the immediately prior card
 * when another candidate is available. The caller supplies a secure uniform int.
 */
export function pickStudyCard(
  poolIds:readonly number[],progress:readonly CardProgress[],
  lastId:number|null,randomInt:(max:number)=>number,now=Date.now(),dueOnly=false
):number|null {
  const byId=new Map(progress.map(row=>[row.id,row]));
  const available=poolIds.filter(id=>Number.isInteger(id)&&id>=0&&id<STUDY_LIMIT);
  if(available.length===0)return null;
  const due=available.filter(id=>{const row=byId.get(id);return row!==undefined&&row.dueAt<=now;});
  const unseen=dueOnly?[]:available.filter(id=>!byId.has(id));
  const fallback=dueOnly?[]:available;
  let options=due.length?due:unseen.length?unseen:fallback;
  if(options.length>1 && lastId!==null)options=options.filter(id=>id!==lastId);
  if(options.length===0)return null;
  const index=randomInt(options.length);
  if(!Number.isInteger(index)||index<0||index>=options.length)throw new Error("Random selection outside range.");
  return options[index];
}
