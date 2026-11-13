"use client";
import { useEffect, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { interpretReading } from "../lib/offlineEngine";
import { addReading } from "../lib/readingHistory";
import TarotCard from "./TarotCard";
import {getReadingPreferences} from "../lib/readingPreferences";
import {useLocalDraft} from "../lib/useLocalDraft";

function hashDay(text:string):number{
  let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return hash>>>0;
}
export default function DailyTarotCard(){
  const [date,setDate]=useState("");
  const draft=useLocalDraft(date?"daily-"+date:"");
  const [allowReversed,setAllowReversed]=useState(true);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    // A long-running tab must roll over to the next LOCAL calendar day.
    // Using next local midnight (instead of 24h) handles DST changes.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update=()=>{
      const today=new Date();
      setDate([today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-"));
      setAllowReversed(getReadingPreferences().allowReversed);
      setMessage("");setError("");
      const midnight=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
      timer=setTimeout(update,Math.max(100,midnight.getTime()-today.getTime()+100));
    };
    const onVisible=()=>{
      if(document.visibilityState==="visible"){
        if(timer)clearTimeout(timer);
        update();
      }
    };
    const frame=requestAnimationFrame(update);
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{
      cancelAnimationFrame(frame);
      if(timer)clearTimeout(timer);
      document.removeEventListener("visibilitychange",onVisible);
    };
  },[]);
  const seed=hashDay(date);
  const card=tarotCards[seed%78];
  const isReversed=allowReversed && (seed>>>8)%2===0;
  const reading=card?interpretReading([{
    card,position:1,isReversed,positionName:"Өдрийн бэлгэдэл",
    positionDescription:"Өдөрт нэг удаа эргэцүүлэх сэдэв",
  }]):"";
  const save=()=>{
    if(!date||!draft.ready)return;
    try{
      addReading({
        id:"daily-"+date,date:new Date().toISOString(),spread:"Өдрийн карт",
        question:"Өнөөдөр юунд анхаарах вэ?",reading,notes:draft.text.slice(0,2000),
        cards:[{id:card.id,reversed:isReversed,position:1}],
      });
      draft.clear();
      setMessage("Өдрийн тэмдэглэл хадгалагдлаа. Уншилтын түүхээс харж болно.");
      setError("");
    }catch{
      setError("Тэмдэглэл хадгалагдсангүй. Browser storage-ийг шалгана уу.");
    }
  };
  if(!date)return <div className="p-10 text-center text-slate-300">Өдрийн картыг бэлдэж байна...</div>;
  return <section className="mx-auto max-w-3xl px-3 pb-16 text-center">
    <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Daily card journal</p>
    <h1 className="mt-3 font-serif text-4xl text-amber-50">Өнөөдрийн карт</h1>
    <p className="mt-4 text-sm text-slate-300">{date} · Тухайн өдөр тогтмол нэг карт харагдана.</p>
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-300/20 bg-[#211a34] p-6">
      <TarotCard card={card} isRevealed isReversed={isReversed} size="lg"/>
      <pre className="mt-6 whitespace-pre-wrap text-left font-sans text-sm leading-7 text-slate-200">{reading}</pre>
      <label htmlFor="daily-notes" className="mt-6 block text-left text-sm font-semibold text-amber-100">Өдрийн тэмдэглэл</label>
      <textarea id="daily-notes" value={draft.text} disabled={!draft.ready} onChange={event=>draft.setText(event.target.value)}
        rows={3} maxLength={2000} placeholder="Өнөөдрийн зорилго, бодол..."
        className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400"/>
      <p className="mt-2 text-left text-xs text-slate-400">Тэмдэглэл бичих бүрд энэ төхөөрөмж дээр түр хадгалагдана. Өөр өдөр солигдоход тэмдэглэл холилдохгүй.</p>
      <button type="button" disabled={!draft.ready} onClick={save} className="mt-4 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
        Өдрийн тэмдэглэл хадгалах
      </button>
      {message&&<p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      {draft.error&&<p role="alert" className="mt-3 text-sm text-red-300">{draft.error}</p>}
      {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      <p className="mt-5 text-xs text-slate-400">Өдрийн карт нь огнооноос детерминистик сонгогдох бөгөөд ирээдүйн баттай таамаглал биш.</p>
    </div>
  </section>;
}
