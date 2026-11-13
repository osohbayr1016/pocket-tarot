"use client";

import { useState } from "react";
import type { TarotCard as TarotCardType } from "../data/tarotCards";
import { interpretReading, type DrawnCard } from "../lib/offlineEngine";
import TarotCard from "./TarotCard";
import { addReading } from "../lib/readingHistory";
import {useLocalDraft} from "../lib/useLocalDraft";

interface Props {
  card: TarotCardType;
  isReversed?: boolean;
  onReset: () => void;
  user?: unknown;
  onLogin?: (token: string, user: unknown) => void;
  userQuestion?: string;
}
export default function CardReading({card,isReversed=false,onReset,userQuestion=""}:Props) {
  const draft=useLocalDraft("single-"+card.id+"-"+(isReversed?"reversed":"upright"));
  const [saved,setSaved]=useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const drawn: DrawnCard[] = [{
    card, position:1, isReversed,
    positionName:"Одоогийн сэдэв",
    positionDescription:"Энэ картаас өөрт хамаатай сэдвийг эргэцүүл",
  }];
  const reading = interpretReading(drawn,userQuestion);
  const save = () => {
    if(!draft.ready || saved)return;
    try {
      addReading({
        id:crypto.randomUUID(),date:new Date().toISOString(),
        spread:"Нэг карт",question:userQuestion.trim().slice(0,500),
        reading,notes:draft.text.trim().slice(0,2000),cards:[{id:card.id,reversed:isReversed,position:1}],
      });
      setSaved(true);
      draft.clear();
      setMessage("Уншилтыг зөвхөн энэ төхөөрөмж дээр хадгаллаа.");
      setError("");
    } catch {
      setError("Уншилтыг хадгалах боломжгүй байна. Browser-ийн зөвшөөрөл, сул зайг шалгана уу.");
    }
  };
  const reset=()=>{
    if(draft.text.trim()&&!saved && !window.confirm("Тэмдэглэл тань түр хадгалагдсан. Энэ картыг орхиж, түр тэмдэглэлийг арилгах уу?"))return;
    draft.clear();onReset();
  };
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-amber-300/20 bg-[#1d182f] p-5 text-center sm:p-9">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-amber-300">Нэг картын уншилт</p>
      <TarotCard card={card} isRevealed size="lg" isReversed={isReversed}/>
      <h2 className="mt-8 font-serif text-2xl text-amber-100">Эргэцүүлэх тайлал</h2>
      <pre className="mt-4 whitespace-pre-wrap break-words text-left font-sans text-sm leading-7 text-slate-200">{reading}</pre>
      <label htmlFor="single-card-notes" className="mt-7 block text-left text-sm font-semibold text-amber-100">Хувийн тэмдэглэл</label>
      <textarea id="single-card-notes" value={draft.text} disabled={!draft.ready} onChange={(event)=>{draft.setText(event.target.value);setSaved(false);setMessage("");}}
        maxLength={2000} rows={3} placeholder="Танд ямар бодол төрөв?"
        className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
      <p className="mt-2 text-left text-xs text-slate-400">Таны бичсэн тэмдэглэл төхөөрөмж дээр автоматаар түр хадгалагдана.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={save} disabled={!draft.ready||saved} type="button" className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          Хадгалах
        </button>
        <button onClick={reset} type="button" className="rounded-full border border-white/30 px-6 py-3 text-sm text-white hover:border-amber-300">
          Өөр карт сонгох
        </button>
      </div>
      {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      {draft.error && <p role="alert" className="mt-3 text-sm text-red-300">{draft.error}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </section>
  );
}
