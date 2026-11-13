export const PREFS_KEY="pocket-tarot-preferences-v1";
export interface ReadingPreferences {
  allowReversed:boolean;
  reduceMotion:boolean;
  cardBack:"star"|"moon";
}
export const defaultReadingPreferences:ReadingPreferences={
  allowReversed:true,reduceMotion:false,cardBack:"star"
};
export function normalizeReadingPreferences(value:unknown):ReadingPreferences{
  if(!value||typeof value!=="object"||Array.isArray(value))return {...defaultReadingPreferences};
  const raw=value as Record<string,unknown>;
  return {
    allowReversed:typeof raw.allowReversed==="boolean"?raw.allowReversed:true,
    reduceMotion:typeof raw.reduceMotion==="boolean"?raw.reduceMotion:false,
    cardBack:raw.cardBack==="moon"?"moon":"star"
  };
}
export function getReadingPreferences():ReadingPreferences{
  try{return normalizeReadingPreferences(JSON.parse(localStorage.getItem(PREFS_KEY)||"null"));}
  catch{return {...defaultReadingPreferences};}
}
export function applyReadingPreferences(prefs:ReadingPreferences){
  if(typeof document==="undefined")return;
  document.documentElement.dataset.reduceMotion=String(prefs.reduceMotion);
  document.documentElement.dataset.cardBack=prefs.cardBack;
}
export function saveReadingPreferences(prefs:ReadingPreferences):ReadingPreferences{
  const normalized=normalizeReadingPreferences(prefs);
  localStorage.setItem(PREFS_KEY,JSON.stringify(normalized));
  applyReadingPreferences(normalized);
  return normalized;
}
