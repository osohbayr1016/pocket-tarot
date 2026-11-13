/**
 * Offline tropical geocentric transit comparison using the same ephemeris as
 * natal calculations. Angular relationships are astronomical geometry only.
 */
import * as Astronomy from "astronomy-engine";
import type {NatalChart,ChartBody} from "./astroChart.ts";

const bodies:[string,Astronomy.Body][]=[
  ["Нар",Astronomy.Body.Sun],["Сар",Astronomy.Body.Moon],
  ["Буд",Astronomy.Body.Mercury],["Сугар",Astronomy.Body.Venus],
  ["Ангараг",Astronomy.Body.Mars],["Бархасбадь",Astronomy.Body.Jupiter],
  ["Санчир",Astronomy.Body.Saturn],["Тэнгэрийн ван",Astronomy.Body.Uranus],
  ["Далай ван",Astronomy.Body.Neptune],["Плутон",Astronomy.Body.Pluto],
];
const angles=[
  {label:"Нэгдэл",angle:0},
  {label:"Секстиль",angle:60},
  {label:"Квадрат",angle:90},
  {label:"Трин",angle:120},
  {label:"Эсрэгцэл",angle:180}
] as const;
const norm=(v:number)=>((v%360)+360)%360;
const separation=(a:number,b:number)=>{
  const d=Math.abs(norm(a-b));
  return Math.min(d,360-d);
};
export interface TransitBody{
  name:string;
  longitude:number;
  retrograde:boolean;
}
export interface TransitAspect{
  transit:string;
  natal:string;
  type:string;
  separation:number;
  orb:number;
}
export interface TransitReport{
  utc:string;
  bodies:TransitBody[];
  aspects:TransitAspect[];
}
function position(body:Astronomy.Body,date:Date){
  return norm(Astronomy.Ecliptic(Astronomy.GeoVector(body,date,true)).elon);
}
export function calculateTransits(natal:Pick<NatalChart,"bodies">,date:Date):TransitReport{
  if(!Number.isFinite(date.getTime()))throw new Error("Транзитын огноо буруу.");
  const future=new Date(date.getTime()+24*3600_000);
  const transits=bodies.map(([name,body])=>{
    const longitude=position(body,date);
    const delta=norm(position(body,future)-longitude+180)-180;
    return {name,longitude:+longitude.toFixed(4),retrograde:delta< -0.0001};
  });
  const aspects:TransitAspect[]=[];
  for(const transit of transits){
    for(const natalBody of natal.bodies as readonly ChartBody[]){
      const dist=separation(transit.longitude,natalBody.longitude);
      for(const aspect of angles){
        const orb=Math.abs(dist-aspect.angle);
        if(orb<=2.5){
          aspects.push({transit:transit.name,natal:natalBody.name,type:aspect.label,
            separation:+dist.toFixed(2),orb:+orb.toFixed(2)});
          break;
        }
      }
    }
  }
  return {utc:date.toISOString(),bodies:transits,
    aspects:aspects.sort((a,b)=>a.orb-b.orb).slice(0,50)};
}
