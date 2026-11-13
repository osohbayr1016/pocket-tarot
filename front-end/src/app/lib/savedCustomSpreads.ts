import { makeCustomSpread } from "./customSpread";
import type { TarotSpread } from "../data/tarotSpreads";

export interface SavedSpread {
  id:string;
  name:string;
  labels:string[];
}
export const SPREADS_KEY="pocket-tarot-custom-spreads-v1";
const MAX_SAVED=20;
function validate(raw:unknown):SavedSpread|null{
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
  const value=raw as Record<string,unknown>;
  if(typeof value.id!=="string"||!/^custom-[a-zA-Z0-9-]{1,60}$/.test(value.id))return null;
  if(typeof value.name!=="string"||!value.name.trim()||value.name.length>60)return null;
  if(!Array.isArray(value.labels)||value.labels.length<1||value.labels.length>12)return null;
  if(value.labels.some(label=>typeof label!=="string"||label.length>60))return null;
  return {id:value.id,name:value.name.trim(),labels:value.labels.map((v:string)=>v.trim())};
}
export function parseSavedSpreads(raw:unknown):SavedSpread[]{
  if(!Array.isArray(raw)||raw.length>MAX_SAVED)throw new Error("Хадгалсан дэлгэмлийн сан гэмтсэн байна.");
  const values=raw.map(validate);
  if(values.some(v=>!v))throw new Error("Хадгалсан дэлгэмлийн бүтэц буруу байна.");
  const spreads=values as SavedSpread[];
  if(new Set(spreads.map(v=>v.id)).size!==spreads.length)throw new Error("Дэлгэмлийн ID давхардсан байна.");
  return spreads;
}
export function loadSavedSpreads():SavedSpread[]{
  const value=localStorage.getItem(SPREADS_KEY);
  if(!value)return [];
  try{return parseSavedSpreads(JSON.parse(value));}
  catch{throw new Error("Custom spread сан эвдэрсэн байна. Local data-г шалгана уу.");}
}
export function saveCustomSpread(name:string,labels:readonly string[]):SavedSpread[]{
  const record=validate({id:"custom-"+crypto.randomUUID(),name,labels:[...labels]});
  if(!record)throw new Error("Нэр (1–60), байрлал (1–12) болон нэршлээ шалгана уу.");
  const current=loadSavedSpreads();
  if(current.length>=MAX_SAVED)throw new Error("20 дэлгэмлийн хязгаарт хүрлээ. Хуучин дэлгэмлийг устгана уу.");
  const result=[record,...current];
  localStorage.setItem(SPREADS_KEY,JSON.stringify(result));
  return result;
}
export function deleteCustomSpread(id:string):SavedSpread[]{
  const result=loadSavedSpreads().filter(item=>item.id!==id);
  localStorage.setItem(SPREADS_KEY,JSON.stringify(result));
  return result;
}
export function savedToSpread(saved:SavedSpread):TarotSpread{
  const spread=makeCustomSpread(saved.labels.length,saved.labels);
  return {...spread,id:saved.id,name:saved.name};
}
