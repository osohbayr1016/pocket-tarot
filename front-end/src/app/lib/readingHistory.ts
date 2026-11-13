/**
 * Versioned, device-only reading journal. Every import/storage value is
 * validated: localStorage is an untrusted source, not an implicit schema.
 */
export const HISTORY_KEY = "pocket-tarot-offline-readings-v1";
export type ReadingMood="neutral"|"calm"|"hopeful"|"uncertain"|"anxious";
const MOODS:readonly ReadingMood[]=["neutral","calm","hopeful","uncertain","anxious"];
export interface SavedReading {
  id: string;
  date: string;
  spread: string;
  question: string;
  reading: string;
  notes: string;
  favorite?: boolean;
  mood?: ReadingMood;
  tags?: string[];
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
  const seenCards=new Set<number>();
  const seenPositions=new Set<number>();
  for(const raw of item.cards){
    if(!raw||typeof raw!=="object")return null;
    const card=raw as Record<string,unknown>;
    if(!Number.isInteger(card.id)||!Number.isInteger(card.position)||
       Number(card.id)<0||Number(card.id)>77||Number(card.position)<1||
       Number(card.position)>78||typeof card.reversed!=="boolean")return null;
    const id=Number(card.id),position=Number(card.position);
    if(seenCards.has(id)||seenPositions.has(position))return null;
    seenCards.add(id);seenPositions.add(position);
    cards.push({id,reversed:card.reversed,position});
  }
  return {
    id:item.id, date:item.date,
    spread:limitText(item.spread,120),
    question:limitText(item.question,500),
    reading:item.reading,
    notes:limitText(item.notes,2000),
    favorite:item.favorite===true,
    mood:MOODS.includes(item.mood as ReadingMood)?item.mood as ReadingMood:"neutral",
    tags:Array.isArray(item.tags)?[...new Set(item.tags.filter((x):x is string=>
      typeof x==="string"&&x.trim().length>0).map(x=>x.trim().slice(0,32)))].slice(0,6):[],
    cards,
  };
}
export function parseReadings(raw:unknown):SavedReading[]{
  if(!Array.isArray(raw))return [];
  return raw.slice(0,MAX_RECORDS).map(sanitize).filter((item):item is SavedReading=>item!==null);
}
export function loadReadings():SavedReading[] {
  const raw=localStorage.getItem(HISTORY_KEY);
  if(!raw)return [];
  let parsed:unknown;
  try{parsed=JSON.parse(raw);}
  catch{throw new Error("Хадгалсан түүх эвдэрсэн байна. Backup-аас сэргээхээс өмнө устгахгүй байхыг зөвлөе.");}
  if(!Array.isArray(parsed))throw new Error("Хадгалсан түүхийн бүтэц буруу байна. Import/export шалгана уу.");
  const valid=parseReadings(parsed);
  if(valid.length!==parsed.length)throw new Error("Түүхийн зарим мөр гэмтсэн байна. Хадгалахдаа өгөгдлийг дарж бичихгүй.");
  return valid;
}
export function addReading(reading:SavedReading):SavedReading[]{
  const record=sanitize(reading);
  if(!record)throw new Error("Уншилтын бүтэц буруу байна.");
  const old=loadReadings();
  const records=[record,...old.filter(item=>item.id!==record.id)];
  if(records.length>MAX_RECORDS)throw new Error("100 уншилтын хязгаарт хүрлээ. Өмнөх уншилтуудыг JSON export хийгээд зай чөлөөлнө үү.");
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
  const unique=combined.filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true;});
  if(unique.length>MAX_RECORDS)throw new Error("Импорт нь одоогийн түүхийн 100 уншилтын хязгаарыг давж байна. Эхлээд JSON backup хийгээд зай чөлөөлнө үү.");
  localStorage.setItem(HISTORY_KEY,JSON.stringify(unique));
  return unique;
}

/** Update private journal notes without overwriting card layout or reading text. */
export function updateReadingNotes(id:string,notes:string):SavedReading[]{
  if(typeof id!=="string"||typeof notes!=="string")throw new Error("Invalid journal data");
  if(notes.length>2000)throw new Error("Тэмдэглэл 2000 тэмдэгтээс хэтэрсэн.");
  const current=loadReadings();
  if(!current.some(item=>item.id===id))throw new Error("Уншилт олдсонгүй.");
  const result=current.map(item=>item.id===id?{...item,notes}:item);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(result));
  return result;
}

/** Toggle favorite without modifying interpretation or losing older records. */
export function setReadingFavorite(id:string,favorite:boolean):SavedReading[]{
  const current=loadReadings();
  if(!current.some(item=>item.id===id))throw new Error("Уншилт олдсонгүй.");
  const result=current.map(item=>item.id===id?{...item,favorite}:item);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(result));
  return result;
}
