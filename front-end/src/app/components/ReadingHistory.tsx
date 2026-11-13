"use client";
import { useEffect, useRef, useState } from "react";
import {
  loadReadings, deleteReading, clearReadings, exportReadings, importReadings, updateReadingNotes,
  type SavedReading
} from "../lib/readingHistory";
import { tarotCards } from "../data/tarotCards";
import { exportReadingPng } from "../lib/exportReadingPng";

function saveAsFile(content:string,name:string,mime:string){
  const blob=new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
export default function ReadingHistory(){
  const [items,setItems]=useState<SavedReading[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [draftNotes,setDraftNotes]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    // Read device-local storage after hydration; never read it during SSR.
    const frame=requestAnimationFrame(()=>setItems(loadReadings()));
    return ()=>cancelAnimationFrame(frame);
  },[]);
  const onDelete=(id:string)=>{
    if(!window.confirm("Энэ уншилтыг бүр мөсөн арилгах уу?"))return;
    try{setItems(deleteReading(id));setSelected(null);setMessage("Уншилт устлаа.");}
    catch{setError("Устгаж чадсангүй.");}
  };
  const clear=()=>{
    if(!window.confirm("Энэ төхөөрөмж дээрх БҮХ уншилтыг арилгах уу?"))return;
    try{clearReadings();setItems([]);setSelected(null);setMessage("Түүхийг арилгалаа.");}
    catch{setError("Түүх арилгахад алдаа гарлаа.");}
  };
  const readImport=async(file:File|undefined)=>{
    if(!file)return;
    try{
      const text=await file.text();
      setItems(importReadings(text));setError("");setMessage("JSON файл амжилттай импортлогдлоо.");
    }catch(cause){setError(cause instanceof Error?cause.message:"Импорт амжилтгүй.");setMessage("");}
    if(fileRef.current)fileRef.current.value="";
  };
  const active=items.find(item=>item.id===selected);
  return (
    <section className="mx-auto max-w-4xl px-3 pb-20">
      <header className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Private reading journal</p>
        <h1 className="mt-3 font-serif text-4xl text-amber-50">Уншилтын түүх</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Таны тэмдэглэл энэ төхөөрөмж дээр хадгалагдана. Серверт илгээхгүй.
          Browser-ийн мэдээллийг устгавал export хийгээгүй тэмдэглэлүүд алдагдана.
        </p>
      </header>
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={()=>saveAsFile(exportReadings(),"pocket-tarot-readings.json","application/json")}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          JSON export
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only"
          aria-label="JSON уншилт импортлох" onChange={(event)=>void readImport(event.target.files?.[0])}/>
        <button type="button" onClick={()=>fileRef.current?.click()}
          className="rounded-full border border-amber-300/30 px-5 py-3 text-sm text-amber-100 hover:border-amber-300">
          JSON import
        </button>
        <button type="button" disabled={!items.length} onClick={clear}
          className="rounded-full border border-red-300/40 px-5 py-3 text-sm text-red-200 hover:border-red-300">
          Бүгдийг арилгах
        </button>
      </div>
      {error&&<p role="alert" className="my-3 text-center text-sm text-red-300">{error}</p>}
      {message&&<p role="status" className="my-3 text-center text-sm text-emerald-200">{message}</p>}
      {!items.length&&(
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
          <p className="font-serif text-2xl text-amber-100">Одоогоор уншилт алга</p>
          <p className="mt-3 text-sm text-slate-300">Таро дэлгэмлээс карт уншиж, тэмдэглэлээ хадгалаарай.</p>
        </div>
      )}
      <div className="space-y-3">
        {items.map(item=>(
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#211a34] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-amber-100">{item.spread || "Таро уншилт"}</h2>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleString("mn-MN")}</p>
                {item.question&&<p className="mt-3 text-sm text-slate-200">{item.question}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-expanded={selected===item.id} onClick={()=>{ const next=selected===item.id?null:item.id;setSelected(next);setDraftNotes(next?item.notes:""); }}
                  className="rounded-full border border-amber-300/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-300">
                  {selected===item.id?"Хураах":"Дэлгэрэнгүй"}
                </button>
                <button type="button" onClick={()=>onDelete(item.id)} className="rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200">
                  Устгах
                </button>
              </div>
            </div>
            {selected===item.id&&active&&(
              <div className="mt-5 border-t border-white/10 pt-5">
                {!!active.cards.length&&<div className="flex flex-wrap gap-3">
                  {active.cards.map((entry,index)=>{
                    const card=tarotCards.find(c=>c.id===entry.id);
                    if(!card)return null;
                    return (
                      <div className="w-20 sm:w-24" key={index}>
                        <img src={card.image} alt={card.englishName} loading="lazy"
                          className={"aspect-[2/3] w-full rounded-md border border-amber-300/30 object-cover "+
                            (entry.reversed?"rotate-180":"")}/>
                        <p className="mt-2 text-center text-[11px] text-slate-300">{entry.position}. {card.name}</p>
                      </div>
                    );
                  })}
                </div>}
                <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-100">{active.reading}</pre>
                {active.notes&&<div className="mt-5 border-l-2 border-amber-300/60 pl-4 text-sm text-slate-300">
                  <h3 className="mb-1 font-semibold text-amber-100">Таны тэмдэглэл</h3>{active.notes}
                </div>}
                <div className="mt-5">
                  <label htmlFor={"history-notes-"+active.id} className="mb-2 block text-sm font-semibold text-amber-100">Тэмдэглэл засах</label>
                  <textarea id={"history-notes-"+active.id} maxLength={2000}
                    value={draftNotes} onChange={event=>setDraftNotes(event.target.value)} rows={3}
                    placeholder="Энэ уншилтын тухай хувийн тэмдэглэлээ бич..."
                    className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
                  <button type="button" onClick={()=>{
                    try {
                      setItems(updateReadingNotes(active.id,draftNotes));
                      setError("");setMessage("Тэмдэглэл хадгалагдлаа.");
                    }catch(cause){
                      setError(cause instanceof Error?cause.message:"Тэмдэглэлийг хадгалж чадсангүй.");
                    }
                  }} className="mt-2 rounded-full border border-amber-300/40 px-5 py-2 text-sm text-amber-100 hover:border-amber-300">
                    Тэмдэглэл хадгалах
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button"
                    onClick={()=>void exportReadingPng(active,tarotCards).then(
                      ()=>setMessage("PNG зураг хадгалагдлаа."),
                      ()=>setError("PNG үүсгэх үед алдаа гарлаа.")
                    )}
                    className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-[#171127]">
                    PNG зураг
                  </button>
                  <button type="button" onClick={()=>window.print()}
                    className="rounded-full border border-white/30 px-5 py-2 text-sm text-slate-100">Print / PDF</button>
                  <button type="button" onClick={()=>navigator.clipboard.writeText(active.reading).then(
                    ()=>setMessage("Тайлбар хууллаа."),()=>setError("Тайлбарыг хуулж чадсангүй."))}
                    className="rounded-full border border-white/30 px-5 py-2 text-sm text-slate-100">Хуулах</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
