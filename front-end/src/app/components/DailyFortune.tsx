"use client";
import { useState } from "react";
import { getDailyFortuneLocal } from "../lib/offlineEngine";
import {englishDailyFortune} from "../lib/englishReflections";
import {useLanguage} from "../lib/LanguageProvider";

export default function DailyFortune() {
  const {locale}=useLanguage();
  const en=locale==="en";
  const [month,setMonth] = useState("");
  const [day,setDay] = useState("");
  const [result,setResult] = useState<ReturnType<typeof getDailyFortuneLocal>|null>(null);
  const [error,setError] = useState("");
  const calculate=()=>{
    try{setResult(en?englishDailyFortune(Number(month),Number(day)):getDailyFortuneLocal(Number(month),Number(day)));setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Огноогоо шалгана уу.");setResult(null);}
  };
  return (
    <section className="mx-auto max-w-2xl px-3">
      <header className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-pine">Daily reflection</p>
        <h2 className="mt-3 font-serif text-4xl text-ink">{en?"Daily reflection":"Өдрийн эргэцүүлэл"}</h2>
        <p className="mt-3 text-sm text-muted">{en?"A changing symbolic theme each day, offered as a journal prompt.":"Өдөр бүр өөрчлөгдөх бэлгэдлийн санаа, танд зориулсан тэмдэглэл."}</p>
      </header>
      <div className="rounded-2xl border border-rule bg-sheet p-6 sm:p-9">
        <p className="mb-4 text-sm font-medium text-ink">{en?"Your birth month and day":"Төрсөн сар, өдөр"}</p>
        <div className="grid grid-cols-2 gap-3">
          <select aria-label={en?"Birth month":"Төрсөн сар"} value={month} onChange={(event)=>setMonth(event.target.value)}
            className="rounded-lg border border-rule bg-paper p-3 text-ink">
            <option value="">{en?"Month":"Сар"}</option>
            {Array.from({length:12},(_,index)=>index+1).map((item)=><option key={item} value={item}>{en?"Month "+item:item+"-р сар"}</option>)}
          </select>
          <select aria-label={en?"Birth day":"Төрсөн өдөр"} value={day} onChange={(event)=>setDay(event.target.value)}
            className="rounded-lg border border-rule bg-paper p-3 text-ink">
            <option value="">{en?"Day":"Өдөр"}</option>
            {Array.from({length:31},(_,index)=>index+1).map((item)=><option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button type="button" onClick={calculate} className="mt-6 w-full rounded-full bg-pine px-6 py-3 font-semibold text-on-pine hover:bg-deep">
          {en?"Explore today's theme":"Өнөөдрийн санаа"}
        </button>
        {error&&<p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
        {result&&(
          <div className="mt-8 space-y-5">
            <pre className="whitespace-pre-wrap rounded-xl bg-sheet p-5 font-sans text-sm leading-7 text-ink">{result.fortune}</pre>
            <div className="grid gap-3 text-center text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-rule p-4"><p className="mb-2 text-pine">{en?"Symbolic numbers":"Бэлгэдлийн тоо"}</p>{result.luckyNumbers.join(" · ")}</div>
              <div className="rounded-xl border border-rule p-4"><p className="mb-2 text-pine">{en?"Colors":"Өнгө"}</p>{result.luckyColors.join(", ")}</div>
              <div className="rounded-xl border border-rule p-4"><p className="mb-2 text-pine">{en?"Directions":"Чиглэл"}</p>{result.luckyDirections.join(", ")}</div>
            </div>
          </div>
        )}
        <p className="mt-6 text-xs text-muted">{en?"The numbers, colors and directions are just playful symbolism, not measures of luck or future events.":"Өдрийн тоо, өнгө, чиглэл нь зугаатай бэлгэдэл бөгөөд бодит аз эсвэл үйл явдлыг таамаглахгүй."}</p>
      </div>
    </section>
  );
}
