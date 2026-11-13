"use client";

import { useMemo, useState } from "react";
import { tarotCards, type TarotCard } from "./data/tarotCards";
import { secureRandomInt } from "./lib/offlineEngine";
import TarotCardView from "./components/TarotCard";
import CardReading from "./components/CardReading";
import TraditionalTarotReading from "./components/TraditionalTarotReading";
import Horoscope from "./components/Horoscope";
import DailyFortune from "./components/DailyFortune";
import DreamInterpretation from "./components/DreamInterpretation";
import LifeGuidance from "./components/LifeGuidance";
import ReadingHistory from "./components/ReadingHistory";
import DailyTarotCard from "./components/DailyTarotCard";
import LearnTarot from "./components/LearnTarot";

type Section = "reading" | "single" | "library" | "horoscope" | "daily" | "dream" | "guidance" | "history" | "daily-card" | "learn";
const sections: {id: Section; label: string}[] = [
  {id:"reading",label:"Таро дэлгэмэл"},
  {id:"single",label:"Нэг карт"},
  {id:"library",label:"78 карт"},
  {id:"horoscope",label:"Орд"},
  {id:"daily",label:"Өдрийн санаа"},
  {id:"dream",label:"Зүүд"},
  {id:"guidance",label:"Удирдамж"},
  {id:"daily-card",label:"Өдрийн карт"},
  {id:"history",label:"Миний түүх"},
  {id:"learn",label:"Таро сурах"},
];

export default function Home() {
  const [section,setSection] = useState<Section>("reading");
  const [selected,setSelected] = useState<{ card: TarotCard; isReversed: boolean }|null>(null);
  const [error,setError] = useState("");
  const [query,setQuery] = useState("");
  const [arcana,setArcana] = useState<"all"|"major"|"minor">("all");
  const [libraryCard,setLibraryCard] = useState<TarotCard|null>(null);
  const filtered = useMemo(()=>tarotCards.filter((card)=>(
    (arcana === "all" || card.arcana === arcana) &&
    (card.name + " " + card.englishName).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  )),[arcana,query]);

  const drawSingleCard = () => {
    try {
      const index = secureRandomInt(tarotCards.length);
      setSelected({card:tarotCards[index],isReversed:secureRandomInt(2)===0});
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Карт сугалж чадсангүй.");
    }
  };
  const navigate = (next: Section) => {
    setSection(next);
    setError("");
  };
  return (
    <div className="min-h-screen bg-[#100e1e] text-[#f6f1e9]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[580px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(110,75,126,0.26),transparent_65%)]" />
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <button type="button" onClick={()=>navigate("reading")} className="flex items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/50 font-serif text-2xl text-amber-200" aria-hidden="true">✧</span>
            <span><span className="block font-serif text-xl tracking-[0.04em] text-amber-50">Pocket Tarot</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-amber-300/90">Read • Reflect • Discover</span>
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            AI / API шаардлагагүй
          </div>
        </div>
        <nav aria-label="Үндсэн цэс" className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {sections.map((item)=>(
              <button type="button" key={item.id} aria-pressed={section===item.id} onClick={()=>navigate(item.id)}
                className={"shrink-0 rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 " +
                  (section===item.id ? "bg-amber-300 font-semibold text-[#171127]" : "border border-white/10 text-slate-200 hover:border-amber-300/50 hover:text-amber-200")}>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-3 py-12 sm:px-6">
        {section==="reading" && <TraditionalTarotReading key="reading" onReset={()=>navigate("single")}/>}
        {section==="single" && (
          <section className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">One-card ritual</p>
            <h1 className="mt-3 font-serif text-4xl text-amber-50 sm:text-5xl">Нэг картын уншилт</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
              78 картын аль нэгийг жигд санамсаргүй сугалж, тухайн картын уламжлалт бэлгэдлийг хараарай.
            </p>
            {!selected ? (
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-300/20 bg-white/5 p-9">
                <div className="mx-auto mb-7 w-fit">
                  <TarotCardView card={tarotCards[0]} size="md" onClick={drawSingleCard}/>
                </div>
                <button type="button" onClick={drawSingleCard} className="w-full rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#171127] hover:bg-amber-200">
                  Санамсаргүй нэг карт сугалах
                </button>
              </div>
            ) : <div className="mt-10"><CardReading card={selected.card} isReversed={selected.isReversed} onReset={()=>setSelected(null)}/></div>}
            {error&&<p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
          </section>
        )}
        {section==="library" && (
          <section className="mx-auto max-w-6xl">
            <header className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Rider–Waite–Smith • 1909</p>
              <h1 className="mt-3 font-serif text-4xl text-amber-50 sm:text-5xl">78 картын сан</h1>
              <p className="mt-4 text-sm text-slate-300">22 Их Аркан, 56 Бага Аркан. Карт дээр дарж утгыг нь үзнэ үү.</p>
            </header>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
              <input type="search" aria-label="Карт хайх" placeholder="Картын нэрээр хайх..." value={query}
                onChange={(event)=>setQuery(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none sm:max-w-sm"/>
              <div className="flex flex-wrap gap-2" aria-label="Аркана шүүлтүүр">
                {(["all","major","minor"] as const).map((value)=>(
                  <button type="button" key={value} aria-pressed={arcana===value} onClick={()=>setArcana(value)}
                    className={"rounded-full px-4 py-2 text-sm " + (arcana===value?"bg-amber-300 text-[#171127]":"border border-white/15 text-slate-200")}>
                    {value==="all"?"Бүгд (78)":value==="major"?"Их Аркан (22)":"Бага Аркан (56)"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((card)=>(
                <button type="button" key={card.id} onClick={()=>setLibraryCard(card)}
                  className="group rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-amber-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-[#1f1b33]">
                    <img src={card.image} onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src="/tarot/card-placeholder.svg";}}
                      alt={card.englishName} width={260} height={430} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold leading-snug text-amber-100">{card.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">{card.englishName}</p>
                </button>
              ))}
            </div>
            {filtered.length===0&&<p className="mt-10 text-center text-sm text-slate-400">Ийм нэртэй карт олдсонгүй.</p>}
            {libraryCard && (
              <div role="dialog" aria-modal="true" aria-label={libraryCard.name}
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4"
                onClick={()=>setLibraryCard(null)}>
                <div className="relative my-auto max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-300/30 bg-[#1c172d] p-5 shadow-2xl sm:p-7"
                  onClick={(event)=>event.stopPropagation()}>
                  <button type="button" onClick={()=>setLibraryCard(null)} aria-label="Хаах"
                    className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-[#171127] px-4 py-2 text-sm text-white">Хаах</button>
                  <div className="mx-auto max-w-52 pt-8"><TarotCardView card={libraryCard} isRevealed size="lg"/></div>
                  <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
                    <p><strong className="text-amber-200">Эгц:</strong> {libraryCard.meaning}</p>
                    <p><strong className="text-amber-200">Урвуу:</strong> {libraryCard.reversedMeaning}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {section==="horoscope" && <Horoscope/>}
        {section==="daily" && <DailyFortune/>}
        {section==="dream" && <DreamInterpretation/>}
        {section==="guidance" && <LifeGuidance/>}
        {section==="history" && <ReadingHistory/>}
        {section==="daily-card" && <DailyTarotCard/>}
        {section==="learn" && <LearnTarot/>}
      </main>
      <footer className="relative z-10 border-t border-white/10 px-4 py-8 text-center text-xs leading-6 text-slate-400">
        <p className="font-serif text-lg text-amber-200">✧ Pocket Tarot</p>
        <p className="mt-2">Бэлгэдлийн тайлал ба өөрийгөө эргэцүүлэх орон зай. Ирээдүйг баттай таамаглахгүй.</p>
        <p className="mt-1">Rider–Waite–Smith illustrations © public domain (1909). Art by Pamela Colman Smith.</p>
      </footer>
    </div>
  );
}
