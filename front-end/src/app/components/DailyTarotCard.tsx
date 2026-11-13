"use client";
import { useEffect, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { interpretReading } from "../lib/offlineEngine";
import { addReading } from "../lib/readingHistory";
import TarotCard from "./TarotCard";

function hashDay(text:string):number{
  let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return hash>>>0;
}
export default function DailyTarotCard(){
  const [date,setDate]=useState("");
  const [notes,setNotes]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    // Defer the local-date snapshot until after hydration; a server date
    // may differ from the viewer's calendar day near midnight.
    const frame=requestAnimationFrame(()=>{
      const today=new Date();
      setDate([today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-"));
    });
    return ()=>cancelAnimationFrame(frame);
  },[]);
  const seed=hashDay(date);
  const card=tarotCards[seed%78];
  const isReversed=(seed>>>8)%2===0;
  const reading=card?interpretReading([{
    card,position:1,isReversed,positionName:"Өдрийн бэлгэдэл",
    positionDescription:"Өдөрт нэг удаа эргэцүүлэх сэдэв",
  }]):"";
  const save=()=>{
    if(!date)return;
    try{
      addReading({
        id:"daily-"+date,date:new Date().toISOString(),spread:"Өдрийн карт",
        question:"Өнөөдөр юунд анхаарах вэ?",reading,notes:notes.slice(0,2000),
        cards:[{id:card.id,reversed:isReversed,position:1}],
      });
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
      <textarea id="daily-notes" value={notes} onChange={event=>setNotes(event.target.value)}
        rows={3} maxLength={2000} placeholder="Өнөөдрийн зорилго, бодол..."
        className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400"/>
      <button type="button" onClick={save} className="mt-4 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
        Өдрийн тэмдэглэл хадгалах
      </button>
      {message&&<p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      <p className="mt-5 text-xs text-slate-400">Өдрийн карт нь огнооноос детерминистик сонгогдох бөгөөд ирээдүйн баттай таамаглал биш.</p>
    </div>
  </section>;
}
