/**
 * IndexedDB journal v2: durable, device-only storage with migration from
 * the original 100-record localStorage journal. No backend or network.
 * The migration is atomic, idempotent and never deletes the legacy copy.
 */
import {
  HISTORY_KEY,loadReadings,parseReadings,addReading,deleteReading,clearReadings,
  updateReadingNotes,setReadingFavorite,type SavedReading,type ReadingMood
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
  // Queue every read before yielding. IDB readwrite transactions automatically
  // commit when their request queue empties; awaiting one request inside this
  // loop can produce TransactionInactiveError in Safari/Firefox.
  // Each success handler runs while the transaction is active and can enqueue
  // a conditional add without overwriting a more recent journal record.
  for(const reading of legacy){
    const request=store.get(reading.id);
    request.onsuccess=()=>{
      if(request.result===undefined)store.add(reading);
    };
  }
  // Flag and all conditional inserts are part of the SAME atomic transaction.
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
/**
 * Import is a merge, never a destructive restore: records already saved on
 * this device win on ID collisions. Explicit full-backup restoration is the
 * only operation that replaces saved records.
 */
export function mergeJournalRecords(
  existing:readonly SavedReading[],incoming:readonly SavedReading[],limit=JOURNAL_SAFE_LIMIT
):SavedReading[]{
  if(!Number.isSafeInteger(limit)||limit<1||limit>JOURNAL_SAFE_LIMIT)
    throw new Error("Journal record limit is invalid.");
  const current=validateMany(existing),candidates=validateMany(incoming);
  const ids=new Set(current.map(record=>record.id));
  const combined=[...current];
  for(const record of candidates){
    if(!ids.has(record.id)){combined.push(record);ids.add(record.id);}
  }
  if(combined.length>limit)
    throw new Error("Journal capacity exceeded. Export older readings before importing more.");
  return combined;
}
export async function listJournal():Promise<SavedReading[]>{
  if(!withIndexedDb())return loadReadings().sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
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
    const store=tx.objectStore(STORE);
    let operationError:Error|null=null;
    const request=store.get(record.id);
    request.onsuccess=()=>{
      if(request.result!==undefined){store.put(record);return;}
      const count=store.count();
      count.onsuccess=()=>{
        if(count.result>=JOURNAL_SAFE_LIMIT){
          operationError=new Error("Journal has reached 5000 readings. Export older entries before saving more.");
          tx.abort();
        }else store.add(record);
      };
    };
    try{await complete;}catch(cause){throw operationError??cause;}
  });
}
/** Append notes to an existing daily entry instead of overwriting past reflections. */
export function combineDailyNotes(existing:string,incoming:string):string{
  if(typeof existing!=="string"||typeof incoming!=="string")
    throw new Error("Invalid journal note");
  const addition=incoming.trim();
  const combined=existing.trim()?existing+(addition?"\\n\\n"+addition:""):addition;
  if(combined.length>2000)
    throw new Error("Daily reflections exceed 2000 characters. Export or edit the earlier entry in the journal.");
  return combined;
}
export async function saveDailyJournalReading(value:SavedReading):Promise<void>{
  const record=sanitized(value);
  if(!/^daily-\\d{4}-\\d{2}-\\d{2}$/.test(record.id))
    throw new Error("Invalid daily journal ID.");
  if(!withIndexedDb()){
    const existing=loadReadings().find(item=>item.id===record.id);
    addReading(existing?{...existing,notes:combineDailyNotes(existing.notes,record.notes)}:record);
    return;
  }
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    const store=tx.objectStore(STORE);
    let operationError:Error|null=null;
    const request=store.get(record.id);
    request.onsuccess=()=>{
      if(request.result!==undefined){
        try{
          const old=sanitized(request.result as SavedReading);
          store.put({...old,notes:combineDailyNotes(old.notes,record.notes)});
        }catch(cause){
          operationError=cause instanceof Error?cause:new Error("Could not append daily note.");
          tx.abort();
        }
        return;
      }
      const count=store.count();
      count.onsuccess=()=>{
        if(count.result>=JOURNAL_SAFE_LIMIT){
          operationError=new Error("Journal is full. Export older readings before saving.");
          tx.abort();
        }else store.add(record);
      };
    };
    try{await complete;}catch(cause){throw operationError??cause;}
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
    let operationError:Error|null=null;
    const request=store.get(id);
    request.onsuccess=()=>{
      if(request.result===undefined){
        operationError=new Error("Уншилт олдсонгүй.");
        tx.abort();
        return;
      }
      try{
        store.put(sanitized(transform(request.result as SavedReading)));
      }catch(cause){
        operationError=cause instanceof Error?cause:new Error("Уншилтыг засаж чадсангүй.");
        tx.abort();
      }
    };
    try{await complete;}
    catch(cause){throw operationError??cause;}
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
 * All-or-nothing import, preserving existing rows when IDs match.
 * For a destructive restore use replaceJournal() after confirmation.
 */
export async function importJournal(records:readonly SavedReading[]):Promise<void>{
  const validated=validateMany(records);
  if(!withIndexedDb()){
    // One localStorage write guarantees no partial fallback import if the
    // archive exceeds the 100-item legacy limit or a write fails.
    const combined=mergeJournalRecords(loadReadings(),validated,100);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(combined));
    return;
  }
  await inDb(async db=>{
    const tx=db.transaction(STORE,"readwrite"),complete=done(tx);
    const store=tx.objectStore(STORE);
    let operationError:Error|null=null;
    // Query and additions share the same readwrite transaction to avoid
    // races between tabs and enforce the 5000-entry limit atomically.
    const keys=store.getAllKeys();
    keys.onsuccess=()=>{
      const existing=new Set(keys.result.map(key=>String(key)));
      const toAdd=validated.filter(record=>!existing.has(record.id));
      if(existing.size+toAdd.length>JOURNAL_SAFE_LIMIT){
        operationError=new Error("Journal has reached 5000 readings. Export older entries before importing.");
        tx.abort();
        return;
      }
      for(const record of toAdd)store.add(record);
    };
    try{await complete;}catch(cause){throw operationError??cause;}
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

export async function changeJournalMetadata(id:string,tags:string[],mood:ReadingMood):Promise<void>{
  if(!Array.isArray(tags)||tags.length>6||
     tags.some(tag=>typeof tag!=="string"||tag.length>32)||!["neutral","calm","hopeful","uncertain","anxious"].includes(mood))
    throw new Error("Тэмдэглэгээ 6-аас ихгүй, тус бүр 32 тэмдэгттэй байна.");
  if(!withIndexedDb()){
    const current=loadReadings();
    const target=current.find(item=>item.id===id);
    if(!target)throw new Error("Уншилт олдсонгүй.");
    addReading({...target,tags,mood});
    return;
  }
  await updateJournal(id,record=>({...record,tags,mood}));
}
