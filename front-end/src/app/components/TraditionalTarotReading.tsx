"use client";
import type { ReadingTopic } from "../lib/readingIntelligence";
import { loadReadings, addReading, clearReadings } from "../lib/readingHistory";

import { useEffect, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { tarotSpreads, type TarotSpread } from "../data/tarotSpreads";
import { drawSpread, interpretReading, type DrawnCard } from "../lib/offlineEngine";
import TarotCard from "./TarotCard";
import { makeCustomSpread } from "../lib/customSpread";
import {loadSavedSpreads,saveCustomSpread,deleteCustomSpread,savedToSpread,type SavedSpread} from "../lib/savedCustomSpreads";

interface Props {
  onReset: () => void;
  user?: unknown;
  onLogin?: (token: string, user: unknown) => void;
  userQuestion?: string;
}

export default function TraditionalTarotReading({ onReset, userQuestion = "" }: Props) {
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const [question, setQuestion] = useState(userQuestion);
  const [customCount,setCustomCount] = useState(3);
  const [customName,setCustomName] = useState("Миний дэлгэмэл");
  const [savedSpreads,setSavedSpreads] = useState<SavedSpread[]>([]);
  const [templateMessage,setTemplateMessage] = useState("");
  const [customLabels,setCustomLabels] = useState<string[]>([]);
  const [topic,setTopic] = useState<ReadingTopic|"auto">("auto");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [notes, setNotes] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{id:string; date:string; spread:string; question:string; reading:string}[]>([]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      try{setSavedSpreads(loadSavedSpreads());}
      catch(cause){setError(cause instanceof Error?cause.message:"Хадгалсан дэлгэмлийг уншиж чадсангүй.");}
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  const saveTemplate=()=>{
    try{
      const labels=makeCustomSpread(customCount,customLabels).positions.map(p=>p.name);
      setSavedSpreads(saveCustomSpread(customName.trim(),labels));
      setTemplateMessage("Дэлгэмлийг энэ төхөөрөмж дээр хадгаллаа.");
      setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Дэлгэмлийг хадгалж чадсангүй.");}
  };
  const result = interpretReading(drawn, question, topic === "auto" ? undefined : topic);

  const refreshHistory = () => {
    try{setHistory(loadReadings().slice(0,20));}
    catch(cause){setError(cause instanceof Error?cause.message:"Уншилтын түүхийг уншиж чадсангүй.");}
  };
  const chooseSpread = (next: TarotSpread) => {
    setSpread(next); setDrawn([]); setVisibleCount(0); setError(""); setSavedMessage(""); setNotes("");
    refreshHistory();
  };
  const makeReading = () => {
    if (!spread) return;
    try {
      const cards = drawSpread(tarotCards, spread);
      setDrawn(cards);
      setVisibleCount(0);
      setNotes("");
      setError(""); setSavedMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Карт холих үед алдаа гарлаа.");
    }
  };
  const save = () => {
    if (!spread || !drawn.length || visibleCount !== drawn.length) return;
    try {
      addReading({
        id:crypto.randomUUID(),
        date:new Date().toISOString(),
        spread:spread.name,
        question:question.trim().slice(0,500),
        reading:result,
        notes:notes.trim().slice(0,2000),
        cards:drawn.map(entry=>({id:entry.card.id,reversed:entry.isReversed,position:entry.position})),
      });
      setSavedMessage("Энэ төхөөрөмж дээр уншилтыг хадгаллаа.");
      refreshHistory();
    } catch {
      setError("Төхөөрөмжийн хадгалах эрх эсвэл зай хүрэлцэхгүй байна.");
    }
  };
  const clearHistory = () => {
    if(!window.confirm("БҮХ хадгалсан уншилтаа энэ төхөөрөмжөөс бүрмөсөн устгах уу? Эхлээд JSON backup хийхийг зөвлөе."))return;
    try {
      clearReadings();
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
          <label htmlFor="tarot-topic" className="mb-3 block text-sm font-medium text-amber-100">Асуултын чиглэл</label>
          <select id="tarot-topic" value={topic} onChange={event=>setTopic(event.target.value as ReadingTopic|"auto")}
            className="mb-8 w-full rounded-xl border border-white/20 bg-[#211a34] p-3 text-sm text-white sm:max-w-xs">
            <option value="auto">Автоматаар тодорхойлох</option>
            <option value="general">Ерөнхий</option>
            <option value="love">Хайр, харилцаа</option>
            <option value="career">Ажил, карьер</option>
            <option value="growth">Хувь хүний хөгжил</option>
          </select>
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
          {savedSpreads.length>0&&<section aria-label="Миний хадгалсан дэлгэмлүүд" className="mt-8">
            <h3 className="mb-4 font-serif text-xl text-amber-100">Хадгалсан дэлгэмлүүд</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedSpreads.map(template=>(
                <div key={template.id} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-3">
                  <button type="button" onClick={()=>chooseSpread(savedToSpread(template))}
                    className="min-h-12 flex-1 text-left text-sm text-amber-100 hover:text-white">
                    <span className="block font-medium">{template.name}</span>
                    <span className="block text-xs text-slate-300">{template.labels.length} карт · Сонгож унших</span>
                  </button>
                  <button type="button" aria-label={template.name+" устгах"} onClick={()=>{
                    if(!window.confirm("Энэ хадгалсан дэлгэмлийг устгах уу?"))return;
                    try{setSavedSpreads(deleteCustomSpread(template.id));setTemplateMessage("Дэлгэмэл устлаа.");}
                    catch(cause){setError(cause instanceof Error?cause.message:"Устгаж чадсангүй.");}
                  }} className="rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200">Устгах</button>
                </div>
              ))}
            </div>
          </section>}
          <div className="mt-8 rounded-2xl border border-amber-300/25 bg-[#20192f] p-5 sm:p-7">
            <h3 className="font-serif text-xl text-amber-100">Өөрийн дэлгэмэл үүсгэх</h3>
            <p className="mt-2 text-sm text-slate-300">
              1–12 картын тоо, байрлалын нэрсээ оруул. Интернэт эсвэл AI шаардлагагүй.
            </p>
            <label htmlFor="custom-spread-name" className="mt-5 block text-sm text-amber-100">Дэлгэмлийн нэр</label>
            <input id="custom-spread-name" value={customName} maxLength={60}
              onChange={event=>setCustomName(event.target.value)}
              className="mt-2 w-full max-w-sm rounded-lg border border-white/20 bg-[#120e1f] p-3 text-sm text-white"
              placeholder="Жишээ: Миний долоо хоног"/>
            <label htmlFor="custom-card-count" className="mt-5 block text-sm text-amber-100">Картын тоо</label>
            <select id="custom-card-count" value={customCount}
              onChange={event=>setCustomCount(Number(event.target.value))}
              className="mt-2 rounded-lg border border-white/20 bg-[#120e1f] p-3 text-white">
              {Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} карт</option>)}
            </select>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length:customCount},(_,index)=>(
                <div key={index}>
                  <label htmlFor={"custom-position-"+index} className="mb-1 block text-xs text-amber-100">
                    {index+1}-р байрлал (заавал биш)
                  </label>
                  <input id={"custom-position-"+index} maxLength={60}
                    value={customLabels[index]||""}
                    onChange={event=>setCustomLabels(old=>{
                      const next=[...old];next[index]=event.target.value;return next;
                    })}
                    placeholder={String(index+1)+"-р карт"}
                    className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white focus:border-amber-300 focus:outline-none"/>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveTemplate}
              className="mr-3 mt-6 rounded-full border border-amber-300/40 px-6 py-3 text-sm font-semibold text-amber-100">
              Дэлгэмлийг хадгалах
            </button>
            {templateMessage&&<p role="status" className="mt-3 text-sm text-emerald-200">{templateMessage}</p>}
            <button type="button" onClick={()=>chooseSpread(makeCustomSpread(customCount,customLabels))}
              className="mt-6 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
              Миний дэлгэмлийг эхлүүлэх
            </button>
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
