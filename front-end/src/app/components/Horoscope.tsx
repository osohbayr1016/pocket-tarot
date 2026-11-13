"use client";
import { useState } from "react";
import { getHoroscopeLocal, zodiacFromISODate, zodiacSigns } from "../lib/offlineEngine";
import {englishHoroscope,englishZodiacName} from "../lib/englishReflections";
import {useLanguage} from "../lib/LanguageProvider";

export default function Horoscope() {
  const {locale}=useLanguage();
  const en=locale==="en";
  const [birthDate,setBirthDate] = useState("");
  const [selectedSign,setSelectedSign] = useState("");
  const [text,setText] = useState("");
  const [error,setError] = useState("");
  const derived = birthDate ? zodiacFromISODate(birthDate) : null;
  const active = birthDate ? derived?.id || "" : selectedSign;
  const calculate = () => {
    try {
      if (!active) throw new Error(en?"Choose a birth date or zodiac sign.":"Төрсөн огноо эсвэл ордоо сонгоно уу.");
      setText(en?englishHoroscope(active,birthDate):getHoroscopeLocal(active,birthDate));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : en?"Please check the date.":"Огноог шалгана уу.");setText("");
    }
  };
  return (
    <section className="mx-auto max-w-4xl px-3">
      <header className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Western tropical zodiac</p>
        <h2 className="mt-3 font-serif text-4xl text-amber-50">{en?"Zodiac symbolism":"Ордны бэлгэдэл"}</h2>
        <p className="mt-3 text-sm text-slate-300">{en?"Find your conventional sun sign by birth date and explore its symbolic themes offline.":"12 ордыг төрсөн огноогоор тооцоолж, уламжлалт тайлбарыг интернэтгүй харуулна."}</p>
      </header>
      <div className="rounded-2xl border border-amber-300/20 bg-[#201b33] p-5 sm:p-8">
        <label htmlFor="horoscope-birth-date" className="block text-sm font-medium text-amber-100">
          Төрсөн огноо (огноо оруулбал ордыг автоматаар олно)
        </label>
        <input id="horoscope-birth-date" type="date" value={birthDate}
          onChange={(event)=>{setBirthDate(event.target.value);setText("");setError("");}}
          className="mt-3 w-full rounded-lg border border-white/20 bg-[#121122] p-3 text-white focus:border-amber-300 focus:outline-none sm:w-72"/>
        {derived && <p className="mt-3 text-sm text-amber-200">{en?"Your sun sign: ":"Таны нарны орд: "}{en?englishZodiacName(derived.id):derived.name}</p>}
        <p className="my-5 text-sm text-slate-300">{en?"Or choose a sign":"Эсвэл ордоо сонгоно уу"}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {zodiacSigns.map((sign)=>(
            <button type="button" key={sign.id} disabled={Boolean(birthDate)}
              onClick={()=>{setSelectedSign(sign.id);setText("");setError("");}}
              aria-pressed={active===sign.id}
              className={"min-h-14 rounded-lg border px-2 py-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 " +
                (active===sign.id ? "border-amber-300 bg-amber-300/20 text-amber-100" : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-300/40") +
                (birthDate?" opacity-60":"")}>
              {en?englishZodiacName(sign.id):sign.name}
            </button>
          ))}
        </div>
        <button type="button" onClick={calculate} className="mt-7 w-full rounded-full bg-amber-300 px-6 py-3 font-semibold text-[#171127] hover:bg-amber-200">
          Ордны тайлбар харах
        </button>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        {text && <pre className="mt-7 whitespace-pre-wrap rounded-xl border border-amber-300/15 bg-white/5 p-5 font-sans text-sm leading-7 text-slate-100">{text}</pre>}
        <p className="mt-6 text-xs leading-relaxed text-slate-400">
{en?"Conventional Western sun-sign date boundaries are approximate. They do not use your precise birth time, location or actual planetary coordinates; this is not a natal chart.":
          "Огнооны зааг нь нийтлэг барууны нарны ордын ойролцоо хуваарь. Төрсөн цаг, бүс, тухайн жилийн бодит тэнгэрийн байрлалыг тооцоогүй учир энэ нь natal chart биш."}
        </p>
      </div>
    </section>
  );
}
