"use client";

import { useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { tarotSpreads, type TarotSpread } from "../data/tarotSpreads";
import { drawSpread, interpretReading, type DrawnCard } from "../lib/offlineEngine";
import TarotCard from "./TarotCard";

interface Props {
  onReset: () => void;
  user?: unknown;
  onLogin?: (token: string, user: unknown) => void;
  userQuestion?: string;
}
const HISTORY_KEY = "pocket-tarot-offline-readings-v1";

export default function TraditionalTarotReading({ onReset, userQuestion = "" }: Props) {
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const [question, setQuestion] = useState(userQuestion);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [notes, setNotes] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{id:string; date:string; spread:string; question:string; reading:string}[]>([]);
  const result = interpretReading(drawn, question);

  const refreshHistory = () => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 20));
    } catch {
      setHistory([]);
    }
  };
  const chooseSpread = (next: TarotSpread) => {
    setSpread(next); setDrawn([]); setVisibleCount(0); setError(""); setSavedMessage("");
    refreshHistory();
  };
  const makeReading = () => {
    if (!spread) return;
    try {
      const cards = drawSpread(tarotCards, spread);
      setDrawn(cards);
      setVisibleCount(0);
      setError(""); setSavedMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Карт холих үед алдаа гарлаа.");
    }
  };
  const save = () => {
    if (!spread || !drawn.length || visibleCount !== drawn.length) return;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const old = Array.isArray(parsed) ? parsed : [];
      const record = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        spread: spread.name,
        question: question.trim().slice(0, 500),
        reading: result,
        notes: notes.trim().slice(0, 2000),
        cards: drawn.map((entry) => ({id:entry.card.id,reversed:entry.isReversed,position:entry.position})),
      };
      localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...old].slice(0, 30)));
      setSavedMessage("Энэ төхөөрөмж дээр уншилтыг хадгаллаа.");
      refreshHistory();
    } catch {
      setError("Төхөөрөмжийн хадгалах эрх эсвэл зай хүрэлцэхгүй байна.");
    }
  };
  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
      setSavedMessage("Энэ төхөөрөмж дээрх хадгалсан уншилтуудыг арилгалаа.");
    } catch {
      setError("Хадгалсан уншилтыг арилгаж чадсангүй.");
    }
  };
  const startAgain = () => {
    setSpread(null);setDrawn([]);setVisibleCount(0);setError("");setSavedMessage("");setNotes("");
  };
  return (
    <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">THE ART OF REFLECTION</p>
        <h2 className="font-serif text-4xl font-medium tracking-tight text-amber-50 sm:text-5xl">Уламжлалт таро</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
          78 хөзрөөс уламжлалт байрлалаар санамсаргүй сонгож, бэлгэдлийг нь тайлбарлана.
          AI, төлбөртэй API, сервер шаардлагагүй.
        </p>
      </header>
      {!spread && (
        <div className="mx-auto max-w-4xl">
          <label htmlFor="tarot-question" className="mb-3 block text-sm font-medium text-amber-100">
            Эргэцүүлэх асуулт (заавал биш)
          </label>
          <textarea
            id="tarot-question" value={question} onChange={(event) => setQuestion(event.target.value)}
            maxLength={500} rows={3}
            placeholder="Жишээ: Энэ долоо хоногт ямар зүйлд анхаарах хэрэгтэй вэ?"
            className="mb-8 w-full resize-y rounded-xl border border-amber-300/20 bg-white/5 p-4 text-base text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tarotSpreads.map((option) => (
              <button type="button" key={option.id} onClick={() => chooseSpread(option)}
                className="group rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#241b38] to-[#141326] p-6 text-left shadow-xl transition-colors hover:border-amber-300/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl font-serif text-amber-300" aria-hidden="true">✧</span>
                  <span className="rounded-full border border-amber-300/30 px-3 py-1 text-xs text-amber-100">
                    {option.cardCount} карт
                  </span>
                </div>
                <h3 className="font-serif text-xl text-amber-50">{option.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{option.description}</p>
                <span className="mt-5 block text-xs uppercase tracking-wider text-amber-300 group-hover:text-amber-100">
                  Сонгох
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {spread && (
        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-300">{spread.cardCount} картын дэлгэмэл</p>
              <h3 className="mt-2 font-serif text-3xl text-amber-50">{spread.name}</h3>
              {question.trim() && <p className="mt-2 max-w-xl text-sm text-slate-300">Асуулт: {question.trim()}</p>}
            </div>
            <button type="button" onClick={startAgain}
              className="rounded-full border border-white/25 px-5 py-2 text-sm text-white transition-colors hover:border-amber-300">
              Дэлгэмэл солих
            </button>
          </div>
          {drawn.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-amber-300/20 bg-[#1c1830] px-8 py-12 text-center">
              <p className="text-5xl text-amber-300" aria-hidden="true">✦</p>
              <p className="my-5 text-sm leading-relaxed text-slate-200">
                Картуудыг жигд холиж, давхардалгүй сугална. Эгц эсвэл урвуу байрлалыг тусад нь санамсаргүй сонгоно.
              </p>
              <button type="button" onClick={makeReading}
                className="w-full rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#161024] transition-colors hover:bg-amber-200">
                Хольж, хөзөр сугалах
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <span>{visibleCount} / {drawn.length} карт нээсэн</span>
                {visibleCount < drawn.length && (
                  <button type="button" onClick={() => setVisibleCount((current)=>Math.min(current+1,drawn.length))}
                    className="rounded-full bg-amber-300 px-6 py-3 font-medium text-[#161024] hover:bg-amber-200">
                    Дараагийн картыг нээх
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {drawn.map((item,index) => (
                  <div key={item.position} className="min-w-0 rounded-xl border border-white/10 bg-[#211b32] p-3">
                    <div className="flex justify-center">
                      <TarotCard card={item.card} size="sm" isRevealed={index < visibleCount}
                        isReversed={item.isReversed} userQuestion={index < visibleCount ? undefined : ""}
                        onClick={index === visibleCount ? () => setVisibleCount((current)=>Math.min(current+1, drawn.length)) : undefined} />
                    </div>
                    <p className="mt-4 text-center text-sm font-semibold text-amber-100">{item.position}. {item.positionName}</p>
                    <p className="mt-2 text-center text-xs leading-relaxed text-slate-300">{item.positionDescription}</p>
                  </div>
                ))}
              </div>
              {visibleCount === drawn.length && (
                <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-amber-300/25 bg-gradient-to-b from-[#27203d] to-[#151224] p-6 sm:p-9">
                  <h4 className="font-serif text-2xl text-amber-100">Таны уншилтын тайлал</h4>
                  <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-100">{result}</pre>
                  <label className="mt-8 block text-sm font-medium text-amber-100" htmlFor="reading-notes">Хувийн тэмдэглэл</label>
                  <textarea id="reading-notes" value={notes} onChange={(event)=>setNotes(event.target.value)}
                    maxLength={2000} rows={3} placeholder="Өөрийн бодож мэдэрсэн зүйлээ энд бич..."
                    className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={save}
                      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#161024] hover:bg-amber-200">
                      Төхөөрөмж дээр хадгалах
                    </button>
                    <button type="button" onClick={makeReading}
                      className="rounded-full border border-white/30 px-6 py-3 text-sm text-white hover:border-amber-300">
                      Дахин холих
                    </button>
                  </div>
                  {savedMessage && <p role="status" className="mt-4 text-sm text-emerald-200">{savedMessage}</p>}
                </div>
              )}
            </>
          )}
          {error && <p role="alert" className="mt-6 text-center text-red-300">{error}</p>}
          {history.length > 0 && (
            <details className="mx-auto mt-10 max-w-3xl rounded-xl border border-white/10 p-5 text-sm text-slate-200">
              <summary className="cursor-pointer text-amber-200">Өмнөх уншилтууд ({history.length})</summary>
              <ul className="mt-4 space-y-3">
                {history.map((entry) => <li key={entry.id} className="border-t border-white/10 py-3">
                  <p className="font-medium text-amber-100">{entry.spread}</p>
                  <p className="text-slate-300">{entry.question || "Асуулт оруулаагүй"}</p>
                  <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString("mn-MN")}</p>
                </li>)}
              </ul>
              <button type="button" onClick={clearHistory} className="mt-4 rounded-full border border-red-300/50 px-4 py-2 text-xs text-red-200 hover:bg-red-400/10">Энэ төхөөрөмжөөс түүхийг арилгах</button>
            </details>
          )}
        </div>
      )}
      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-slate-400">
        Таро, зурхай нь шинжлэх ухааны баталгаатай ирээдүй таамаглах арга биш. Энэ бүтээгдэхүүн нь соёлын
        бэлгэдэл болон өөрийгөө эргэцүүлэх зорилготой. Эрүүл мэнд, мөнгө, хууль зэрэг чухал
        шийдвэрийг зөвхөн картын тайлалд тулгуурлан бүү гарга.
      </p>
    </section>
  );
}
