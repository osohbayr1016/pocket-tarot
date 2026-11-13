"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { tarotCards, type TarotCard } from "./data/tarotCards";
import { secureRandomInt } from "./lib/offlineEngine";
import {getReadingPreferences} from "./lib/readingPreferences";
import {useLanguage} from "./lib/LanguageProvider";
import {emitFeedback} from "./lib/feedback";
import TarotCardView from "./components/TarotCard";

import TraditionalTarotReading from "./components/TraditionalTarotReading";







// Load secondary experiences on demand. The PWA build precaches all emitted
// JS chunks so first offline visits to these sections still work after install.
const loadingView=()=> <p role="status" className="py-12 text-center text-amber-100">Хэсгийг ачаалж байна...</p>;
const CardReading=dynamic(()=>import("./components/CardReading"),{ssr:false,loading:loadingView});
const Horoscope=dynamic(()=>import("./components/Horoscope"),{ssr:false,loading:loadingView});
const DailyFortune=dynamic(()=>import("./components/DailyFortune"),{ssr:false,loading:loadingView});
const DreamInterpretation=dynamic(()=>import("./components/DreamInterpretation"),{ssr:false,loading:loadingView});
const LifeGuidance=dynamic(()=>import("./components/LifeGuidance"),{ssr:false,loading:loadingView});
const ReadingHistory=dynamic(()=>import("./components/ReadingHistory"),{ssr:false,loading:loadingView});
const DailyTarotCard=dynamic(()=>import("./components/DailyTarotCard"),{ssr:false,loading:loadingView});
const LearnTarot=dynamic(()=>import("./components/LearnTarot"),{ssr:false,loading:loadingView});
const OfflineDeckManager=dynamic(()=>import("./components/OfflineDeckManager"),{ssr:false,loading:loadingView});
const PreferencesPanel=dynamic(()=>import("./components/PreferencesPanel"),{ssr:false,loading:loadingView});
const CardDetailsDialog=dynamic(()=>import("./components/CardDetailsDialog"),{ssr:false,loading:loadingView});
const MoonCalendar = dynamic(() => import("./components/MoonCalendar"), {
  ssr: false,
  loading: () => <p role="status" className="py-12 text-center text-amber-100">Сарны календарь ачаалж байна...</p>,
});
const NatalChartPage = dynamic(() => import("./components/NatalChartPage"), {
  ssr: false,
  loading: () => <p role="status" className="py-12 text-center text-amber-100">Тэнгэрийн зураг ачаалж байна...</p>,
});



import NavigationMenu, {isSection, type Section} from "./components/NavigationMenu";

export default function Home() {
  const {locale}=useLanguage();
  const [section,setSection] = useState<Section>("reading");
  const [selected,setSelected] = useState<{ card: TarotCard; isReversed: boolean }|null>(null);
  const [error,setError] = useState("");
  const [query,setQuery] = useState("");
  const [arcana,setArcana] = useState<"all"|"major"|"minor">("all");
  const [suit,setSuit] = useState<"all"|"Wands"|"Cups"|"Swords"|"Pentacles">("all");
  const [element,setElement] = useState<"all"|"Гал"|"Ус"|"Агаар"|"Шороо">("all");
  const [libraryCard,setLibraryCard] = useState<TarotCard|null>(null);
  useEffect(()=>{
    // Hydration-safe deep-link initialization; back/forward also restore sections.
    const readUrl=()=>{
      const candidate=new URLSearchParams(window.location.search).get("view");
      setSection(isSection(candidate)?candidate:"reading");
      setLibraryCard(null);
    };
    const frame=requestAnimationFrame(readUrl);
    window.addEventListener("popstate",readUrl);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("popstate",readUrl);};
  },[]);
  const filtered = useMemo(()=>tarotCards.filter((card)=>(
    (arcana === "all" || card.arcana === arcana) &&
    (suit === "all" || card.suit === suit) &&
    (element === "all" || card.element === element) &&
    (card.name + " " + card.englishName+" "+card.keywords.join(" ")).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  )),[arcana,query,suit,element]);

  const drawSingleCard = () => {
    try {
      const index = secureRandomInt(tarotCards.length);
      setSelected({card:tarotCards[index],isReversed:getReadingPreferences().allowReversed && secureRandomInt(2)===0});
      emitFeedback("draw");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Карт сугалж чадсангүй.");
    }
  };
  const navigate = (next: Section) => {
    const current=new URL(window.location.href);
    if(current.searchParams.get("view")!==next){
      current.searchParams.set("view",next);
      window.history.pushState({view:next},"",current.pathname+current.search+current.hash);
    }
    setSection(next);
    setLibraryCard(null);
    setError("");
    window.requestAnimationFrame(()=>document.getElementById("main-content")?.focus());
  };
  return (
    <div className="pocket-shell min-h-screen bg-[#100e1e] text-[#f6f1e9]">
      <a href="#main-content" className="sr-only rounded-lg bg-amber-300 p-3 font-semibold text-[#171127] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">Үндсэн агуулга руу очих</a>
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
            {locale==="en"?"No AI or API required":"AI / API шаардлагагүй"}
          </div>
        </div>
        <NavigationMenu section={section} onNavigate={navigate}/>
      </header>
      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-12">
        {section==="reading" && <TraditionalTarotReading key="reading" onReset={()=>navigate("single")}/>}
        {section==="single" && (
          <section className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">One-card ritual</p>
            <h1 className="mt-3 font-serif text-4xl text-amber-50 sm:text-5xl">{locale==="en"?"Single-card reading":"Нэг картын уншилт"}</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
              {locale==="en"?"Draw one of 78 cards at random and explore its traditional symbolism.":"78 картын аль нэгийг жигд санамсаргүй сугалж, тухайн картын уламжлалт бэлгэдлийг хараарай."}
            </p>
            {!selected ? (
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-300/20 bg-white/5 p-9">
                <div className="mx-auto mb-7 w-fit">
                  <TarotCardView card={tarotCards[0]} size="md" onClick={drawSingleCard}/>
                </div>
                <button type="button" onClick={drawSingleCard} className="w-full rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#171127] hover:bg-amber-200">
                  {locale==="en"?"Draw one random card":"Санамсаргүй нэг карт сугалах"}
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
              <h1 className="mt-3 font-serif text-4xl text-amber-50 sm:text-5xl">{locale==="en"?"78-card library":"78 картын сан"}</h1>
              <p className="mt-4 text-sm text-slate-300">{locale==="en"?"22 Major Arcana and 56 Minor Arcana. Select a card to explore its meaning.":"22 Их Аркан, 56 Бага Аркан. Карт дээр дарж утгыг нь үзнэ үү."}</p>
            </header>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
              <input type="search" aria-label={locale==="en"?"Search cards":"Карт хайх"} placeholder={locale==="en"?"Search cards by name...":"Картын нэрээр хайх..."} value={query}
                onChange={(event)=>setQuery(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none sm:max-w-sm"/>
              <div className="flex flex-wrap gap-2" aria-label="Аркана шүүлтүүр">
                {(["all","major","minor"] as const).map((value)=>(
                  <button type="button" key={value} aria-pressed={arcana===value} onClick={()=>setArcana(value)}
                    className={"rounded-full px-4 py-2 text-sm " + (arcana===value?"bg-amber-300 text-[#171127]":"border border-white/15 text-slate-200")}>
                    {value==="all"?(locale==="en"?"All (78)":"Бүгд (78)"):value==="major"?(locale==="en"?"Major (22)":"Их Аркан (22)"):(locale==="en"?"Minor (56)":"Бага Аркан (56)")}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="flex-1 text-sm text-amber-100" htmlFor="library-suit">
                {locale==="en"?"Suit":"Бүлэг"}
                <select id="library-suit" value={suit} onChange={event=>setSuit(event.target.value as typeof suit)}
                  className="mt-2 block w-full min-w-36 rounded-lg border border-white/20 bg-[#171127] p-3 text-slate-100">
                  <option value="all">{locale==="en"?"All suits":"Бүх бүлэг"}</option>
                  <option value="Wands">{locale==="en"?"Wands":"Саваа (Wands)"}</option>
                  <option value="Cups">{locale==="en"?"Cups":"Хундага (Cups)"}</option>
                  <option value="Swords">{locale==="en"?"Swords":"Сэлэм (Swords)"}</option>
                  <option value="Pentacles">{locale==="en"?"Pentacles":"Зоос (Pentacles)"}</option>
                </select>
              </label>
              <label className="flex-1 text-sm text-amber-100" htmlFor="library-element">
                {locale==="en"?"Element":"Элемент"}
                <select id="library-element" value={element} onChange={event=>setElement(event.target.value as typeof element)}
                  className="mt-2 block w-full min-w-36 rounded-lg border border-white/20 bg-[#171127] p-3 text-slate-100">
                  <option value="all">{locale==="en"?"All elements":"Бүх элемент"}</option>
                  <option value="Гал">{locale==="en"?"Fire":"Гал"}</option>
                  <option value="Ус">{locale==="en"?"Water":"Ус"}</option>
                  <option value="Агаар">{locale==="en"?"Air":"Агаар"}</option>
                  <option value="Шороо">{locale==="en"?"Earth":"Шороо"}</option>
                </select>
              </label>
              <button type="button" onClick={()=>{
                setQuery("");setArcana("all");setSuit("all");setElement("all");
              }} className="min-h-11 rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-100">
                {locale==="en"?"Reset filters":"Шүүлтүүр цэвэрлэх"}
              </button>
              <p role="status" aria-live="polite" className="w-full text-xs text-slate-300">
                {locale==="en"?"Showing":"Нийт"} {filtered.length} / 78 {locale==="en"?"cards":"карт харагдаж байна."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((card)=>(
                <button type="button" key={card.id} onClick={()=>setLibraryCard(card)}
                  className="group rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-amber-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-[#1f1b33]">
                    <img src={card.image} onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src="/tarot/card-placeholder.svg";}}
                      alt={card.englishName} width={260} height={430} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold leading-snug text-amber-100">{locale==="en"?card.englishName:card.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">{locale==="en"?card.arcana:card.englishName}</p>
                </button>
              ))}
            </div>
            {filtered.length===0&&<p className="mt-10 text-center text-sm text-slate-400">{locale==="en"?"No cards match these filters. Try resetting them.":"Шүүлтүүрт тохирох карт алга. Шүүлтүүрээ цэвэрлээд үзээрэй."}</p>}
            {libraryCard && <CardDetailsDialog card={libraryCard} onClose={()=>setLibraryCard(null)} />}
          </section>
        )}
        {section==="horoscope" && <Horoscope/>}
        {section==="natal" && <NatalChartPage/>}
        {section==="moon" && <MoonCalendar/>}
        {section==="daily" && <DailyFortune/>}
        {section==="dream" && <DreamInterpretation/>}
        {section==="guidance" && <LifeGuidance/>}
        {section==="history" && <ReadingHistory onOpenBackup={()=>navigate("settings")}/>}
        {section==="daily-card" && <DailyTarotCard/>}
        {section==="learn" && <LearnTarot/>}
        {section==="offline" && <OfflineDeckManager/>}
        {section==="settings" && <PreferencesPanel/>}
      </main>
      <footer className="relative z-10 border-t border-white/10 px-4 py-8 text-center text-xs leading-6 text-slate-400">
        <p className="font-serif text-lg text-amber-200">✧ Pocket Tarot</p>
        <p className="mt-2">{locale==="en"?"A place for symbolism and reflection, not a reliable prediction of the future.":"Бэлгэдлийн тайлал ба өөрийгөө эргэцүүлэх орон зай. Ирээдүйг баттай таамаглахгүй."}</p>
        <p className="mt-1">{locale==="en"
          ?"Original 1909 illustrations by Pamela Colman Smith. Historical scans restored by Steve P."
          :"1909 оны анхны зургууд — Pamela Colman Smith. Түүхэн сканыг Steve P. сэргээн боловсруулсан."}</p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="underline decoration-amber-300/50 underline-offset-4 hover:text-amber-100">{locale==="en"?"Privacy":"Нууцлал"}</Link>
          <Link href="/terms" className="underline decoration-amber-300/50 underline-offset-4 hover:text-amber-100">{locale==="en"?"Terms":"Ашиглах нөхцөл"}</Link>
        </p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="https://github.com/mixvlad/TarotCards/blob/main/SOURCES.md"
            target="_blank" rel="noopener noreferrer"
            className="underline decoration-amber-300/50 underline-offset-4 hover:text-amber-100">
            {locale==="en"?"Artwork provenance":"Зургийн эх сурвалж"}
          </a>
          <a href="https://github.com/osohbayr1016/pocket-tarot/blob/feat/offline-tarot-foundation/ARTWORK_PROVENANCE.md"
            target="_blank" rel="noopener noreferrer"
            className="underline decoration-amber-300/50 underline-offset-4 hover:text-amber-100">
            {locale==="en"?"Licensing notes":"Зургийн эрхийн тэмдэглэл"}
          </a>
        </p>
      </footer>
    </div>
  );
}
