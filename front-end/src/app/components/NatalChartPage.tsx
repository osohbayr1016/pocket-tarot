"use client";
import { useState } from "react";
import {
  computeNatalChart, type BirthDetails, type NatalChart, TROPICAL_SIGNS,
} from "../lib/astroChart";
import { OFFLINE_CITIES } from "../lib/astroTimeZone";

const symbols=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
function coords(angle:number,radius:number){
  const radians=(angle-90)*Math.PI/180;
  return {x:210+Math.cos(radians)*radius,y:210+Math.sin(radians)*radius};
}
function ChartWheel({chart}:{chart:NatalChart}){
  return <svg viewBox="0 0 420 420" role="img" aria-label="12 ордын дугуй график ба 10 гарагийн байрлал"
    className="mx-auto aspect-square w-full max-w-lg text-amber-200">
    <circle cx="210" cy="210" r="184" fill="#151127" stroke="#b9a179" strokeWidth="2"/>
    <circle cx="210" cy="210" r="145" fill="none" stroke="#b9a179" strokeOpacity=".65"/>
    <circle cx="210" cy="210" r="96" fill="none" stroke="#b9a179" strokeOpacity=".35"/>
    {Array.from({length:12},(_,i)=>{
      const p=coords(i*30,184),q=coords(i*30,96),c=coords(i*30+15,165);
      return <g key={i}>
        <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#90764a" strokeOpacity=".5"/>
        <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#dec69a">{symbols[i]}</text>
      </g>;
    })}
    {chart.bodies.map((body,index)=>{
      const p=coords(body.longitude,130 - (index%3)*9);
      return <g key={body.name}>
        <circle cx={p.x} cy={p.y} r="5" fill="#f1dfb2" stroke="#161024" strokeWidth="1"/>
        <title>{body.name}: {body.sign} {body.signDegree.toFixed(1)}°</title>
      </g>;
    })}
    {(()=>{
      const p=coords(chart.ascendant,186);
      return <g>
        <circle cx={p.x} cy={p.y} r="7" fill="#8de4d1" stroke="#161024" strokeWidth="2"/>
        <title>Ascendant: {chart.ascendantSign} {chart.ascendant.toFixed(2)}°</title>
      </g>;
    })()}
    <text x="210" y="197" textAnchor="middle" fontSize="12" fill="#e7dfd2" letterSpacing="2">ASCENDANT</text>
    <text x="210" y="228" textAnchor="middle" fontSize="22" fill="#e7d3aa">{chart.ascendantSign}</text>
    <text x="210" y="246" textAnchor="middle" fontSize="10" fill="#b2a7bb">WHOLE SIGN</text>
  </svg>;
}
export default function NatalChartPage(){
  const [city,setCity]=useState("manual");
  const [birthDate,setBirthDate]=useState("");
  const [birthTime,setBirthTime]=useState("");
  const [offset,setOffset]=useState("");
  const [lat,setLat]=useState("");
  const [lon,setLon]=useState("");
  const [chart,setChart]=useState<NatalChart|null>(null);
  const [error,setError]=useState("");
  const cityPreset=OFFLINE_CITIES.find(place=>place.id===city);
  const calculate=()=>{
    try{
      if(!birthDate||!birthTime||(!cityPreset&&offset.trim()==="")||lat.trim()===""||lon.trim()===""){
        throw new Error("Төрсөн огноо, цаг, UTC offset болон координатаа бүрэн оруулна уу.");
      }
      const birth:BirthDetails={
        birthDate,birthTime,utcOffsetHours:cityPreset?undefined:Number(offset),
        timeZone:cityPreset?.timeZone,
        latitude:Number(lat),longitude:Number(lon),
      };
      const result=computeNatalChart(birth);
      setChart(result);setError("");
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Одон орны тооцоололд алдаа гарлаа.");
      setChart(null);
    }
  };
  return <section className="mx-auto max-w-6xl px-3 pb-20">
    <header className="mx-auto mb-9 max-w-2xl text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Astronomical natal chart • Local calculation</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">Төрсөн үеийн тэнгэрийн зураг</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        Нар, Сар, 8 гараг, ascendant, 12 Whole Sign house, гаригуудын өнцгийг офлайн тооцоолно.
        Astronomical calculation нь зурхайн тайлбарын үнэн зөвийг батлахгүй.
      </p>
    </header>
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div className="h-fit rounded-2xl border border-amber-300/20 bg-[#211a34] p-6">
        <h2 className="mb-5 font-serif text-xl text-amber-100">Төрсөн мэдээлэл</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="natal-city" className="mb-2 block text-sm text-amber-100">
              Төрсөн хот / цагийн бүс
            </label>
            <select id="natal-city" value={city} onChange={event=>{
              const id=event.target.value;
              setCity(id);setChart(null);
              const chosen=OFFLINE_CITIES.find(place=>place.id===id);
              if(chosen){setLat(String(chosen.latitude));setLon(String(chosen.longitude));setOffset("");}
            }} className="w-full rounded-lg border border-white/20 bg-[#100e1e] p-3 text-sm text-white">
              <option value="manual">Өөр хот — UTC offset, координатаа гараар оруулах</option>
              {OFFLINE_CITIES.map(place=>(
                <option key={place.id} value={place.id}>{place.label}</option>
              ))}
            </select>
            {cityPreset&&<p className="mt-2 text-xs leading-5 text-slate-300">
              {cityPreset.timeZone} · Төрсөн огнооны DST болон түүхэн цагийн бүсийг төхөөрөмжийн
              IANA мэдээллээс тооцоолно. Төрсөн газраа, тухайн үеийн цагийг нягтлаарай.
            </p>}
          </div>
          {[
            {name:"Төрсөн огноо",type:"date",value:birthDate,set:setBirthDate,id:"natal-date"},
            {name:"Төрсөн цаг (24 цаг)",type:"time",value:birthTime,set:setBirthTime,id:"natal-time"},
            {name:"UTC offset (жишээ: +8, -5)",type:"number",value:offset,set:setOffset,id:"natal-offset"},
            {name:"Өргөрөг latitude",type:"number",value:lat,set:setLat,id:"natal-lat"},
            {name:"Уртраг longitude",type:"number",value:lon,set:setLon,id:"natal-lon"},
          ].filter(field=>city==="manual"||field.id!=="natal-offset").map(field=><div key={field.id}>
            <label htmlFor={field.id} className="mb-2 block text-sm text-amber-100">{field.name}</label>
            <input id={field.id} type={field.type} value={field.value} onChange={e=>field.set(e.target.value)}
              step={field.id==="natal-offset"?"0.25":field.type==="number"?"any":undefined}
              className="w-full rounded-lg border border-white/20 bg-[#100e1e] p-3 text-sm text-white focus:border-amber-300 focus:outline-none"/>
          </div>)}
        </div>
        <p className="mt-5 text-xs leading-6 text-slate-400">
          Хот сонговол координатын ойролцоо төв цэг, IANA timezone ашиглана. Хот сонгоогүй бол
          UTC offset нь төрсөн үеийн DST өөрчлөлтийг тусгасан байх ёстой. Хуучин/тодорхойгүй
          төрсөн цаг, хотын захын бодит координат chart-д нөлөөлж болохыг анхаараарай.
        </p>
        <button type="button" onClick={calculate}
          className="mt-5 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          Тэнгэрийн зураг тооцоолох
        </button>
        {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
      <div className="min-w-0 rounded-2xl border border-amber-300/20 bg-[#211a34] p-5 sm:p-8">
        {!chart?(
          <div className="flex min-h-96 flex-col items-center justify-center text-center">
            <div className="mb-5 text-6xl text-amber-300" aria-hidden="true">✦</div>
            <p className="font-serif text-2xl text-amber-100">Төрсөн үеийн тэнгэрийн байрлал</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Мэдээллээ оруулбал гарагуудын тооцоолсон байрлал энд харагдана. Сервер, API ашиглахгүй.
            </p>
          </div>
        ):(
          <div>
            <p className="text-center text-xs text-slate-400">UTC: {chart.utc}</p>
            <ChartWheel chart={chart}/>
            <p className="mt-4 text-center text-sm text-amber-100">
              Ascendant: {chart.ascendantSign} · Сарны фазын өнцөг {chart.moonPhase.toFixed(1)}°
            </p>
            <h2 className="mt-9 font-serif text-2xl text-amber-100">Гарагуудын байрлал</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-96 text-left text-sm">
                <thead className="bg-white/5 text-amber-100"><tr>
                  <th className="p-3">Тэнгэрийн биет</th><th className="p-3">Орд</th><th className="p-3">Градус</th><th className="p-3">House</th>
                </tr></thead>
                <tbody>
                  {chart.bodies.map(body=><tr key={body.name} className="border-t border-white/10">
                    <td className="p-3">{body.name}</td><td className="p-3">{body.sign}</td>
                    <td className="p-3">{body.signDegree.toFixed(2)}°</td><td className="p-3">{body.house}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <h2 className="mt-9 font-serif text-2xl text-amber-100">Гарагийн аспект</h2>
            {chart.aspects.length===0?<p className="mt-3 text-sm text-slate-300">Тохирох өнцөг илрээгүй.</p>:
              <ul className="mt-4 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                {chart.aspects.slice(0,16).map((a,index)=><li key={index} className="rounded-lg bg-white/5 p-3">
                  {a.a} – {a.b}: {a.type} ({a.separation.toFixed(1)}°, orb {a.orb.toFixed(1)}°)
                </li>)}
              </ul>}
            <h2 className="mt-9 font-serif text-2xl text-amber-100">Whole Sign Houses</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {chart.houseSigns.map((name,i)=><div key={i} className="rounded-lg bg-white/5 p-3 text-center text-sm text-slate-100">
                <span className="block text-xs text-amber-300">{i+1}-р house</span>{name}
              </div>)}
            </div>
          </div>
        )}
        <p className="mt-8 text-xs leading-6 text-slate-400">
          Tropical zodiac / geocentric true ecliptic of date / Whole Sign houses. Нарийн цаг, координат болон UTC offset
          орд, ascendant, house-д нөлөөлнө. Astronomy Engine 2.1.19 (MIT) ашигладаг. Энэ нь
          Placidus house, sidereal zodiac, эсвэл ирээдүйн баттай зөгнөл биш.
        </p>
      </div>
    </div>
  </section>;
}
