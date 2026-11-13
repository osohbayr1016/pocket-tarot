/**
 * Versioned, device-only reading journal. Every import/storage value is
 * validated: localStorage is an untrusted source, not an implicit schema.
 */
export const HISTORY_KEY = "pocket-tarot-offline-readings-v1";
export interface SavedReading {
  id: string;
  date: string;
  spread: string;
  question: string;
  reading: string;
  notes: string;
  cards: {id:number; reversed:boolean; position:number}[];
}
const MAX_RECORDS=100;
function limitText(value:unknown,max:number):string {
  return typeof value==="string" ? value.slice(0,max) : "";
}
function sanitize(value:unknown):SavedReading|null {
  if(!value || typeof value!=="object" || Array.isArray(value))return null;
  const item=value as Record<string,unknown>;
  if(typeof item.id!=="string"||item.id.length<1||item.id.length>100)return null;
  if(typeof item.date!=="string"||!Number.isFinite(Date.parse(item.date)))return null;
  if(typeof item.reading!=="string"||item.reading.length<1||item.reading.length>20000)return null;
  if(!Array.isArray(item.cards)||item.cards.length>78)return null;
  const cards:SavedReading["cards"]=[];
  for(const raw of item.cards){
    if(!raw||typeof raw!=="object")return null;
    const card=raw as Record<string,unknown>;
    if(!Number.isInteger(card.id)||!Number.isInteger(card.position)||
       Number(card.id)<0||Number(card.id)>77||Number(card.position)<1||
       Number(card.position)>78||typeof card.reversed!=="boolean")return null;
    cards.push({id:Number(card.id),reversed:card.reversed,position:Number(card.position)});
  }
  return {
    id:item.id, date:item.date,
    spread:limitText(item.spread,120),
    question:limitText(item.question,500),
    reading:item.reading,
    notes:limitText(item.notes,2000),
    cards,
  };
}
export function parseReadings(raw:unknown):SavedReading[]{
  if(!Array.isArray(raw))return [];
  return raw.slice(0,MAX_RECORDS).map(sanitize).filter((item):item is SavedReading=>item!==null);
}
export function loadReadings():SavedReading[] {
  try{return parseReadings(JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]"));}
  catch{return [];}
}
export function addReading(reading:SavedReading):SavedReading[]{
  const record=sanitize(reading);
  if(!record)throw new Error("Уншилтын бүтэц буруу байна.");
  const old=loadReadings();
  const records=[record,...old.filter(item=>item.id!==record.id)].slice(0,MAX_RECORDS);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(records));
  return records;
}
export function deleteReading(id:string):SavedReading[]{
  const rest=loadReadings().filter(item=>item.id!==id);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(rest));
  return rest;
}
export function clearReadings():void {
  localStorage.removeItem(HISTORY_KEY);
}
export function exportReadings():string {
  return JSON.stringify({
    format:"pocket-tarot-readings",
    version:1,
    exportedAt:new Date().toISOString(),
    readings:loadReadings(),
  },null,2);
}
export function importReadings(text:string):SavedReading[]{
  if(text.length>2_000_000)throw new Error("Файл 2 MB-ээс бага байх ёстой.");
  let parsed:unknown;
  try{parsed=JSON.parse(text);}
  catch{throw new Error("JSON файл буруу байна.");}
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Буруу формат.");
  const object=parsed as Record<string,unknown>;
  if(object.format!=="pocket-tarot-readings"||object.version!==1||!Array.isArray(object.readings)){
    throw new Error("Pocket Tarot JSON export файл биш байна.");
  }
  if(object.readings.length>MAX_RECORDS)throw new Error("100-аас олон уншилт импортлох боломжгүй.");
  const incoming=parseReadings(object.readings);
  if(incoming.length!==object.readings.length)throw new Error("Импортлох уншилтын нэг буюу хэд хэдэн мөр хүчингүй байна.");
  const combined=[...incoming,...loadReadings()];
  const seen=new Set<string>();
  const unique=combined.filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true;}).slice(0,MAX_RECORDS);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(unique));
  return unique;
}
