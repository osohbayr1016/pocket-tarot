/**
 * Device-only complete portable backup. Validate all input before mutation.
 * Import REPLACES data only after explicit user consent and backup prompt.
 */
import {HISTORY_KEY,loadReadings,parseReadings,type SavedReading} from "./readingHistory.ts";
import {SPREADS_KEY,loadSavedSpreads,parseSavedSpreads,type SavedSpread} from "./savedCustomSpreads.ts";
import {PREFS_KEY,getReadingPreferences,normalizeReadingPreferences,
  applyReadingPreferences,type ReadingPreferences} from "./readingPreferences.ts";

import {STUDY_KEY,loadStudyProgress,validateStudyProgress,type CardProgress} from "./studyProgress.ts";
import {listJournal,replaceJournal,JOURNAL_SAFE_LIMIT} from "./journalDb.ts";
import {assertPlaintextBackupSize} from "./backupLimits.ts";
export const BACKUP_FORMAT="pocket-tarot-complete-backup";
const DRAFT_PREFIX="pocket-tarot-draft-v1:";
const LOCALE_KEY="pocket-tarot-locale-v1";
const MAX_DRAFT_COUNT=200;
/** Only known draft names are restored, never arbitrary keys or secrets. */
function validateDrafts(raw:unknown):{key:string;text:string}[]{
  if(!Array.isArray(raw)||raw.length>MAX_DRAFT_COUNT)
    throw new Error("Backup draft тэмдэглэлийн тоо буруу байна.");
  const seen=new Set<string>();
  return raw.map((item:unknown)=>{
    if(!item||typeof item!=="object"||Array.isArray(item))
      throw new Error("Draft бүтэц буруу байна.");
    const draft=item as Record<string,unknown>;
    if(typeof draft.key!=="string"||!/^pocket-tarot-draft-v1:[A-Za-z0-9-]{1,100}$/.test(draft.key)||
      typeof draft.text!=="string"||draft.text.length>4000||seen.has(draft.key))
      throw new Error("Draft key, хэмжээ эсвэл давхардал буруу байна.");
    seen.add(draft.key);
    return {key:draft.key,text:draft.text};
  });
}
function collectDrafts():{key:string;text:string}[]{
  const list:string[]=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key?.startsWith(DRAFT_PREFIX))list.push(key);
  }
  if(list.length>MAX_DRAFT_COUNT)
    throw new Error("200-аас олон түр тэмдэглэл байна. Илүүдлийг backup тусад нь хийнэ үү.");
  return validateDrafts(list.map(key=>({key,text:localStorage.getItem(key)??""})));
}

export interface CompleteBackup {
  format:typeof BACKUP_FORMAT;
  version:2|3|4;
  exportedAt:string;
  readings:SavedReading[];
  spreads:SavedSpread[];
  preferences:ReadingPreferences;
  study:CardProgress[];
  locale?:"mn"|"en"|null;
  drafts?:{key:string;text:string}[];
}
export function createCompleteBackup():string{
  const backup:CompleteBackup={
    format:BACKUP_FORMAT,version:2,exportedAt:new Date().toISOString(),
    readings:loadReadings(),spreads:loadSavedSpreads(),preferences:getReadingPreferences(),
    study:loadStudyProgress(),
  };
  const json=JSON.stringify(backup,null,2);
  assertPlaintextBackupSize(json);
  return json;
}
export function parseCompleteBackup(content:string):CompleteBackup{
  assertPlaintextBackupSize(content);
  let raw:unknown;
  try{raw=JSON.parse(content);}
  catch{throw new Error("JSON файл уншигдсангүй.");}
  if(!raw||typeof raw!=="object"||Array.isArray(raw))
    throw new Error("Backup файл буруу байна.");
  const obj=raw as Record<string,unknown>;
  if(obj.format!==BACKUP_FORMAT||(obj.version!==1&&obj.version!==2&&obj.version!==3&&obj.version!==4))
    throw new Error("Pocket Tarot backup формат таарахгүй байна.");
  if(!Array.isArray(obj.readings)||obj.readings.length>(obj.version===3||obj.version===4?JOURNAL_SAFE_LIMIT:100)||
     !Array.isArray(obj.spreads)||obj.spreads.length>20)
    throw new Error("Backup-ийн уншилт эсвэл дэлгэмлийн хэмжээ буруу байна.");
  const readings=(obj.version===3||obj.version===4)
    ? obj.readings.map(value=>parseReadings([value])[0]).filter(Boolean) as SavedReading[]
    : parseReadings(obj.readings);
  const spreads=parseSavedSpreads(obj.spreads);
  // Version 1 backups predate spaced-repetition and remain importable.
  const study=obj.version===1?[]:validateStudyProgress(obj.study);
  if(readings.length!==obj.readings.length)
    throw new Error("Backup-ийн зарим уншилт буруу байна.");
  const prefs=obj.preferences;
  if(!prefs||typeof prefs!=="object"||Array.isArray(prefs))
    throw new Error("Backup-ийн тохиргоо буруу байна.");
  const p=prefs as Record<string,unknown>;
  if(typeof p.allowReversed!=="boolean"||typeof p.reduceMotion!=="boolean"||
     !["star","moon"].includes(String(p.cardBack)))
    throw new Error("Backup-ийн preferences буруу байна.");
  const drafts=obj.version===4?validateDrafts(obj.drafts):[];
  const locale=obj.version===4?
    (obj.locale==="mn"||obj.locale==="en"?obj.locale:null):null;
  if(obj.version===4&&!locale)throw new Error("Backup хэлний тохиргоо буруу байна.");
  return {
    format:BACKUP_FORMAT,version:obj.version===4?4:obj.version===3?3:2,exportedAt:typeof obj.exportedAt==="string"?obj.exportedAt:"",
    readings,spreads,preferences:normalizeReadingPreferences(prefs),study,drafts,locale
  };
}
/** Replace with best-effort transaction rollback when localStorage throws. */
export function restoreCompleteBackup(content:string):CompleteBackup{
  const backup=parseCompleteBackup(content);
  const keys=[HISTORY_KEY,SPREADS_KEY,PREFS_KEY,STUDY_KEY] as const;
  const previous=keys.map(key=>localStorage.getItem(key));
  const next=[JSON.stringify(backup.readings),JSON.stringify(backup.spreads),
    JSON.stringify(backup.preferences),JSON.stringify(backup.study)];
  try{
    keys.forEach((key,i)=>localStorage.setItem(key,next[i]));
    applyReadingPreferences(backup.preferences);
  }catch{
    keys.forEach((key,i)=>{
      try{
        if(previous[i]===null)localStorage.removeItem(key);
        else localStorage.setItem(key,previous[i]);
      }catch{/* Browser may not allow rollback when quota is exhausted. */}
    });
    throw new Error("Backup сэргээхэд storage алдаа гарлаа. Хуучин мэдээллийг сэргээхийг оролдлоо.");
  }
  return backup;
}

/** Version 3 includes the full IndexedDB journal, not only the first 100 rows. */
export async function createCompleteBackupV3():Promise<string>{
  const backup:CompleteBackup={
    format:BACKUP_FORMAT,version:3,exportedAt:new Date().toISOString(),
    readings:await listJournal(),
    spreads:loadSavedSpreads(),
    preferences:getReadingPreferences(),
    study:loadStudyProgress(),
  };
  const json=JSON.stringify(backup,null,2);
  assertPlaintextBackupSize(json);
  return json;
}
/**
 * Async restore. Replaces the IndexedDB journal then other data with best
 * effort rollback on failure. Both stores are local, never sent to a server.
 */
export async function restoreCompleteBackupV3(content:string):Promise<CompleteBackup>{
  const backup=parseCompleteBackup(content);
  if(typeof indexedDB==="undefined"){
    if(backup.version===4)throw new Error("Backup v4-г сэргээхэд IndexedDB шаардлагатай. Энэ browser өгөгдлийн сан дэмжихгүй.");
    if(backup.readings.length>100)throw new Error("Энэ browser-д IndexedDB байхгүй. 100-аас олон уншилт сэргээх боломжгүй.");
    return restoreCompleteBackup(content);
  }
  const previousJournal=await listJournal();
  const keys=[SPREADS_KEY,PREFS_KEY,STUDY_KEY] as const;
  const previous=keys.map(key=>localStorage.getItem(key));
  const oldDrafts=collectDrafts();
  const previousLocale=localStorage.getItem(LOCALE_KEY);
  try{
    await replaceJournal(backup.readings);
    const next=[JSON.stringify(backup.spreads),JSON.stringify(backup.preferences),JSON.stringify(backup.study)];
    for(let i=0;i<keys.length;i++)localStorage.setItem(keys[i],next[i]);
    if(backup.version===4){
      for(const draft of oldDrafts)localStorage.removeItem(draft.key);
      for(const draft of backup.drafts??[])localStorage.setItem(draft.key,draft.text);
      if(backup.locale)localStorage.setItem(LOCALE_KEY,backup.locale);
    }
    applyReadingPreferences(backup.preferences);
    return backup;
  }catch(cause){
    for(let i=0;i<keys.length;i++){
      try{
        const value=previous[i];
        if(value==null)localStorage.removeItem(keys[i]);
        else localStorage.setItem(keys[i],value);
      }catch{/* Storage errors may also prevent rollback. */}
    }
    if(backup.version===4){
      try{
        for(let index=localStorage.length-1;index>=0;index--){
          const name=localStorage.key(index);
          if(name?.startsWith(DRAFT_PREFIX))localStorage.removeItem(name);
        }
        for(const draft of oldDrafts)localStorage.setItem(draft.key,draft.text);
        if(previousLocale===null)localStorage.removeItem(LOCALE_KEY);
        else localStorage.setItem(LOCALE_KEY,previousLocale);
      }catch{throw new Error("Draft rollback амжилтгүй. Эхний backup файлаа хадгална уу.");}
    }
    try{await replaceJournal(previousJournal);}
    catch{throw new Error("Сэргээх болон rollback амжилтгүй. Хуучин backup файлаа хадгална уу.");}
    throw cause instanceof Error?cause:new Error("Backup сэргээхэд алдаа гарлаа.");
  }
}

/** Version 4 adds device-only unsaved drafts and language to the full journal backup. */
export async function createCompleteBackupV4():Promise<string>{
  const base:CompleteBackup=JSON.parse(await createCompleteBackupV3());
  const currentLocale=localStorage.getItem(LOCALE_KEY);
  const content:CompleteBackup={
    ...base,version:4,
    locale:currentLocale==="en"?"en":"mn",
    drafts:collectDrafts()
  };
  const json=JSON.stringify(content,null,2);
  assertPlaintextBackupSize(json);
  return json;
}
