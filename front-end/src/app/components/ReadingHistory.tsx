"use client";
import { useEffect, useRef, useState } from "react";
import {
  loadReadings, deleteReading, clearReadings, exportReadings, importReadings, updateReadingNotes, setReadingFavorite, HISTORY_KEY,
  type SavedReading
} from "../lib/readingHistory";
import { tarotCards } from "../data/tarotCards";
import { exportReadingPng } from "../lib/exportReadingPng";
import { convertLegacyReadings } from "../lib/legacyMigration";
import { calculateReadingStats } from "../lib/readingStats";

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
  const [search,setSearch]=useState("");
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [draftNotes,setDraftNotes]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const legacyRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    // Read device-local storage after hydration; never read it during SSR.
    const frame=requestAnimationFrame(()=>{
      try{setItems(loadReadings());}
      catch(cause){setError(cause instanceof Error?cause.message:"Түүхийг уншиж чадсангүй.");}
    });
    return ()=>cancelAnimationFrame(frame);
  },[]);
  const onDelete=(id:string)=>{
    if(!window.confirm("Энэ уншилтыг бүр мөсөн арилгах уу?"))return;
    try{setItems(deleteReading(id));setSelected(null);setError("");setMessage("Уншилт устлаа.");}
    catch{setError("Устгаж чадсангүй.");}
  };
  const clear=()=>{
    if(!window.confirm("Энэ төхөөрөмж дээрх БҮХ уншилтыг арилгах уу?"))return;
    try{clearReadings();setItems([]);setSelected(null);setError("");setMessage("Түүхийг арилгалаа.");}
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
  const readLegacy=async(file:File|undefined)=>{
    if(!file)return;
    if(!window.confirm("Зөвхөн өөрийн хуучин Pocket Tarot account-аас албан ёсоор экспортолсон JSON-ийг импортлохыг баталгаажуулна уу.")){
      if(legacyRef.current)legacyRef.current.value="";
      return;
    }
    try{
      if(file.size>2_000_000)throw new Error("Legacy файл 2 MB-ээс бага байх ёстой.");
      const legacy=convertLegacyReadings(JSON.parse(await file.text()));
      const payload=JSON.stringify({format:"pocket-tarot-readings",version:1,readings:legacy});
      setItems(importReadings(payload));
      setMessage(legacy.length+" хуучин уншилт импортлогдлоо. Хуучин серверийн өгөгдөл устгагдаагүй.");
      setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Legacy import амжилтгүй.");}
    if(legacyRef.current)legacyRef.current.value="";
  };
  const active=items.find(item=>item.id===selected);
  const stats=calculateReadingStats(items);
  const mostSeen=tarotCards.find(card=>card.id===stats.topCardId);
  const searched=search.trim().toLocaleLowerCase();
  const visible=items.filter(item=>{
    if(favoritesOnly&&!item.favorite)return false;
    if(!searched)return true;
    const cardNames=item.cards.flatMap(entry=>{
      const card=tarotCards.find(c=>c.id===entry.id);
      return card?[card.name,card.englishName]:[];
    }).join(" ");
    return [item.spread,item.question,item.notes,cardNames,item.date]
      .join(" ").toLocaleLowerCase().includes(searched);
  });
  return (
    <section className="mx-auto max-w-4xl px-3 pb-20">
      <header className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Private reading journal</p>
        <h1 className="mt-3 font-serif text-4xl text-amber-50">Уншилтын түүх</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Таны тэмдэглэл энэ төхөөрөмж дээр хадгалагдана. Серверт илгээхгүй.
          Browser-ийн мэдээллийг устгавал export хийгээгүй тэмдэглэлүүд алдагдана.
          Хуучин account import-д өөрийн account-аас эрхтэйгээр татсан JSON хэрэгтэй; апп хуучин сервертэй холбогдохгүй.
        </p>
      </header>
      {items.length>0&&<div aria-label="Уншилтын хувийн статистик" className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Нийт уншилт",String(stats.total)],
          ["Дуртай уншилт",String(stats.favorites)],
          ["Өөр карт",String(stats.distinctCards)],
          ["Их давтагдсан",mostSeen?mostSeen.name+" ("+stats.topCardDraws+")":"—"]
        ].map(([label,value])=>(
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">{label}</p>
            <p className="mt-2 text-lg font-semibold text-amber-100">{value}</p>
          </div>
        ))}
      </div>}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={()=>{
          try{saveAsFile(exportReadings(),"pocket-tarot-readings.json","application/json");setError("");}
          catch(cause){setError(cause instanceof Error?cause.message:"Export алдаа гарлаа.");}
        }}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          JSON export
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only"
          aria-label="JSON уншилт импортлох" onChange={(event)=>void readImport(event.target.files?.[0])}/>
        <button type="button" onClick={()=>fileRef.current?.click()}
          className="rounded-full border border-amber-300/30 px-5 py-3 text-sm text-amber-100 hover:border-amber-300">
          JSON import
        </button>
        <input ref={legacyRef} type="file" accept=".json,application/json" className="sr-only"
          aria-label="Хуучин account export JSON" onChange={event=>void readLegacy(event.target.files?.[0])}/>
        <button type="button" onClick={()=>legacyRef.current?.click()}
          className="rounded-full border border-amber-300/30 px-5 py-3 text-sm text-amber-100">
          Хуучин account import
        </button>
        <button type="button" disabled={!items.length&&!error} onClick={clear}
          className="rounded-full border border-red-300/40 px-5 py-3 text-sm text-red-200 hover:border-red-300">
          Бүгдийг арилгах
        </button>
      </div>
      {error&&<p role="alert" className="my-3 text-center text-sm text-red-300">{error}</p>}
      {error&&<button type="button" onClick={()=>{
        try{
          const raw=localStorage.getItem(HISTORY_KEY);
          if(!raw)throw new Error("Хадгалсан мэдээлэл байхгүй байна.");
          saveAsFile(raw,"pocket-tarot-recovery-raw.json","application/json");
        }catch(cause){setMessage(cause instanceof Error?cause.message:"Raw backup үүсгэж чадсангүй.");}
      }} className="mb-4 rounded-full border border-amber-300/30 px-5 py-2 text-sm text-amber-100">
        Өмнө нь raw backup татах
      </button>}
      <div className="mb-7 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
        <label className="w-full max-w-md text-sm text-amber-100">
          Уншилт хайх
          <input type="search" value={search} onChange={event=>setSearch(event.target.value)}
            placeholder="Асуулт, карт, тэмдэглэл, огноо..."
            className="mt-2 w-full rounded-lg border border-white/20 bg-[#171127] p-3 text-sm text-white"/>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={favoritesOnly} onChange={event=>setFavoritesOnly(event.target.checked)}/>
          Зөвхөн дуртай уншилт
        </label>
      </div>
      {message&&<p role="status" className="my-3 text-center text-sm text-emerald-200">{message}</p>}
      {!items.length&&(
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
          <p className="font-serif text-2xl text-amber-100">Одоогоор уншилт алга</p>
          <p className="mt-3 text-sm text-slate-300">Таро дэлгэмлээс карт уншиж, тэмдэглэлээ хадгалаарай.</p>
        </div>
      )}
      {items.length>0&&visible.length===0&&<p className="mb-4 text-center text-slate-300">Шүүлтүүрт тохирох уншилт олдсонгүй.</p>}
      <div className="space-y-3">
        {visible.map(item=>(
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#211a34] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-amber-100">{item.spread || "Таро уншилт"}</h2>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleString("mn-MN")}</p>
                {item.question&&<p className="mt-3 text-sm text-slate-200">{item.question}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={Boolean(item.favorite)}
                  aria-label={item.favorite?"Дуртайгаас хасах":"Дуртайд нэмэх"}
                  onClick={()=>{
                    try{setItems(setReadingFavorite(item.id,!item.favorite));setError("");}
                    catch(cause){setError(cause instanceof Error?cause.message:"Хадгалж чадсангүй.");}
                  }} className="rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-100">
                  {item.favorite?"★":"☆"}
                </button>
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
