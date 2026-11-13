/**
 * Geocentric tropical birth chart computed locally using the MIT-licensed
 * Astronomy Engine 2.1.19. This is astronomical geometry, not proof of any
 * astrological predictions. No user data leaves the browser.
 *
 * Time zone MUST be a user-verified offset at the historical birth time.
 * Whole Sign houses are used; Placidus is not calculated or claimed.
 */
import * as Astronomy from "astronomy-engine";
import { resolveLocalTime } from "./astroTimeZone.ts";

export interface BirthDetails {
  birthDate:string;
  birthTime:string;
  utcOffsetHours?:number;
  timeZone?:string;
  latitude:number;
  longitude:number;
}
export interface ChartBody {
  name:string;
  longitude:number;
  latitude:number;
  sign:string;
  signDegree:number;
  house:number;
}
export interface ChartAspect {
  a:string;
  b:string;
  type:string;
  exactAngle:number;
  separation:number;
  orb:number;
}
export interface NatalChart {
  utc:string;
  ascendant:number;
  ascendantSign:string;
  moonPhase:number;
  bodies:ChartBody[];
  aspects:ChartAspect[];
  houseSigns:string[];
}
export const TROPICAL_SIGNS=[
  "Хонь","Үхэр","Ихэр","Мэлхий","Арслан","Охин",
  "Жинлүүр","Хилэнц","Нум","Матар","Хумх","Загас"
] as const;
const bodyList:[string,Astronomy.Body][]=[
  ["Нар",Astronomy.Body.Sun],["Сар",Astronomy.Body.Moon],
  ["Буд",Astronomy.Body.Mercury],["Сугар",Astronomy.Body.Venus],
  ["Ангараг",Astronomy.Body.Mars],["Бархасбадь",Astronomy.Body.Jupiter],
  ["Санчир",Astronomy.Body.Saturn],["Тэнгэрийн ван",Astronomy.Body.Uranus],
  ["Далай ван",Astronomy.Body.Neptune],["Плутон",Astronomy.Body.Pluto],
];
const normalize=(degrees:number)=>((degrees%360)+360)%360;
const deg=(rad:number)=>rad*Math.PI/180;
const isLeap=(year:number)=>year%4===0&&(year%100!==0||year%400===0);
function validDate(value:string):{year:number;month:number;day:number} {
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!m)throw new Error("Огноо YYYY-MM-DD форматтай байна.");
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  const days=[31,isLeap(year)?29:28,31,30,31,30,31,31,30,31,30,31];
  if(year<1900||year>2100||month<1||month>12||day<1||day>days[month-1]){
    throw new Error("1900–2100 оны зөв төрсөн огноо оруулна уу.");
  }
  return {year,month,day};
}
export function parseBirthUTC(input:BirthDetails):Date {
  const {year,month,day}=validDate(input.birthDate);
  const parts=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(input.birthTime);
  if(!parts)throw new Error("Төрсөн цаг HH:mm форматтай байна.");
  const {utcOffsetHours, latitude, longitude}=input;
  if(input.timeZone){
    if(!Number.isFinite(latitude)||latitude < -89.99||latitude>89.99||
       !Number.isFinite(longitude)||longitude < -180||longitude>180){
      throw new Error("Өргөрөг (-89.99...89.99), уртраг (-180...180) шалгана уу.");
    }
    return resolveLocalTime(input.birthDate,input.birthTime,input.timeZone);
  }

  if(utcOffsetHours===undefined || !Number.isFinite(utcOffsetHours)||utcOffsetHours < -12||utcOffsetHours>14 ||
     Math.round(utcOffsetHours*4)!==utcOffsetHours*4){
    throw new Error("Төрсөн үеийн UTC offset -12 ... +14, 15 минутын алхамтай байна.");
  }
  if(!Number.isFinite(latitude)||latitude < -89.99||latitude>89.99||
     !Number.isFinite(longitude)||longitude < -180||longitude>180){
    throw new Error("Өргөрөг (-89.99...89.99), уртраг (-180...180) шалгана уу.");
  }
  const millis=Date.UTC(year,month-1,day,Number(parts[1]),Number(parts[2]))-utcOffsetHours*3600000;
  return new Date(millis);
}
/**
 * A numerical intersection of ECT ecliptic plane with the eastern horizon.
 * Rotations are provided by Astronomy Engine, avoiding assumed obliquity.
 * East is horizon vector y < 0 (the library's y-axis points west).
 */
export function calculateAscendant(date:Date, latitude:number,longitude:number):number {
  const t=Astronomy.MakeTime(date);
  const toEQD=Astronomy.Rotation_ECT_EQD(t);
  const toHOR=Astronomy.Rotation_EQD_HOR(t,new Astronomy.Observer(latitude,longitude,0));
  const horizon=(angle:number)=>{
    const radians=deg(angle);
    const ecliptic=new Astronomy.Vector(Math.cos(radians),Math.sin(radians),0,t);
    const equator=Astronomy.RotateVector(toEQD,ecliptic);
    return Astronomy.RotateVector(toHOR,equator);
  };
  let prev=horizon(0);
  for(let angle=1;angle<=360;angle++){
    const current=horizon(angle);
    if(prev.z*current.z<=0){
      let a=angle-1,b=angle;
      let left=prev.z;
      for(let step=0;step<28;step++){
        const middle=(a+b)/2;
        const mid=horizon(middle);
        if(left*mid.z<=0){b=middle;}else{a=middle;left=mid.z;}
      }
      const root=(a+b)/2;
      if(horizon(root).y<0)return normalize(root);
    }
    prev=current;
  }
  throw new Error("Ascendant байрлал тооцоолох боломжгүй байна.");
}
const aspectDefinitions=[
  {name:"Нэгдэл",angle:0,orb:8},
  {name:"Секстиль",angle:60,orb:4},
  {name:"Квадрат",angle:90,orb:6},
  {name:"Трин",angle:120,orb:6},
  {name:"Эсрэгцэл",angle:180,orb:8},
];
export function calculateAspects(bodies:readonly ChartBody[]):ChartAspect[]{
  const aspects:ChartAspect[]=[];
  for(let i=0;i<bodies.length;i++){
    for(let j=i+1;j<bodies.length;j++){
      const a=bodies[i],b=bodies[j];
      const diff=Math.abs(normalize(a.longitude-b.longitude));
      const separation=Math.min(diff,360-diff);
      for(const aspect of aspectDefinitions){
        const orb=Math.abs(separation-aspect.angle);
        if(orb<=aspect.orb){
          aspects.push({a:a.name,b:b.name,type:aspect.name,
            exactAngle:aspect.angle,separation:+separation.toFixed(3),orb:+orb.toFixed(3)});
          break;
        }
      }
    }
  }
  return aspects.sort((a,b)=>a.orb-b.orb);
}
export function computeNatalChart(input:BirthDetails):NatalChart {
  const utc=parseBirthUTC(input);
  const ascendant=calculateAscendant(utc,input.latitude,input.longitude);
  const ascSignIndex=Math.floor(ascendant/30);
  const bodies:ChartBody[]=bodyList.map(([name,body])=>{
    const position=Astronomy.Ecliptic(Astronomy.GeoVector(body,utc,true));
    const lon=normalize(position.elon);
    const signIndex=Math.floor(lon/30);
    return {
      name, longitude:+lon.toFixed(4),latitude:+position.elat.toFixed(4),
      sign:TROPICAL_SIGNS[signIndex],signDegree:+(lon%30).toFixed(4),
      house:(signIndex-ascSignIndex+12)%12+1
    };
  });
  return {
    utc:utc.toISOString(),ascendant:+ascendant.toFixed(4),
    ascendantSign:TROPICAL_SIGNS[ascSignIndex],
    moonPhase:+Astronomy.MoonPhase(utc).toFixed(4),
    bodies,
    aspects:calculateAspects(bodies),
    houseSigns:Array.from({length:12},(_,i)=>TROPICAL_SIGNS[(ascSignIndex+i)%12]),
  };
}
