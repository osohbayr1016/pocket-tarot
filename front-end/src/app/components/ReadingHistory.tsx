"use client";
import { useEffect, useRef, useState } from "react";
import {HISTORY_KEY,type SavedReading,type ReadingMood} from "../lib/readingHistory";
import {useLanguage} from "../lib/LanguageProvider";
import {
  listJournal,deleteJournalReading,clearJournal,exportJournalJSON,
  importJournalJSON,importJournal,changeJournalNotes,changeJournalFavorite,changeJournalMetadata,
  JOURNAL_PAGE_SIZE
} from "../lib/journalDb";
import { tarotCards } from "../data/tarotCards";
import { exportReadingPng } from "../lib/exportReadingPng";
import {exportReadingSocialPng} from "../lib/exportReadingSocialPng";
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
  const {locale}=useLanguage();
  const en=locale==="en";
  const tr=(mn:string,english:string)=>en?english:mn;
  const [items,setItems]=useState<SavedReading[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [draftNotes,setDraftNotes]=useState("");
  const [draftTags,setDraftTags]=useState("");
  const [draftMood,setDraftMood]=useState<ReadingMood>("neutral");
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const legacyRef=useRef<HTMLInputElement>(null);
  const refresh=async()=>{
    try{setItems(await listJournal());setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Түүхийг уншиж чадсангүй.");}
    finally{setLoading(false);}
  };
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{void refresh();});
    return ()=>cancelAnimationFrame(frame);
  },[]);
  const onDelete=async(id:string)=>{
    if(!window.confirm(tr("Энэ уншилтыг бүр мөсөн арилгах уу?","Delete this reading permanently?")))return;
    try{
      await deleteJournalReading(id);setItems(await listJournal());
      setSelected(null);setError("");setMessage(tr("Уншилт устлаа.","Reading deleted."));
    }catch(cause){setError(cause instanceof Error?cause.message:"Устгаж чадсангүй.");}
  };
  const clear=async()=>{
    if(!window.confirm(tr("Энэ төхөөрөмж дээрх БҮХ уншилтыг арилгах уу? Эхлээд JSON backup хийгээрэй.","Delete ALL readings from this device? Export a JSON backup first.")))return;
    try{
      await clearJournal();setItems([]);setSelected(null);setPage(1);
      setError("");setMessage(tr("Түүхийг арилгалаа.","Journal cleared."));
    }catch(cause){setError(cause instanceof Error?cause.message:"Түүх арилгахад алдаа гарлаа.");}
  };
  const readImport=async(file:File|undefined)=>{
    if(!file)return;
    try{
      const count=await importJournalJSON(await file.text());
      setItems(await listJournal());setError("");setMessage(en?`${count} readings imported.`:count+" уншилт импортлогдлоо.");
    }catch(cause){setError(cause instanceof Error?cause.message:"Импорт амжилтгүй.");setMessage("");}
    if(fileRef.current)fileRef.current.value="";
  };
  const readLegacy=async(file:File|undefined)=>{
    if(!file)return;
    if(!window.confirm(tr("Зөвхөн өөрийн хуучин Pocket Tarot account-аас албан ёсоор экспортолсон JSON-ийг импортлохыг баталгаажуулна уу.","Confirm this JSON was exported from your own Pocket Tarot account."))){
      if(legacyRef.current)legacyRef.current.value="";
      return;
    }
    try{
      if(file.size>2_000_000)throw new Error("Legacy файл 2 MB-ээс бага байх ёстой.");
      const legacy=convertLegacyReadings(JSON.parse(await file.text()));
      await importJournal(legacy);
      setItems(await listJournal());
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
    return [item.spread,item.question,item.notes,cardNames,item.date,item.mood||"",...(item.tags||[])]
      .join(" ").toLocaleLowerCase().includes(searched);
  });
  const pages=Math.max(1,Math.ceil(visible.length/JOURNAL_PAGE_SIZE));
  const safePage=Math.min(page,pages);
  const pageItems=visible.slice((safePage-1)*JOURNAL_PAGE_SIZE,safePage*JOURNAL_PAGE_SIZE);
  return (
    <section className="mx-auto max-w-4xl px-3 pb-20">
      <header className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Private reading journal</p>
        <h1 className="mt-3 font-serif text-4xl text-amber-50">{tr("Уншилтын түүх","Reading journal")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {tr("Таны тэмдэглэл энэ төхөөрөмж дээр хадгалагдана. Серверт илгээхгүй. Browser-ийн мэдээллийг устгавал export хийгээгүй тэмдэглэлүүд алдагдана. Хуучин account import-д өөрийн account-аас эрхтэйгээр татсан JSON хэрэгтэй; апп хуучин сервертэй холбогдохгүй.","Journal entries stay on this device. Clearing browser data can erase entries without a backup. Legacy imports require a file you exported from your own account; this app never connects to the old server.")}
        </p>
      </header>
      {items.length>0&&<div aria-label={tr("Уншилтын хувийн статистик","Private journal statistics")} className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [tr("Нийт уншилт","Total readings"),String(stats.total)],
          [tr("Дуртай уншилт","Favorites"),String(stats.favorites)],
          [tr("Өөр карт","Unique cards"),String(stats.distinctCards)],
          [tr("Их давтагдсан","Most drawn"),mostSeen?(en?mostSeen.englishName:mostSeen.name)+" ("+stats.topCardDraws+")":"—"]
        ].map(([label,value])=>(
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">{label}</p>
            <p className="mt-2 text-lg font-semibold text-amber-100">{value}</p>
          </div>
        ))}
      </div>}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={()=>{
          void (async()=>{
            try{
              saveAsFile(await exportJournalJSON(),"pocket-tarot-readings-v2.json","application/json");
              setError("");
            }catch(cause){setError(cause instanceof Error?cause.message:"Export алдаа гарлаа.");}
          })();
        }}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#171127] hover:bg-amber-200">
          JSON export
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only"
          aria-label={tr("JSON уншилт импортлох","Import readings JSON")} onChange={(event)=>void readImport(event.target.files?.[0])}/>
        <button type="button" onClick={()=>fileRef.current?.click()}
          className="rounded-full border border-amber-300/30 px-5 py-3 text-sm text-amber-100 hover:border-amber-300">
          JSON import
        </button>
        <input ref={legacyRef} type="file" accept=".json,application/json" className="sr-only"
          aria-label={tr("Хуучин account export JSON","Import user-owned legacy account JSON")} onChange={event=>void readLegacy(event.target.files?.[0])}/>
        <button type="button" onClick={()=>legacyRef.current?.click()}
          className="rounded-full border border-amber-300/30 px-5 py-3 text-sm text-amber-100">
          {(locale==="en"?"Import old account":"Хуучин account import")}
        </button>
        <button type="button" disabled={!items.length&&!error} onClick={clear}
          className="rounded-full border border-red-300/40 px-5 py-3 text-sm text-red-200 hover:border-red-300">
          {(locale==="en"?"Clear all":"Бүгдийг арилгах")}
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
        {(locale==="en"?"Download raw backup first":"Өмнө нь raw backup татах")}
      </button>}
      <div className="mb-7 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
        <label className="w-full max-w-md text-sm text-amber-100">
          {(locale==="en"?"Search readings":"Уншилт хайх")}
          <input type="search" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}}
            placeholder={tr("Асуулт, карт, тэмдэглэл, огноо...","Question, card, notes, date...")}
            className="mt-2 w-full rounded-lg border border-white/20 bg-[#171127] p-3 text-sm text-white"/>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={favoritesOnly} onChange={event=>{setFavoritesOnly(event.target.checked);setPage(1);}}/>
          {(locale==="en"?"Favorites only":"Зөвхөн дуртай уншилт")}
        </label>
      </div>
      {message&&<p role="status" className="my-3 text-center text-sm text-emerald-200">{message}</p>}
      {!loading&&!items.length&&!error&&(
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
          <p className="font-serif text-2xl text-amber-100">{tr("Одоогоор уншилт алга","No readings yet")}</p>
          <p className="mt-3 text-sm text-slate-300">{tr("Таро дэлгэмлээс карт уншиж, тэмдэглэлээ хадгалаарай.","Draw a Tarot spread and save your reflection.")}</p>
        </div>
      )}
      {items.length>0&&visible.length===0&&<p className="mb-4 text-center text-slate-300">{tr("Шүүлтүүрт тохирох уншилт олдсонгүй.","No readings match these filters.")}</p>}
      {loading&&<p role="status" className="py-8 text-center text-slate-300">{tr("Түүхийг ачаалж байна...","Loading your journal...")}</p>}
      <div className="space-y-3">
        {pageItems.map(item=>(
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#211a34] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-amber-100">{item.spread || "Таро уншилт"}</h2>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleString(en?"en-US":"mn-MN")}</p>
                {item.question&&<p className="mt-3 text-sm text-slate-200">{item.question}</p>}
                {!!item.tags?.length&&<div className="mt-3 flex flex-wrap gap-2">{item.tags.map(tag=>
                  <span key={tag} className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-100">#{tag}</span>
                )}</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={Boolean(item.favorite)}
                  aria-label={item.favorite?tr("Дуртайгаас хасах","Remove favorite"):tr("Дуртайд нэмэх","Add favorite")}
                  onClick={()=>void (async()=>{
                    try{
                      await changeJournalFavorite(item.id,!item.favorite);
                      setItems(await listJournal());setError("");
                    }catch(cause){setError(cause instanceof Error?cause.message:"Хадгалж чадсангүй.");}
                  })()} className="rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-100">
                  {item.favorite?"★":"☆"}
                </button>
                <button type="button" aria-expanded={selected===item.id} onClick={()=>{ const next=selected===item.id?null:item.id;setSelected(next);setDraftNotes(next?item.notes:"");setDraftTags(next?(item.tags||[]).join(", "):"");setDraftMood(next?item.mood||"neutral":"neutral"); }}
                  className="rounded-full border border-amber-300/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-300">
                  {selected===item.id?"Хураах":"Дэлгэрэнгүй"}
                </button>
                <button type="button" onClick={()=>onDelete(item.id)} className="rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200">
                  {(locale==="en"?"Delete":"Устгах")}
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
                        <p className="mt-2 text-center text-[11px] text-slate-300">{entry.position}. {en?card.englishName:card.name}</p>
                      </div>
                    );
                  })}
                </div>}
                <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-100">{active.reading}</pre>
                {active.notes&&<div className="mt-5 border-l-2 border-amber-300/60 pl-4 text-sm text-slate-300">
                  <h3 className="mb-1 font-semibold text-amber-100">{tr("Таны тэмдэглэл","Your notes")}</h3>{active.notes}
                </div>}
                <div className="mt-5">
                  <label htmlFor={"history-notes-"+active.id} className="mb-2 block text-sm font-semibold text-amber-100">{tr("Тэмдэглэл засах","Edit notes")}</label>
                  <textarea id={"history-notes-"+active.id} maxLength={2000}
                    value={draftNotes} onChange={event=>setDraftNotes(event.target.value)} rows={3}
                    placeholder={tr("Энэ уншилтын тухай хувийн тэмдэглэлээ бич...","Write private notes about this reading...")}
                    className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"/>
                  <button type="button" onClick={()=>void (async()=>{
                    try{
                      await changeJournalNotes(active.id,draftNotes);
                      setItems(await listJournal());setError("");setMessage(tr("Тэмдэглэл хадгалагдлаа.","Notes saved."));
                    }catch(cause){
                      setError(cause instanceof Error?cause.message:"Тэмдэглэлийг хадгалж чадсангүй.");
                    }
                  })()} className="mt-2 rounded-full border border-amber-300/40 px-5 py-2 text-sm text-amber-100 hover:border-amber-300">
                    {(locale==="en"?"Save notes":"Тэмдэглэл хадгалах")}
                  </button>
                </div>
                <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                  <label htmlFor={"journal-tags-"+active.id} className="text-sm text-amber-100">
                    {(locale==="en"?"Tags (comma-separated, up to six)":"Тэмдэглэгээ (таслалаар салгана, 6 хүртэл)")}
                    <input id={"journal-tags-"+active.id} value={draftTags}
                      onChange={event=>setDraftTags(event.target.value)} maxLength={210}
                      placeholder={tr("хайр, зорилго, шинэ эхлэл...","love, goals, new start...")}
                      className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white"/>
                  </label>
                  <label htmlFor={"journal-mood-"+active.id} className="text-sm text-amber-100">
                    {(locale==="en"?"Feeling after this reading":"Уншилтын дараах мэдрэмж")}
                    <select id={"journal-mood-"+active.id} value={draftMood}
                      onChange={event=>setDraftMood(event.target.value as ReadingMood)}
                      className="mt-2 w-full rounded-lg border border-white/20 bg-[#171127] p-3 text-sm text-white">
                      <option value="neutral">{tr("Төвийг сахисан","Neutral")}</option>
                      <option value="calm">{tr("Тайван","Calm")}</option>
                      <option value="hopeful">{tr("Итгэлтэй","Hopeful")}</option>
                      <option value="uncertain">{tr("Эргэлзээтэй","Uncertain")}</option>
                      <option value="anxious">{tr("Санаа зовсон","Anxious")}</option>
                    </select>
                  </label>
                  <button type="button" onClick={()=>void (async()=>{
                    try{
                      const tags=[...new Set(draftTags.split(",").map(v=>v.trim()).filter(Boolean))];
                      await changeJournalMetadata(active.id,tags,draftMood);
                      setItems(await listJournal());setError("");setMessage(tr("Мэдрэмж болон тэмдэглэгээ хадгалагдлаа.","Mood and tags saved."));
                    }catch(cause){setError(cause instanceof Error?cause.message:"Мэдрэмж хадгалагдсангүй.");}
                  })()} className="w-fit rounded-full border border-amber-300/40 px-5 py-3 text-sm text-amber-100">
                    {(locale==="en"?"Save tags and mood":"Ангилал хадгалах")}
                  </button>
                </div>
                <p className="mt-5 text-xs leading-5 text-slate-400">
                  {(locale==="en"?"Social images show only card and spread names; your question, private notes and full interpretation are excluded.":"Social share зурагт зөвхөн картын нэр, дэлгэмлийн нэр орно. Таны асуулт, тэмдэглэл, бүтэн тайлал нийтлэгдэхгүй.")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button"
                    onClick={()=>void exportReadingPng(active,tarotCards).then(
                      ()=>setMessage("PNG зураг хадгалагдлаа."),
                      ()=>setError("PNG үүсгэх үед алдаа гарлаа.")
                    )}
                    className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-[#171127]">
                    {(locale==="en"?"PNG image":"PNG зураг")}
                  </button>
                  {(["story","square"] as const).map(format=>
                    <button type="button" key={format} onClick={()=>void exportReadingSocialPng(active,tarotCards,format).then(
                      ()=>setMessage(format==="story"?"Story PNG хадгалагдлаа.":"Square PNG хадгалагдлаа."),
                      ()=>setError("Share зураг экспортолж чадсангүй.")
                    )}
                    className="rounded-full border border-amber-300/40 px-5 py-2 text-sm text-amber-100">
                      {format==="story"?"Story 9:16":"Square 1:1"} PNG
                    </button>
                  )}
                  <button type="button" onClick={()=>window.print()}
                    className="rounded-full border border-white/30 px-5 py-2 text-sm text-slate-100">Print / PDF</button>
                  <button type="button" onClick={()=>navigator.clipboard.writeText(active.reading).then(
                    ()=>setMessage("Тайлбар хууллаа."),()=>setError("Тайлбарыг хуулж чадсангүй."))}
                    className="rounded-full border border-white/30 px-5 py-2 text-sm text-slate-100">{tr("Хуулах","Copy")}</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      {pages>1&&<nav aria-label={tr("Уншилтын түүхийн хуудас","Reading journal pagination")} className="mt-8 flex items-center justify-center gap-4">
        <button type="button" disabled={safePage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}
          className="min-h-11 rounded-full border border-amber-300/30 px-5 py-2 text-amber-100 disabled:opacity-40">
          {(locale==="en"?"Previous":"Өмнөх")}
        </button>
        <span aria-live="polite" className="text-sm text-slate-300">{safePage} / {pages} хуудас · {visible.length} уншилт</span>
        <button type="button" disabled={safePage===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}
          className="min-h-11 rounded-full border border-amber-300/30 px-5 py-2 text-amber-100 disabled:opacity-40">
          {(locale==="en"?"Next":"Дараах")}
        </button>
      </nav>}
    </section>
  );
}
