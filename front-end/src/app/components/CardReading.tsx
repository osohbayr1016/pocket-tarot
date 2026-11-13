"use client";

import { useState } from "react";
import type { TarotCard as TarotCardType } from "../data/tarotCards";
import { interpretReading, type DrawnCard } from "../lib/offlineEngine";
import TarotCard from "./TarotCard";
import { addReading } from "../lib/readingHistory";

interface Props {
  card: TarotCardType;
  isReversed?: boolean;
  onReset: () => void;
  user?: unknown;
  onLogin?: (token: string, user: unknown) => void;
  userQuestion?: string;
}
export default function CardReading({card,isReversed=false,onReset,userQuestion=""}:Props) {
  const [notes,setNotes] = useState("");
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const drawn: DrawnCard[] = [{
    card, position:1, isReversed,
    positionName:"Одоогийн сэдэв",
    positionDescription:"Энэ картаас өөрт хамаатай сэдвийг эргэцүүл",
  }];
  const reading = interpretReading(drawn,userQuestion);
  const save = () => {
    try {
      addReading({
        id:crypto.randomUUID(),date:new Date().toISOString(),
        spread:"Нэг карт",question:userQuestion.trim().slice(0,500),
        reading,notes:notes.trim().slice(0,2000),cards:[{id:card.id,reversed:isReversed,position:1}],
      });
      setMessage("Уншилтыг зөвхөн энэ төхөөрөмж дээр хадгаллаа.");
      setError("");
    } catch {
      setError("Уншилтыг хадгалах боломжгүй байна. Browser-ийн зөвшөөрөл, сул зайг шалгана уу.");
    }
  };
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-amber-300/20 bg-[#1d182f] p-5 text-center sm:p-9">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-amber-300">Нэг картын уншилт</p>
      <TarotCard card={card} isRevealed size="lg" isReversed={isReversed}/>
      <h2 className="mt-8 font-serif text-2xl text-amber-100">Эргэцүүлэх тайлал</h2>
      <pre className="mt-4 whitespace-pre-wrap break-words text-left font-sans text-sm leading-7 text-slate-200">{reading}</pre>
      <label htmlFor="single-card-notes" className="mt-7 block text-left text-sm font-semibold text-amber-100">Хувийн тэмдэглэл</label>
      <textarea id="single-card-notes" value={notes} onChange={(event)=>setNotes(event.target.value)}
        maxLength={2000} rows={3} placeholder="Танд ямар бодол төрөв?"
        className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={save} type="button" className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          Хадгалах
        </button>
        <button onClick={onReset} type="button" className="rounded-full border border-white/30 px-6 py-3 text-sm text-white hover:border-amber-300">
          Өөр карт сонгох
        </button>
      </div>
      {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </section>
  );
}
