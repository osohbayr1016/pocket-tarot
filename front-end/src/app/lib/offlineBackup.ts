/**
 * Device-only complete portable backup. Validate all input before mutation.
 * Import REPLACES data only after explicit user consent and backup prompt.
 */
import {HISTORY_KEY,loadReadings,parseReadings,type SavedReading} from "./readingHistory.ts";
import {SPREADS_KEY,loadSavedSpreads,parseSavedSpreads,type SavedSpread} from "./savedCustomSpreads.ts";
import {PREFS_KEY,getReadingPreferences,normalizeReadingPreferences,
  applyReadingPreferences,type ReadingPreferences} from "./readingPreferences.ts";

import {STUDY_KEY,loadStudyProgress,validateStudyProgress,type CardProgress} from "./studyProgress.ts";
export const BACKUP_FORMAT="pocket-tarot-complete-backup";
export interface CompleteBackup {
  format:typeof BACKUP_FORMAT;
  version:2;
  exportedAt:string;
  readings:SavedReading[];
  spreads:SavedSpread[];
  preferences:ReadingPreferences;
  study:CardProgress[];
}
export function createCompleteBackup():string{
  const backup:CompleteBackup={
    format:BACKUP_FORMAT,version:2,exportedAt:new Date().toISOString(),
    readings:loadReadings(),spreads:loadSavedSpreads(),preferences:getReadingPreferences(),
    study:loadStudyProgress(),
  };
  return JSON.stringify(backup,null,2);
}
export function parseCompleteBackup(content:string):CompleteBackup{
  if(content.length>3_000_000)throw new Error("Backup файлын дээд хэмжээ 3 MB.");
  let raw:unknown;
  try{raw=JSON.parse(content);}
  catch{throw new Error("JSON файл уншигдсангүй.");}
  if(!raw||typeof raw!=="object"||Array.isArray(raw))
    throw new Error("Backup файл буруу байна.");
  const obj=raw as Record<string,unknown>;
  if(obj.format!==BACKUP_FORMAT||(obj.version!==1&&obj.version!==2))
    throw new Error("Pocket Tarot backup формат таарахгүй байна.");
  if(!Array.isArray(obj.readings)||obj.readings.length>100||
     !Array.isArray(obj.spreads)||obj.spreads.length>20)
    throw new Error("Backup-ийн уншилт эсвэл дэлгэмлийн хэмжээ буруу байна.");
  const readings=parseReadings(obj.readings);
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
  return {
    format:BACKUP_FORMAT,version:2,exportedAt:typeof obj.exportedAt==="string"?obj.exportedAt:"",
    readings,spreads,preferences:normalizeReadingPreferences(prefs),study
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
