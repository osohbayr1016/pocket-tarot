"use client";
import {useEffect,useMemo,useState} from "react";
import {closestLunation,getMoonMonth,getExactMoonEvents} from "../lib/lunarCalendar";
import {OFFLINE_CITIES} from "../lib/astroTimeZone";
import {useLanguage} from "../lib/LanguageProvider";

const PHASE_ICONS=["○","◔","◐","◕","●","◕","◑","◔"];
const WEEKDAYS=["Да","Мя","Лх","Пү","Ба","Бя","Ня"];
const EN_WEEKDAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const EN_PHASES=["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"];
function isoToday(now:Date){
  return [now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
}
export default function MoonCalendar(){
  const {locale}=useLanguage();
  const en=locale==="en";
  const [month,setMonth]=useState<{year:number;month:number}|null>(null);
  const [today,setToday]=useState("");
  const [timeZone,setTimeZone]=useState("Asia/Ulaanbaatar");
  const [selected,setSelected]=useState<number|null>(null);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const now=new Date();
      setMonth({year:now.getFullYear(),month:now.getMonth()+1});
      setToday(isoToday(now));
      setSelected(now.getDate());
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  const year=month?.year||2024,mon=month?.month||1;
  const days=useMemo(()=>month?getMoonMonth(year,mon,timeZone):[],[month,year,mon,timeZone]);
  const exactEvents=useMemo(()=>month?getExactMoonEvents(year,mon,timeZone,en?"en-US":"mn-MN"):[],[month,year,mon,timeZone,en]);
  const firstOffset=month?(new Date(year,mon-1,1).getDay()+6)%7:0;
  const active=days.find(d=>d.day===selected)||days[0];
  const nearestNew=closestLunation(days,0);
  const nearestFull=closestLunation(days,180);
  const shift=(delta:number)=>{
    if(!month)return;
    const next=mon+delta;
    const yearValue=year+Math.floor((next-1)/12);
    const monthValue=((next-1)%12+12)%12+1;
    if(yearValue<1900||yearValue>2100)return;
    setMonth({year:yearValue,month:monthValue});setSelected(1);
  };
  const reset=()=>{
    const now=new Date();
    setMonth({year:now.getFullYear(),month:now.getMonth()+1});
    setToday(isoToday(now));
    setSelected(now.getDate());
  };
  return <section className="mx-auto max-w-5xl px-3 pb-20">
    <header className="mx-auto mb-9 max-w-2xl text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Astronomical lunar cycle</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">{en?"Moon phase calendar":"Сарны фазын календарь"}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        {en?"Calculate the eight lunar phases and approximate daily illumination from astronomical Sun–Moon positions, entirely offline.":"Нар, Сарны байрлалаас тухайн өдрийн сарны фазыг төхөөрөмж дээрээ тооцоолно. 8 үе шат, ойролцоох гэрэлтэлтийн хувь, өдөр бүрийн өөрчлөлтийг харуулна."}
      </p>
    </header>
    {!month?<p role="status" className="py-20 text-center text-amber-100">{en?"Calculating lunar phases...":"Сарны фаз тооцоолж байна..."}</p>:
      <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-amber-300/25 bg-[#211a34] p-4 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={()=>shift(-1)} disabled={year===1900&&mon===1}
              aria-label={en?"Previous month":"Өмнөх сар"} className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-amber-100 hover:border-amber-300/60">←</button>
            <h2 className="font-serif text-2xl text-amber-100" aria-live="polite">
              {new Intl.DateTimeFormat(en?"en-US":"mn-MN",{year:"numeric",month:"long"}).format(new Date(year,mon-1,1))}
            </h2>
            <button type="button" onClick={()=>shift(1)} disabled={year===2100&&mon===12}
              aria-label={en?"Next month":"Дараагийн сар"} className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-amber-100 hover:border-amber-300/60">→</button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2">
            {(en?EN_WEEKDAYS:WEEKDAYS).map(day=><span key={day} className="py-2 text-xs text-slate-300">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2" aria-label={en?"Daily Moon phase calendar":"Сарны фазын өдрийн календарь"}>
            {Array.from({length:firstOffset},(_,i)=><div key={"empty-"+i} aria-hidden="true"/>)}
            {days.map(day=>(
              <button key={day.day} type="button" aria-pressed={active?.day===day.day}
                aria-label={day.date+": "+(en?EN_PHASES[day.phaseIndex]:day.phaseName)+", "+day.illumination+(en?" percent illuminated":" хувь гэрэлтэлт")}
                onClick={()=>setSelected(day.day)}
                className={"min-h-20 rounded-xl border p-1.5 text-center transition-colors sm:min-h-24 sm:p-2 "+
                  (active?.day===day.day?"border-amber-300 bg-amber-300/15":
                  day.date===today?"border-cyan-300/50 bg-cyan-200/5":"border-white/10 bg-white/5 hover:border-amber-300/40")}>
                <span className="block text-xs text-slate-200">{day.day}</span>
                <span aria-hidden="true" className="mt-1 block text-xl text-amber-200 sm:text-2xl">{PHASE_ICONS[day.phaseIndex]}</span>
                <span className="mt-1 block text-[11px] text-slate-300">{day.illumination}%</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={reset} className="mt-6 rounded-full border border-amber-300/30 px-5 py-2.5 text-sm text-amber-100">
            Өнөөдөр рүү буцах
          </button>
        </div>
        <aside className="h-fit space-y-5 rounded-2xl border border-amber-300/25 bg-[#211a34] p-6">
          <h2 className="font-serif text-2xl text-amber-100">{en?"Selected day":"Сонгосон өдөр"}</h2>
          {active&&<>
            <p className="text-sm text-slate-300">{active.date}</p>
            <div aria-hidden="true" className="py-5 text-center text-7xl text-amber-200">{PHASE_ICONS[active.phaseIndex]}</div>
            <p className="text-center font-serif text-xl text-amber-100">{en?EN_PHASES[active.phaseIndex]:active.phaseName}</p>
            <p className="text-center text-sm text-slate-300">{en?"Approximate illumination: ":"Ойролцоох гэрэлтэлт: "}{active.illumination}%</p>
            <p className="text-center text-xs text-slate-400">{en?"Sun–Moon phase angle: ":"Нар–Сарны фазын өнцөг: "}{active.phase.toFixed(1)}°</p>
          </>}
          <div className="border-t border-white/10 pt-5">
            <label htmlFor="moon-zone" className="block text-xs font-semibold text-amber-100">{en?"Time zone":"Цагийн бүс"}</label>
            <select id="moon-zone" value={timeZone} onChange={event=>setTimeZone(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-[#171127] p-3 text-sm text-slate-100">
              {Array.from(new Map(OFFLINE_CITIES.map(city=>[city.timeZone,city.label])).entries()).map(([zone,label])=>
                <option key={zone} value={zone}>{en?zone.replace(/_/g," "):label} ({zone})</option>
              )}
            </select>
            <h3 className="mt-5 font-semibold text-amber-100">{en?"Exact new and full Moon times":"Сарны фаз солигдох яг цаг"}</h3>
            {exactEvents.length===0?<p className="mt-2 text-sm text-slate-300">{en?"No phase event in this month.":"Энэ сард фазын өгөгдөл олдсонгүй."}</p>:
              <ul className="mt-3 space-y-3">
                {exactEvents.map(event=><li key={event.utc} className="rounded-lg border border-amber-300/15 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-amber-100">{en?(event.type==="new"?"New Moon":"Full Moon"):event.label}</p>
                  <p className="mt-1 text-xs text-slate-200">{en?"Local time: ":"Орон нутгийн цаг: "}{event.local}</p>
                  <p className="mt-1 text-xs text-slate-400">UTC: {event.utc}</p>
                </li>)}
              </ul>}
          </div>
          <div className="border-t border-white/10 pt-5 text-sm leading-7 text-slate-200">
            {nearestNew&&<p>{en?"Nearest day to New Moon: ":"Шинэ сартай хамгийн ойр өдөр: "} <strong className="text-amber-200">{nearestNew.date}</strong></p>}
            {nearestFull&&<p className="mt-2">{en?"Nearest day to Full Moon: ":"Бүтэн сартай хамгийн ойр өдөр: "} <strong className="text-amber-200">{nearestFull.date}</strong></p>}
          </div>
          <p className="border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">
            {en?"Daily symbols use noon in the selected time zone; they are approximations, not exact phase instants. Exact event UTC/local times are listed separately. The Moon's phases do not scientifically predict personal events.":"Одон орны тооцоолол сонгосон цагийн бүсийн өдөр бүрийн 12:00 цагт үндэслэнэ. Өдөр тутмын зураглал нь ойролцоо; фазын яг өөрчлөгдөх UTC болон орон нутгийн цагийг тусад нь үзүүлнэ. Зурхайн баттай нөлөө, таамаглал гэж үзэхгүй."}
          </p>
        </aside>
      </div>}
  </section>;
}
