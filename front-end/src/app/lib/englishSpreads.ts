import type {TarotSpread} from "../data/tarotSpreads.ts";
/** Bilingual display descriptions. Persist canonical spread IDs, not localized names. */
const data:Record<string,{name:string;description:string;positions:[string,string][]}>={
 "one-card":{
  name:"One-card reflection",description:"One key theme to notice in your current situation",
  positions:[["Today's focus","One issue worth reflecting on"]]
 },
 "three-card":{
  name:"Past • Present • Possible direction",
  description:"Compare three perspectives across time without claiming a fixed future",
  positions:[["Past","An earlier influence on your present situation"],["Present","What deserves your attention now"],["Possible direction","What you might notice if current patterns continue"]]
 },
 "love":{
  name:"Five-card relationship reading",description:"Reflect on relationships and healthy communication",
  positions:[["Your perspective","Your feelings and expectations"],["Another perspective","What you can observe, not a claim about another person's thoughts"],["Strength of the bond","A supportive part of the connection"],["Challenge","An issue worth discussing"],["Next step","A constructive, respectful action"]]
 },
 "career":{
  name:"Six-card career reflection",description:"Look at work decisions from several angles",
  positions:[["Current work","Your current role"],["Strengths","Skills you could use"],["Obstacle","A constraint worth checking"],["Opportunity","An area you could develop"],["Practical step","A small next action"],["Long-term path","A sustainable direction to reflect on"]]
 },
 "celtic-cross":{
  name:"Celtic Cross",description:"Traditional ten-card reading with a crossed center and four-card staff",
  positions:[["Present situation","The center of the question"],["Crossing influence","A challenge or opening"],["Conscious goal","What you are already aware of"],["Underlying foundation","Assumptions or deeper context"],["Past influence","A previous pattern"],["Near direction","What may emerge next"],["Your role","How you currently participate"],["Environment","People and surrounding conditions"],["Hopes and fears","Desires and reservations"],["Overall direction","A synthesis of the other cards"]]
 }
};
export const englishSpreadName=(spread:TarotSpread)=>data[spread.id]?.name||spread.name;
export const englishSpreadDescription=(spread:TarotSpread)=>data[spread.id]?.description||spread.description;
export const englishSpreadPosition=(spread:TarotSpread,position:number)=>{
  const entry=data[spread.id]?.positions[position-1];
  const original=spread.positions.find(p=>p.position===position);
  return {name:entry?.[0]||original?.name||String(position),description:entry?.[1]||original?.description||""};
};
