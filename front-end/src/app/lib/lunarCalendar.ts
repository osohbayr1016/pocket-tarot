/**
 * Astronomical moon cycle (not a horoscope or predictive interpretation).
 * Calculated by Astronomy Engine from the Sun-Moon ecliptic angle.
 */
import * as Astronomy from "astronomy-engine";
const LABELS=["Шинэ сар","Өсөх хавирган","Эхний хагас","Өсөх дүүрэх",
  "Бүтэн сар","Хорогдох дүүрэн","Сүүлийн хагас","Хорогдох хавирган"] as const;
export interface MoonDay {
  date:string;
  day:number;
  phase:number;
  illumination:number;
  phaseIndex:number;
  phaseName:string;
}
export function moonSnapshot(date:Date):Pick<MoonDay,"phase"|"illumination"|"phaseIndex"|"phaseName">{
  if(!Number.isFinite(date.getTime()))throw new Error("Огноо буруу байна.");
  const phase=Astronomy.MoonPhase(date);
  const illumination=Math.round((1-Math.cos(phase*Math.PI/180))*50);
  const phaseIndex=Math.floor(((phase+22.5)%360)/45);
  return {phase:+phase.toFixed(3),illumination,phaseIndex,phaseName:LABELS[phaseIndex]};
}
export function getMoonMonth(year:number,month:number):MoonDay[]{
  if(!Number.isInteger(year)||year<1900||year>2100||
     !Number.isInteger(month)||month<1||month>12)
    throw new Error("1900–2100 оны зөв сар сонгоно уу.");
  const days=new Date(year,month,0).getDate();
  return Array.from({length:days},(_,i)=>{
    const day=i+1;
    // Local noon gives a stable day-level phase indication across DST shifts.
    const snapshot=moonSnapshot(new Date(year,month-1,day,12,0,0));
    return {date:[year,String(month).padStart(2,"0"),String(day).padStart(2,"0")].join("-"),
      day,...snapshot};
  });
}
export function closestLunation(rows:readonly MoonDay[],target:0|180):MoonDay|null{
  if(rows.length===0)return null;
  return [...rows].sort((a,b)=>{
    const delta=(p:number)=>Math.min(Math.abs(p-target),360-Math.abs(p-target));
    return delta(a.phase)-delta(b.phase);
  })[0];
}
