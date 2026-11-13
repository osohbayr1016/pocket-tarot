/**
 * Astronomical moon cycle (not a horoscope or predictive interpretation).
 * Calculated by Astronomy Engine from the Sun-Moon ecliptic angle.
 */
import * as Astronomy from "astronomy-engine";
import {resolveLocalTime} from "./astroTimeZone.ts";
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
export function getMoonMonth(year:number,month:number,timeZone?:string):MoonDay[]{
  if(!Number.isInteger(year)||year<1900||year>2100||
     !Number.isInteger(month)||month<1||month>12)
    throw new Error("1900–2100 оны зөв сар сонгоно уу.");
  const days=new Date(year,month,0).getDate();
  return Array.from({length:days},(_,i)=>{
    const day=i+1;
    // Local noon gives a stable day-level phase indication across DST shifts.
    const date=[year,String(month).padStart(2,"0"),String(day).padStart(2,"0")].join("-");
    const instant=timeZone?resolveLocalTime(date,"12:00",timeZone):new Date(year,month-1,day,12,0,0);
    const snapshot=moonSnapshot(instant);
    return {date,
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

export interface ExactMoonEvent{
  type:"new"|"full";
  label:string;
  utc:string;
  local:string;
}
/** True astronomical phase instants; day grid remains a midday approximation. */
export function getExactMoonEvents(year:number,month:number,timeZone:string,locale="mn-MN"):ExactMoonEvent[]{
  if(!Number.isInteger(year)||year<1900||year>2100||
     !Number.isInteger(month)||month<1||month>12)
    throw new Error("Сарны календарийн огноо буруу байна.");
  const formatter=new Intl.DateTimeFormat(locale,{
    timeZone,year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hour12:false
  });
  const start=Date.UTC(year,month-1,1)-2*86400000;
  const end=Date.UTC(year,month,1)+2*86400000;
  const events:ExactMoonEvent[]=[];
  for(const [type,angle,label] of [["new",0,"Шинэ сар"],["full",180,"Бүтэн сар"]] as const){
    let next=new Date(start);
    for(let attempts=0;attempts<3;attempts++){
      const result=Astronomy.SearchMoonPhase(angle,next,46);
      if(!result)break;
      const date=result.date;
      if(date.getTime()>end)break;
      const parts=new Intl.DateTimeFormat("en-US",{
        timeZone,year:"numeric",month:"numeric",day:"numeric"
      }).formatToParts(date);
      const localYear=Number(parts.find(p=>p.type==="year")?.value);
      const localMonth=Number(parts.find(p=>p.type==="month")?.value);
      if(localYear===year&&localMonth===month){
        events.push({type,label,utc:date.toISOString(),local:formatter.format(date)});
      }
      next=new Date(date.getTime()+86400000);
    }
  }
  return events.sort((a,b)=>a.utc.localeCompare(b.utc));
}
