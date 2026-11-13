"use client";
import {useEffect,useState} from "react";
import type {NatalChart} from "../lib/astroChart";
import {calculateTransits,type TransitReport} from "../lib/astroTransits";
import {useLanguage} from "../lib/LanguageProvider";
import {englishAstroBody,englishAstroAspect} from "../lib/astroLocale";

export default function TransitComparison({natal}:{natal:NatalChart}){
  const {locale}=useLanguage();
  const en=locale==="en";
  const [date,setDate]=useState("");
  const [report,setReport]=useState<TransitReport|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const now=new Date();
      setDate([now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-"));
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  const run=()=>{
    try{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Зөв огноо оруулна уу.");
      const target=new Date(date+"T12:00:00Z");
      if(!Number.isFinite(target.getTime())||target.getUTCFullYear()<1900||target.getUTCFullYear()>2100)
        throw new Error("1900–2100 оны огноо сонгоно уу.");
      const result=calculateTransits(natal,target);
      setReport(result);setError("");
    }catch(cause){setReport(null);setError(cause instanceof Error?cause.message:"Транзит тооцоолох алдаа.");}
  };
  return <section aria-label={en?"Natal and transit comparison":"Натал ба транзитын харьцуулалт"}
    className="mt-9 rounded-2xl border border-amber-300/20 bg-[#171329] p-5 sm:p-7">
    <h2 className="font-serif text-2xl text-amber-100">{en?"Natal versus planetary transits":"Огнооны транзит ба натал харьцуулалт"}</h2>
    <p className="mt-3 text-sm leading-7 text-slate-300">
      {en?"Planetary positions, apparent retrograde motion and angular relationships to your natal chart are calculated offline. Only aspects within a 2.5° orb are shown.":
      "Сонгосон өдөрт гарагуудын байрлал, харагдах ухрах хөдөлгөөн, таны төрсөн үеийн гарагуудтай үүсэх өнцгийг офлайн тооцоолно. Зөвхөн 2.5° доторх аспект харуулна."}
    </p>
    <div className="mt-5 flex flex-wrap items-end gap-3">
      <label htmlFor="transit-date" className="text-sm text-amber-100">Тооцоолох огноо
        <input id="transit-date" type="date" value={date} min="1900-01-01" max="2100-12-31"
          onChange={event=>setDate(event.target.value)}
          className="mt-2 block rounded-lg border border-white/20 bg-[#100e1e] p-3 text-white"/>
      </label>
      <button type="button" onClick={run} className="min-h-11 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#171127]">
        Транзит тооцоолох
      </button>
    </div>
    {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    {report&&<div className="mt-7 space-y-6">
      <p className="text-xs text-slate-400">{en?"UTC instant: ":"Нарны цаг: "}{report.utc} · Tropical / geocentric</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-left text-sm">
          <thead className="text-amber-100"><tr>
            <th className="p-2">{en?"Planet":"Гараг"}</th><th className="p-2">{en?"Longitude":"Уртраг"}</th><th className="p-2">{en?"Motion":"Хөдөлгөөн"}</th>
          </tr></thead>
          <tbody>{report.bodies.map(body=><tr key={body.name} className="border-t border-white/10">
            <td className="p-2">{en?englishAstroBody(body.name):body.name}</td>
            <td className="p-2">{body.longitude.toFixed(2)}°</td>
            <td className="p-2">{body.retrograde?(en?"Apparent retrograde":"Харагдах ухрах"):(en?"Direct":"Урагш")}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <h3 className="font-serif text-xl text-amber-100">{en?"Aspects to your natal planets":"Натал гарагтай үүсэх өнцөг"}</h3>
      {report.aspects.length===0?<p className="text-sm text-slate-300">{en?"No aspect within the selected orb.":"Сонгосон orb дотор аспект байхгүй."}</p>:
        <ul className="grid gap-2 sm:grid-cols-2">
          {report.aspects.map((aspect,index)=><li key={index} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            {en?englishAstroBody(aspect.transit):aspect.transit} → {en?englishAstroBody(aspect.natal):aspect.natal}: {en?englishAstroAspect(aspect.type):aspect.type}, orb {aspect.orb.toFixed(2)}°
          </li>)}
        </ul>}
    </div>}
    <p className="mt-5 text-xs leading-6 text-slate-400">
      {en?"Transit aspects describe astronomical geometry, not scientifically verified effects on relationships, health, money or destiny. Accurate birth details remain important for the calculation.":
      "Transit aspects нь astronomical geometry; хүний хувь заяа, эрүүл мэнд, мөнгө, харилцаанд баттай нөлөөлнө гэсэн шинжлэх ухааны дүгнэлт биш. Төрсөн мэдээллийн нарийвчлал чухал."}
    </p>
  </section>;
}
