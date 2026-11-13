"use client";
import type { ReadingTopic } from "../lib/readingIntelligence";
import {listJournal,saveJournalReading,clearJournal} from "../lib/journalDb";

import { useEffect, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { tarotSpreads, type TarotSpread } from "../data/tarotSpreads";
import { drawSpread, interpretReading, type DrawnCard } from "../lib/offlineEngine";
import TarotCard from "./TarotCard";
import CelticCrossBoard from "./CelticCrossBoard";
import { makeCustomSpread } from "../lib/customSpread";
import {getReadingPreferences} from "../lib/readingPreferences";
import {useLocalDraft} from "../lib/useLocalDraft";
import {useLanguage} from "../lib/LanguageProvider";
import {englishReading} from "../lib/englishTarot";
import {englishSpreadName,englishSpreadDescription,englishSpreadPosition} from "../lib/englishSpreads";
import {emitFeedback} from "../lib/feedback";
import {loadActiveReading,saveActiveReading} from "../lib/activeReading";
import {exportReadingSocialPng,type SocialFormat} from "../lib/exportReadingSocialPng";
import {loadSavedSpreads,saveCustomSpread,deleteCustomSpread,savedToSpread,type SavedSpread} from "../lib/savedCustomSpreads";

interface Props {
  onReset: () => void;
  user?: unknown;
  onLogin?: (token: string, user: unknown) => void;
  userQuestion?: string;
}

export default function TraditionalTarotReading({ onReset, userQuestion = "" }: Props) {
  const {locale,t}=useLanguage();
  const en=locale==="en";
  const tr=(mn:string,english:string)=>en?english:mn;
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const questionDraft=useLocalDraft("traditional-question",userQuestion);
  const question=questionDraft.text;
  const setQuestion=questionDraft.setText;
  const [customCount,setCustomCount] = useState(3);
  const [customName,setCustomName] = useState("Миний дэлгэмэл");
  const [savedSpreads,setSavedSpreads] = useState<SavedSpread[]>([]);
  const [templateMessage,setTemplateMessage] = useState("");
  const [customLabels,setCustomLabels] = useState<string[]>([]);
  const [topic,setTopic] = useState<ReadingTopic|"auto">("auto");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [restored,setRestored] = useState(false);
  const notesDraft=useLocalDraft("traditional-notes");
  const notes=notesDraft.text;
  const setNotes=notesDraft.setText;
  const [savedMessage, setSavedMessage] = useState("");
  const [shareMessage,setShareMessage] = useState("");
  const [exporting,setExporting] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{id:string; date:string; spread:string; question:string; reading:string}[]>([]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const previous=loadActiveReading();
      if(previous){
        setSpread(previous.spread);setDrawn(previous.drawn);
        setVisibleCount(previous.visibleCount);setTopic(previous.topic);
      }
      setRestored(true);
    });
    return ()=>cancelAnimationFrame(frame);
  },[]);
  useEffect(()=>{
    if(!restored)return;
    saveActiveReading(spread?{spread,drawn,visibleCount,topic}:null);
  },[restored,spread,drawn,visibleCount,topic]);
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
      setTemplateMessage(tr("Дэлгэмлийг энэ төхөөрөмж дээр хадгаллаа.","Spread template saved on this device."));
      setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Дэлгэмлийг хадгалж чадсангүй.");}
  };
  const result = locale==="en"?englishReading(drawn,question,topic === "auto" ? undefined : topic):interpretReading(drawn, question, topic === "auto" ? undefined : topic);

  const refreshHistory = async () => {
    try{setHistory((await listJournal()).slice(0,20));}
    catch(cause){setError(cause instanceof Error?cause.message:"Уншилтын түүхийг уншиж чадсангүй.");}
  };
  const confirmDiscard=()=>{
    if(notes.trim()&&!savedMessage)
      return window.confirm(tr("Хадгалаагүй тэмдэглэл түр хадгалагдсан. Шинэ уншилт эхлүүлж, энэ тэмдэглэлийг арилгах уу?","This draft contains unsaved notes. Discard it to begin a new reading?"));
    return true;
  };
  const chooseSpread = (next: TarotSpread) => {
    if(!confirmDiscard())return;
    setSpread(next); setDrawn([]); setVisibleCount(0); setError(""); setSavedMessage(""); setNotes("");
    refreshHistory();
  };
  const startQuickReading = (count:1|3 = 3) => {
    if (!confirmDiscard()) return;
    const quick=tarotSpreads.find(option=>option.cardCount===count)??tarotSpreads[0];
    try {
      const cards=drawSpread(tarotCards,quick,undefined,{allowReversed:getReadingPreferences().allowReversed});
      setSpread(quick);setDrawn(cards);setVisibleCount(0);setNotes("");
      setError("");setSavedMessage("");emitFeedback("draw");
    } catch(cause) {
      setError(cause instanceof Error?cause.message:tr("Карт сугалж чадсангүй.","Could not draw cards."));
    }
  };
  const makeReading = () => {
    if (!spread || !confirmDiscard()) return;
    try {
      const cards = drawSpread(tarotCards,spread,undefined,{allowReversed:getReadingPreferences().allowReversed});
      setDrawn(cards);
      emitFeedback("draw");
      setVisibleCount(0);
      setNotes("");
      setError(""); setSavedMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Карт холих үед алдаа гарлаа.");
    }
  };
  const revealNext=()=>{
    if(visibleCount>=drawn.length)return;
    emitFeedback("flip");
    setVisibleCount(current=>Math.min(current+1,drawn.length));
  };
  const save = async () => {
    if (!spread || !drawn.length || visibleCount !== drawn.length || !notesDraft.ready || !questionDraft.ready || savedMessage) return;
    try {
      await saveJournalReading({
        id:crypto.randomUUID(),
        date:new Date().toISOString(),
        spread:spread.name,
        question:question.trim().slice(0,500),
        reading:result,
        notes:notes.trim().slice(0,2000),
        cards:drawn.map(entry=>({id:entry.card.id,reversed:entry.isReversed,position:entry.position})),
      });
      setNotes("");
      setSavedMessage(tr("Энэ төхөөрөмж дээр уншилтыг хадгаллаа.","Reading saved on this device."));
      refreshHistory();
    } catch {
      setError("Төхөөрөмжийн хадгалах эрх эсвэл зай хүрэлцэхгүй байна.");
    }
  };
  const shareReading=async(format:SocialFormat)=>{
    if(!spread||drawn.length===0||visibleCount!==drawn.length||exporting)return;
    setExporting(true);setShareMessage("");
    try{
      await exportReadingSocialPng({
        id:crypto.randomUUID(),date:new Date().toISOString(),
        spread:spread.name,question:"",reading:result,notes:"",
        cards:drawn.map(entry=>({id:entry.card.id,reversed:entry.isReversed,position:entry.position})),
      },tarotCards,format);
      setShareMessage(tr("Хувийн асуулт, тэмдэглэл ороогүй зураг татагдлаа.","Image downloaded without private questions or notes."));
      setError("");
    }catch(cause){
      setError(cause instanceof Error?cause.message:tr("Share зураг үүсгэж чадсангүй.","Could not export the image."));
    }finally{setExporting(false);}
  };
  const clearHistory = async () => {
    if(!window.confirm(tr("БҮХ хадгалсан уншилтаа энэ төхөөрөмжөөс бүрмөсөн устгах уу? Эхлээд JSON backup хийхийг зөвлөе.","Permanently delete ALL readings from this device? Export a backup first.")))return;
    try {
      await clearJournal();
      setHistory([]);
      setSavedMessage(tr("Энэ төхөөрөмж дээрх хадгалсан уншилтуудыг арилгалаа.","Journal cleared on this device."));
    } catch {
      setError("Хадгалсан уншилтыг арилгаж чадсангүй.");
    }
  };
  const startAgain = () => {
    if(!confirmDiscard())return;
    setSpread(null);setDrawn([]);setVisibleCount(0);setError("");setSavedMessage("");setNotes("");
  };
  return (
    <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">THE ART OF REFLECTION</p>
        <h2 className="font-serif text-4xl font-medium tracking-tight text-amber-50 sm:text-5xl">{t("Уламжлалт таро")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
          {tr("78 хөзрөөс уламжлалт байрлалаар санамсаргүй сонгож, бэлгэдлийг нь тайлбарлана. AI, төлбөртэй API, сервер шаардлагагүй.","Draw from 78 cards in a traditional spread, then reflect on their symbolism. No AI, paid API or backend is needed.")}
        </p>
      </header>
      <details className="mx-auto mb-5 max-w-4xl">
        <summary className="min-h-11 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-amber-100 hover:border-amber-300/40">
          {tr("Анхны удаа ашиглаж байна уу? 3 алхамтай заавар","New to Tarot? See the three steps")}
        </summary>
      <section aria-label={tr("Анхны уншилтын алхам","First reading steps")} className="mt-3 rounded-2xl border border-amber-300/20 bg-white/5 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-amber-100">{tr("Анх удаа ашиглаж байна уу?","New to Tarot?")}</h3>
          <span className="text-xs text-slate-300">
            {drawn.length>0&&visibleCount===drawn.length?"3 / 3":spread?"2 / 3":"1 / 3"} {tr("алхам","steps")}
          </span>
        </div>
        <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          {[
            ["1",tr("Асуултаа бодож, дэлгэмэл сонгох","Choose a question and spread"),!spread],
            ["2",tr("Картаа сугалж нэг нэгээр нь нээх","Draw cards, then reveal them one at a time"),!!spread&&(drawn.length===0||visibleCount<drawn.length)],
            ["3",tr("Тайлбараа уншаад тэмдэглэл хадгалах","Read your reflection and save notes"),drawn.length>0&&visibleCount===drawn.length]
          ].map(([number,label,active])=>(
            <li key={String(number)} aria-current={active?"step":undefined}
              className={"flex gap-3 rounded-xl border p-3 leading-6 "+
                (active?"border-amber-300/50 bg-amber-300/10 text-amber-100":"border-white/10 text-slate-300")}>
              <span aria-hidden="true" className="font-semibold text-amber-300">{number}.</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          {(locale==="en"?"This is a symbolic reflection exercise, not a reliable prediction of future events.":"Энэ нь өөрийн нөхцөлөө эргэцүүлэх бэлгэдлийн дасгал болохоос баталгаатай ирээдүйг хэлдэггүй.")}
        </p>
      </section>
      </details>
      {!spread && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 rounded-2xl border border-amber-300/35 bg-gradient-to-r from-[#31213f] to-[#20182d] p-5 sm:p-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{tr("Хурдан эхлэх","Quick start")}</p>
            <h3 className="font-serif text-2xl text-amber-50">{tr("3 картаар эхэл","Start with three cards")}</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">{tr("Асуултаа бичих эсвэл алгасаад шууд картаа сугал. Нарийн тохиргоо шаардлагагүй.","Write a question or skip it. Draw a simple spread without advanced setup.")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={()=>startQuickReading(1)}
                className="min-h-12 flex-1 rounded-full border border-amber-300/50 px-5 py-3 font-semibold text-amber-100 hover:bg-amber-300/10 sm:flex-none">
                {tr("1 карт сугалах","Draw one card")}
              </button>
              <button type="button" onClick={()=>startQuickReading(3)}
                className="min-h-12 flex-1 rounded-full bg-amber-300 px-6 py-3 font-semibold text-[#171127] hover:bg-amber-200 sm:flex-none">
                {tr("3 карт сугалах","Draw three cards")}
              </button>
            </div>
          </div>
          <label htmlFor="tarot-question" className="mb-3 block text-sm font-medium text-amber-100">
            {(locale==="en"?"Reflection question (optional)":"Эргэцүүлэх асуулт (заавал биш)")}
          </label>
          <textarea
            id="tarot-question" value={question} onChange={(event) => setQuestion(event.target.value)}
            maxLength={500} rows={3}
            placeholder={tr("Жишээ: Энэ долоо хоногт ямар зүйлд анхаарах хэрэгтэй вэ?","Example: What should I focus on this week?")}
            className="mb-8 w-full resize-y rounded-xl border border-amber-300/20 bg-white/5 p-4 text-base text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
          />
          <label htmlFor="tarot-topic" className="mb-3 block text-sm font-medium text-amber-100">{tr("Асуултын чиглэл","Question topic")}</label>
          <select id="tarot-topic" value={topic} onChange={event=>setTopic(event.target.value as ReadingTopic|"auto")}
            className="mb-8 w-full rounded-xl border border-white/20 bg-[#211a34] p-3 text-sm text-white sm:max-w-xs">
            <option value="auto">{tr("Автоматаар тодорхойлох","Auto-detect")}</option>
            <option value="general">{tr("Ерөнхий","General")}</option>
            <option value="love">{tr("Хайр, харилцаа","Love & relationships")}</option>
            <option value="career">{tr("Ажил, карьер","Work & career")}</option>
            <option value="growth">{tr("Хувь хүний хөгжил","Personal growth")}</option>
          </select>
          <h3 className="mb-4 font-serif text-lg text-amber-100">{tr("Бусад дэлгэмэлүүд","Other spreads")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tarotSpreads.map((option) => (
              <button type="button" key={option.id} onClick={() => chooseSpread(option)}
                className="group rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#241b38] to-[#141326] p-6 text-left shadow-xl transition-colors hover:border-amber-300/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl font-serif text-amber-300" aria-hidden="true">✧</span>
                  <span className="rounded-full border border-amber-300/30 px-3 py-1 text-xs text-amber-100">
                    {option.cardCount} {tr("карт","cards")}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-amber-50">{en?englishSpreadName(option):option.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{en?englishSpreadDescription(option):option.description}</p>
                <span className="mt-5 block text-xs uppercase tracking-wider text-amber-300 group-hover:text-amber-100">
                  {(locale==="en"?"Select":"Сонгох")}
                </span>
              </button>
            ))}
          </div>
          {savedSpreads.length>0&&<section aria-label={tr("Миний хадгалсан дэлгэмлүүд","My saved spreads")} className="mt-8">
            <h3 className="mb-4 font-serif text-xl text-amber-100">{tr("Хадгалсан дэлгэмлүүд","Saved spreads")}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedSpreads.map(template=>(
                <div key={template.id} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-3">
                  <button type="button" onClick={()=>chooseSpread(savedToSpread(template))}
                    className="min-h-12 flex-1 text-left text-sm text-amber-100 hover:text-white">
                    <span className="block font-medium">{template.name}</span>
                    <span className="block text-xs text-slate-300">{template.labels.length} {tr("карт · Сонгож унших","cards · Select to read")}</span>
                  </button>
                  <button type="button" aria-label={template.name+(en?" delete":" устгах")} onClick={()=>{
                    if(!window.confirm(tr("Энэ хадгалсан дэлгэмлийг устгах уу?","Delete this saved spread?")))return;
                    try{setSavedSpreads(deleteCustomSpread(template.id));setTemplateMessage(tr("Дэлгэмэл устлаа.","Spread deleted."));}
                    catch(cause){setError(cause instanceof Error?cause.message:"Устгаж чадсангүй.");}
                  }} className="rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200">{tr("Устгах","Delete")}</button>
                </div>
              ))}
            </div>
          </section>}
          <details id="custom-spread-builder" className="group mt-8">
            <summary className="min-h-12 cursor-pointer rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold text-amber-100 hover:border-amber-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
              {tr("Нарийвчилсан тохиргоо · Өөрийн дэлгэмэл","Advanced · Create a custom spread")}
            </summary>
            <div className="mt-3 rounded-2xl border border-amber-300/25 bg-[#20192f] p-5 sm:p-7">
            <h3 className="font-serif text-xl text-amber-100">{tr("Өөрийн дэлгэмэл үүсгэх","Create your own spread")}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {(locale==="en"?"Set 1–12 cards and optionally name each position. Works without an AI service or the internet.":"1–12 картын тоо, байрлалын нэрсээ оруул. Интернэт эсвэл AI шаардлагагүй.")}
            </p>
            <label htmlFor="custom-spread-name" className="mt-5 block text-sm text-amber-100">{tr("Дэлгэмлийн нэр","Spread name")}</label>
            <input id="custom-spread-name" value={customName} maxLength={60}
              onChange={event=>setCustomName(event.target.value)}
              className="mt-2 w-full max-w-sm rounded-lg border border-white/20 bg-[#120e1f] p-3 text-sm text-white"
              placeholder={tr("Жишээ: Миний долоо хоног","Example: My week")}/>
            <label htmlFor="custom-card-count" className="mt-5 block text-sm text-amber-100">{tr("Картын тоо","Number of cards")}</label>
            <select id="custom-card-count" value={customCount}
              onChange={event=>setCustomCount(Number(event.target.value))}
              className="mt-2 rounded-lg border border-white/20 bg-[#120e1f] p-3 text-white">
              {Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} {tr("карт","cards")}</option>)}
            </select>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length:customCount},(_,index)=>(
                <div key={index}>
                  <label htmlFor={"custom-position-"+index} className="mb-1 block text-xs text-amber-100">
                    {index+1}{tr("-р байрлал (заавал биш)"," position (optional)")}
                  </label>
                  <input id={"custom-position-"+index} maxLength={60}
                    value={customLabels[index]||""}
                    onChange={event=>setCustomLabels(old=>{
                      const next=[...old];next[index]=event.target.value;return next;
                    })}
                    placeholder={String(index+1)+(en?" card":"-р карт")}
                    className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white focus:border-amber-300 focus:outline-none"/>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveTemplate}
              className="mr-3 mt-6 rounded-full border border-amber-300/40 px-6 py-3 text-sm font-semibold text-amber-100">
              {(locale==="en"?"Save spread":"Дэлгэмлийг хадгалах")}
            </button>
            {templateMessage&&<p role="status" className="mt-3 text-sm text-emerald-200">{templateMessage}</p>}
            <button type="button" onClick={()=>chooseSpread(makeCustomSpread(customCount,customLabels))}
              className="mt-6 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
              {(locale==="en"?"Start custom spread":"Миний дэлгэмлийг эхлүүлэх")}
            </button>
            </div>
          </details>
        </div>
      )}
      {spread && (
        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-300">{spread.cardCount} {tr("картын дэлгэмэл","card spread")}</p>
              <h3 className="mt-2 font-serif text-3xl text-amber-50">{en?englishSpreadName(spread):spread.name}</h3>
              {question.trim() && <p className="mt-2 max-w-xl text-sm text-slate-300">{tr("Асуулт: ","Question: ")}{question.trim()}</p>}
            </div>
            <button type="button" onClick={startAgain}
              className="rounded-full border border-white/25 px-5 py-2 text-sm text-white transition-colors hover:border-amber-300">
              {(locale==="en"?"Change spread":"Дэлгэмэл солих")}
            </button>
          </div>
          {drawn.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-amber-300/20 bg-[#1c1830] px-8 py-12 text-center">
              <p className="text-5xl text-amber-300" aria-hidden="true">✦</p>
              <p className="my-5 text-sm leading-relaxed text-slate-200">
                {(locale==="en"?"Cards are shuffled fairly without duplicates. Upright or reversed orientation is selected independently.":"Картуудыг жигд холиж, давхардалгүй сугална. Эгц эсвэл урвуу байрлалыг тусад нь санамсаргүй сонгоно.")}
              </p>
              <button type="button" onClick={makeReading}
                className="w-full rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#161024] transition-colors hover:bg-amber-200">
                {(locale==="en"?"Shuffle and draw":"Хольж, хөзөр сугалах")}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <span role="status" aria-live="polite">{visibleCount} / {drawn.length} {tr("карт нээсэн","cards revealed")}</span>
                <span className="text-xs text-slate-400">{tr("Энэ tab-д үргэлжлүүлэх боломжтой","Progress stays in this tab")}</span>
                {visibleCount < drawn.length && (
                  <button type="button" onClick={revealNext}
                    className="rounded-full bg-amber-300 px-6 py-3 font-medium text-[#161024] hover:bg-amber-200">
                    {(locale==="en"?"Reveal next card":"Дараагийн картыг нээх")}
                  </button>
                )}
              </div>
              {spread.id==="celtic-cross"
                ? <CelticCrossBoard cards={drawn} visibleCount={visibleCount}
                    onReveal={revealNext}/>
                :               <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {drawn.map((item,index) => (
                  <div key={item.position} className="min-w-0 rounded-xl border border-white/10 bg-[#211b32] p-3">
                    <div className="flex justify-center">
                      <TarotCard card={item.card} size="sm" showMeaning={false} isRevealed={index < visibleCount}
                        isReversed={item.isReversed} userQuestion={index < visibleCount ? undefined : ""}
                        onClick={index===visibleCount?revealNext:undefined} />
                    </div>
                    <p className="mt-4 text-center text-sm font-semibold text-amber-100">{item.position}. {en?englishSpreadPosition(spread,item.position).name:item.positionName}</p>
                    <p className="mt-2 text-center text-xs leading-relaxed text-slate-300">{en?englishSpreadPosition(spread,item.position).description:item.positionDescription}</p>
                  </div>
                ))}
              </div>
              }
              {visibleCount === drawn.length && (
                <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-amber-300/25 bg-gradient-to-b from-[#27203d] to-[#151224] p-6 sm:p-9">
                  <h4 className="font-serif text-2xl text-amber-100">{t("Таны уншилтын тайлал")}</h4>
                  <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-100">{result}</pre>
                  <label className="mt-8 block text-sm font-medium text-amber-100" htmlFor="reading-notes">{tr("Хувийн тэмдэглэл","Private notes")}</label>
                  <textarea id="reading-notes" disabled={!notesDraft.ready} value={notes} onChange={(event)=>{setNotes(event.target.value);setSavedMessage("");}}
                    maxLength={2000} rows={3} placeholder={tr("Өөрийн бодож мэдэрсэн зүйлээ энд бич...","Write your thoughts and feelings here...")}
                    className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={save}
                      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#161024] hover:bg-amber-200">
                      {(locale==="en"?"Save to this device":"Төхөөрөмж дээр хадгалах")}
                    </button>
                    <button type="button" onClick={makeReading}
                      className="rounded-full border border-white/30 px-6 py-3 text-sm text-white hover:border-amber-300">
                      {(locale==="en"?"Shuffle again":"Дахин холих")}
                    </button>
                    <button type="button" disabled={exporting} onClick={()=>void shareReading("story")}
                      className="rounded-full border border-amber-300/40 px-6 py-3 text-sm text-amber-100 disabled:opacity-60">
                      {tr("Story зураг татах","Share as Story")}
                    </button>
                    <button type="button" disabled={exporting} onClick={()=>void shareReading("square")}
                      className="rounded-full border border-amber-300/40 px-6 py-3 text-sm text-amber-100 disabled:opacity-60">
                      {tr("Square зураг татах","Share square image")}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-300">{tr("Хуваалцах зурагт зөвхөн карт, дэлгэмлийн нэр орно. Хувийн асуулт, тэмдэглэл багтахгүй.","Shared images show the cards and spread only; your question and private notes stay out.")}</p>
                  {shareMessage&&<p role="status" className="mt-3 text-sm text-emerald-200">{shareMessage}</p>}
                  {savedMessage && <p role="status" className="mt-4 text-sm text-emerald-200">{savedMessage}</p>}
                </div>
              )}
            </>
          )}
          {notesDraft.error&&<p role="alert" className="mt-4 text-sm text-red-300">{notesDraft.error}</p>}
      {questionDraft.error&&<p role="alert" className="mt-4 text-sm text-red-300">{questionDraft.error}</p>}
      {error && <p role="alert" className="mt-6 text-center text-red-300">{error}</p>}
          {history.length > 0 && (
            <details className="mx-auto mt-10 max-w-3xl rounded-xl border border-white/10 p-5 text-sm text-slate-200">
              <summary className="cursor-pointer text-amber-200">{tr("Өмнөх уншилтууд","Recent readings")} ({history.length})</summary>
              <ul className="mt-4 space-y-3">
                {history.map((entry) => <li key={entry.id} className="border-t border-white/10 py-3">
                  <p className="font-medium text-amber-100">{entry.spread}</p>
                  <p className="text-slate-300">{entry.question || tr("Асуулт оруулаагүй","No question entered")}</p>
                  <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString(en?"en-US":"mn-MN")}</p>
                </li>)}
              </ul>
              <button type="button" onClick={clearHistory} className="mt-4 rounded-full border border-red-300/50 px-4 py-2 text-xs text-red-200 hover:bg-red-400/10">{tr("Энэ төхөөрөмжөөс түүхийг арилгах","Clear journal from device")}</button>
            </details>
          )}
        </div>
      )}
      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-slate-400">
        {tr("Таро, зурхай нь шинжлэх ухааны баталгаатай ирээдүй таамаглах арга биш. Энэ бүтээгдэхүүн нь соёлын бэлгэдэл болон өөрийгөө эргэцүүлэх зорилготой. Эрүүл мэнд, мөнгө, хууль зэрэг чухал шийдвэрийг зөвхөн картын тайлалд тулгуурлан бүү гарга.","Tarot and astrology are not scientifically reliable ways to predict the future. This app is for cultural symbolism and personal reflection. Never make important health, financial or legal decisions based solely on card interpretations.")}
      </p>
    </section>
  );
}
