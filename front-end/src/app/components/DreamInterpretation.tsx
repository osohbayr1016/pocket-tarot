"use client";
import { useState } from "react";
import { interpretDreamLocal } from "../lib/offlineEngine";
export default function DreamInterpretation(){
  const [dream,setDream]=useState("");
  const [result,setResult]=useState("");
  const [error,setError]=useState("");
  const interpret=()=>{
    try{setResult(interpretDreamLocal(dream));setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Зүүдээ бичнэ үү.");setResult("");}
  };
  return <section className="mx-auto max-w-2xl px-3">
    <header className="mb-9 text-center"><p className="text-xs uppercase tracking-[0.25em] text-amber-300">Dream journal</p>
      <h2 className="mt-3 font-serif text-4xl text-amber-50">Зүүдний тэмдэглэл</h2>
      <p className="mt-3 text-sm text-slate-300">Түгээмэл бэлгэдлийг өөрийн мэдрэмжтэй харьцуулан эргэцүүлэх, офлайн туслах.</p>
    </header>
    <div className="rounded-2xl border border-amber-300/20 bg-[#201b33] p-6 sm:p-9">
      <label htmlFor="dream-text" className="mb-3 block text-sm font-medium text-amber-100">Санаж байгаа зүүдээ бичнэ үү</label>
      <textarea id="dream-text" value={dream} onChange={(event)=>setDream(event.target.value)}
        maxLength={3000} rows={7} placeholder="Зүүдэнд ямар үйл явдал болсон бэ? Та юу мэдэрсэн бэ?"
        className="w-full resize-y rounded-lg border border-white/20 bg-white/5 p-4 text-sm leading-6 text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
      <button type="button" onClick={interpret} className="mt-5 w-full rounded-full bg-amber-300 px-6 py-3 font-semibold text-[#171127] hover:bg-amber-200">Бэлгэдлийг тайлбарлах</button>
      {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {result&&<pre className="mt-6 whitespace-pre-wrap rounded-xl bg-white/5 p-5 font-sans text-sm leading-7 text-slate-100">{result}</pre>}
      <p className="mt-6 text-xs text-slate-400">Энэ нь NLP/AI биш, ил тод түлхүүр үгийн сан ашигладаг. Зүүдний тайлал нь эмнэлзүйн онош биш.</p>
    </div>
  </section>;
}
