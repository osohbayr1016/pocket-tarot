"use client";
import { useState } from "react";
import { interpretDreamLocal } from "../lib/offlineEngine";
import {englishDreamReflection} from "../lib/englishReflections";
import {useLanguage} from "../lib/LanguageProvider";
export default function DreamInterpretation(){
  const {locale}=useLanguage();
  const en=locale==="en";
  const [dream,setDream]=useState("");
  const [result,setResult]=useState("");
  const [error,setError]=useState("");
  const interpret=()=>{
    try{setResult(en?englishDreamReflection(dream):interpretDreamLocal(dream));setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Зүүдээ бичнэ үү.");setResult("");}
  };
  return <section className="mx-auto max-w-2xl px-3">
    <header className="mb-9 text-center"><p className="text-xs uppercase tracking-[0.25em] text-pine">Dream journal</p>
      <h2 className="mt-3 font-serif text-4xl text-ink">{en?"Dream journal":"Зүүдний тэмдэглэл"}</h2>
      <p className="mt-3 text-sm text-muted">{en?"Explore common dream symbols and reflect on your feelings, entirely offline.":"Түгээмэл бэлгэдлийг өөрийн мэдрэмжтэй харьцуулан эргэцүүлэх, офлайн туслах."}</p>
    </header>
    <div className="rounded-2xl border border-rule bg-sheet p-6 sm:p-9">
      <label htmlFor="dream-text" className="mb-3 block text-sm font-medium text-ink">{en?"Write down the dream you remember":"Санаж байгаа зүүдээ бичнэ үү"}</label>
      <textarea id="dream-text" value={dream} onChange={(event)=>setDream(event.target.value)}
        maxLength={3000} rows={7} placeholder={en?"What happened in your dream? How did you feel?":"Зүүдэнд ямар үйл явдал болсон бэ? Та юу мэдэрсэн бэ?"}
        className="w-full resize-y rounded-lg border border-rule bg-sheet p-4 text-sm leading-6 text-ink placeholder:text-muted focus:border-pine focus:outline-none"/>
      <button type="button" onClick={interpret} className="mt-5 w-full rounded-full bg-pine px-6 py-3 font-semibold text-on-pine hover:bg-deep">{en?"Explore symbols":"Бэлгэдлийг тайлбарлах"}</button>
      {error&&<p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      {result&&<pre className="mt-6 whitespace-pre-wrap rounded-xl bg-sheet p-5 font-sans text-sm leading-7 text-ink">{result}</pre>}
      <p className="mt-6 text-xs text-muted">{en?"This is a transparent keyword dictionary, not AI or NLP. Dream symbolism is not a clinical diagnosis.":"Энэ нь NLP/AI биш, ил тод түлхүүр үгийн сан ашигладаг. Зүүдний тайлал нь эмнэлзүйн онош биш."}</p>
    </div>
  </section>;
}
