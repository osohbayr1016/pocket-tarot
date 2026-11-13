/**
 * IndexedDB journal v2: durable, device-only storage with migration from
 * the original 100-record localStorage journal. No backend or network.
 * The migration is atomic, idempotent and never deletes the legacy copy.
 */
import {
  loadReadings,parseReadings,addReading,deleteReading,clearReadings,
  updateReadingNotes,setReadingFavorite,type SavedReading
} from "./readingHistory.ts";

const DB_NAME="pocket-tarot-journal";
const DB_VERSION=1;
const STORE="readings";
const META="meta";
export const JOURNAL_PAGE_SIZE=20;
export const JOURNAL_SAFE_LIMIT=5000;

function withIndexedDb():boolean{
  return typeof indexedDB!=="undefined";
}
function result<T>(request:IDBRequest<T>):Promise<T>{
  return new Promise((resolve,reject)=>{
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error("IndexedDB request failed"));
  });
}
function done(tx:IDBTransaction):Promise<void>{
  return new Promise((resolve,reject)=>{
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error||new Error("Journal database transaction failed"));
    tx.onabort=()=>reject(tx.error||new Error("Journal database transaction rolled back"));
  });
}
function openDatabase():Promise<IDBDatabase>{
  if(!withIndexedDb())return Promise.reject(new Error("IndexedDB isn't supported"));
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store=db.createObjectStore(STORE,{keyPath:"id"});
        store.createIndex("date","date",{unique:false});
      }
      if(!db.objectStoreNames.contains(META))db.createObjectStore(META);
    };
    request.onerror=()=>reject(request.error||new Error("Cannot open IndexedDB"));
    request.onblocked=()=>reject(new Error("Close other Pocket Tarot tabs to upgrade journal"));
    request.onsuccess=()=>{
      request.result.onversionchange=()=>request.result.close();
      resolve(request.result);
    };
  });
}
/** Use a single transaction for data + migration flag. */
async function migrate(db:IDBDatabase):Promise<void>{
  const read=db.transaction(META,"readonly");
  const flag=await result(read.objectStore(META).get("legacy-migrated"));
  if(flag===true)return;
  // Validation errors fail closed without erasing the original journal.
  const legacy=loadReadings();
  const tx=db.transaction([STORE,META],"readwrite"),complete=done(tx);
  const store=tx.objectStore(STORE);
  // Do not overwrite values that a previous interrupted migration may have saved.
  for(const reading of legacy){
    const existing=await result(store.get(reading.id));
    if(!existing)store.add(reading);
  }
  tx.objectStore(META).put(true,"legacy-migrated");
  await complete;
}
async function inDb<T>(callback:(db:IDBDatabase)=>Promise<T>):Promise<T>{
  const db=await openDatabase();
  try{
    await migrate(db);
    return await callback(db);
  }finally{db.close();}
}
function sanitized(reading:SavedReading):SavedReading{
  const valid=parseReadings([reading]);
  if(valid.length!==1)throw new Error("Уншилтын бүтэц буруу байна.");
  return valid[0];
}
function validateMany(records:readonly SavedReading[]):SavedReading[]{
  if(!Array.isArray(records)||records.length>JOURNAL_SAFE_LIMIT)
    throw new Error("Уншилтын архив 5000 мөрөөс их байна; тусад нь архивлаж болно.");
  const validated=records.map(sanitized);
  if(new Set(validated.map(r=>r.id)).size!==validated.length)
    throw new Error("Импортолсон уншилтын ID давхардсан байна.");
  return validated;
}
export async function listJournal():Promise<SavedReading[]>{
  if(!withIndexedDb())return loadReadings();
  return inDb(async db=>{
    const tx=db.transaction(STORE,"readonly");
    const records=await result(tx.objectStore(STORE).getAll()) as SavedReading[];
    return records.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
  });
}
export async function getJournalPage(page:number,pageSize=JOURNAL_PAGE_SIZE):Promise<{total:number;rows:SavedReading[]}>{
  const list=await listJournal();
  const p=Math.max(1,Math.floor(page||1));
  return {total:list.length,rows:list.slice((p-1)*pageSize,p*pageSize)};
}
export async function saveJournalReading(value:SavedReading):Promise<void>{
  const record=sanitized(value);
  if(!withIndexedDb()){addReading(record);return;}
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    tx.objectStore(STORE).put(record);
    await complete;
  });
}
export async function deleteJournalReading(id:string):Promise<void>{
  if(!withIndexedDb()){deleteReading(id);return;}
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    tx.objectStore(STORE).delete(id);
    await complete;
  });
}
export async function clearJournal():Promise<void>{
  if(!withIndexedDb()){clearReadings();return;}
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    tx.objectStore(STORE).clear();
    await complete;
  });
}
async function updateJournal(id:string,transform:(item:SavedReading)=>SavedReading):Promise<void>{
  if(!withIndexedDb())throw new Error("This operation requires IndexedDB");
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    const store=tx.objectStore(STORE);
    const original=await result(store.get(id)) as SavedReading|undefined;
    if(!original){tx.abort();throw new Error("Уншилт олдсонгүй.");}
    store.put(sanitized(transform(original)));
    await complete;
  });
}
export async function changeJournalNotes(id:string,notes:string):Promise<void>{
  if(typeof notes!=="string"||notes.length>2000)throw new Error("Тэмдэглэл 2000 тэмдэгтээс хэтэрсэн.");
  if(!withIndexedDb()){updateReadingNotes(id,notes);return;}
  await updateJournal(id,reading=>({...reading,notes}));
}
export async function changeJournalFavorite(id:string,favorite:boolean):Promise<void>{
  if(!withIndexedDb()){setReadingFavorite(id,favorite);return;}
  await updateJournal(id,reading=>({...reading,favorite}));
}
/**
 * All-or-nothing import, preserving existing rows unless IDs match.
 * For a destructive restore use replaceJournal() after confirmation.
 */
export async function importJournal(records:readonly SavedReading[]):Promise<void>{
  const validated=validateMany(records);
  if(!withIndexedDb()){
    for(const record of validated)addReading(record);
    return;
  }
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    const store=tx.objectStore(STORE);
    for(const record of validated)store.put(record);
    await complete;
  });
}
export async function replaceJournal(records:readonly SavedReading[]):Promise<void>{
  const validated=validateMany(records);
  if(!withIndexedDb())throw new Error("Full journal restore requires IndexedDB.");
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    const store=tx.objectStore(STORE);
    store.clear();
    for(const record of validated)store.put(record);
    await complete;
  });
}

export async function exportJournalJSON():Promise<string>{
  return JSON.stringify({
    format:"pocket-tarot-readings",version:2,exportedAt:new Date().toISOString(),
    readings:await listJournal(),
  },null,2);
}
export async function importJournalJSON(text:string):Promise<number>{
  if(text.length>20_000_000)throw new Error("Импортын файл 20 MB-ээс бага байх ёстой.");
  let parsed:unknown;
  try{parsed=JSON.parse(text);}catch{throw new Error("JSON файл уншигдсангүй.");}
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("JSON формат буруу.");
  const data=parsed as Record<string,unknown>;
  if(data.format!=="pocket-tarot-readings"||(data.version!==1&&data.version!==2)
    ||!Array.isArray(data.readings))throw new Error("Pocket Tarot уншилтын JSON биш байна.");
  const incoming=validateMany(data.readings);
  const existing=await listJournal();
  if(new Set([...incoming,...existing].map(row=>row.id)).size>JOURNAL_SAFE_LIMIT)
    throw new Error("5000-аас олон уншилт нэг архивд багтахгүй.");
  await importJournal(incoming);
  return incoming.length;
}
