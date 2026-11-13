import {tarotCards} from "../data/tarotCards.ts";
import type {CardProgress} from "./studyProgress.ts";
export interface TarotLesson{
  id:string;
  title:string;
  description:string;
  cardIds:number[];
}
const major=tarotCards.filter(c=>c.arcana==="major").map(c=>c.id);
function suit(name:string){return tarotCards.filter(card=>card.suit===name).map(card=>card.id);}
export const TAROT_LESSONS:TarotLesson[]=[
  {id:"major-intro",title:"1. Их Аркан — эхлэл",description:"0–10 дугаартай картын дүрс болон гол бэлгэдэл",cardIds:major.slice(0,11)},
  {id:"major-journey",title:"2. Их Аркан — аялал",description:"11–21 дугаартай картуудын өөрчлөлт, эргэцүүлэл",cardIds:major.slice(11)},
  {id:"wands",title:"3. Саваа",description:"Санаачилга, бүтээлч байдал, үйлдэл",cardIds:suit("Wands")},
  {id:"cups",title:"4. Хундага",description:"Мэдрэмж, харилцаа, холбоо",cardIds:suit("Cups")},
  {id:"swords",title:"5. Сэлэм",description:"Бодол, сонголт, шударга байдал",cardIds:suit("Swords")},
  {id:"pentacles",title:"6. Зоос",description:"Ур чадвар, нөөц, өдөр тутмын бодит төлөвлөгөө",cardIds:suit("Pentacles")},
  {id:"mastery",title:"7. Бүх 78 картын давтлага",description:"Бүх бэлгэдлийг таних, зөв/урвуу утгыг харьцуулах",cardIds:tarotCards.map(c=>c.id)}
];
export function lessonMetrics(lesson:TarotLesson,progress:readonly CardProgress[]){
  const seen=new Map(progress.map(c=>[c.id,c]));
  const started=lesson.cardIds.filter(id=>seen.has(id)).length;
  const confident=lesson.cardIds.filter(id=>(seen.get(id)?.streak||0)>=2).length;
  const mastered=lesson.cardIds.filter(id=>(seen.get(id)?.streak||0)>=4).length;
  return {total:lesson.cardIds.length,started,confident,mastered,
    completion:lesson.cardIds.length?Math.round(confident/lesson.cardIds.length*100):0};
}
