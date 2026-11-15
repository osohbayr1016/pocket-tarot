"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { tarotCards, type TarotCard } from "./data/tarotCards";
import {useLanguage} from "./lib/LanguageProvider";
import TraditionalTarotReading from "./components/TraditionalTarotReading";
import NavigationMenu, {isSection, type Section} from "./components/NavigationMenu";
import ReadingGuide from "./components/ReadingGuide";
import {cardFallback} from "./components/DeckTable";

// Load secondary experiences on demand. The PWA build precaches all emitted
// JS chunks so first offline visits to these sections still work after install.
const loadingView=()=> <p role="status" className="py-12 text-center text-ink">Хэсгийг ачаалж байна...</p>;
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
  loading: () => <p role="status" className="py-12 text-center text-ink">Сарны календарь ачаалж байна...</p>,
});
const NatalChartPage = dynamic(() => import("./components/NatalChartPage"), {
  ssr: false,
  loading: () => <p role="status" className="py-12 text-center text-ink">Тэнгэрийн зураг ачаалж байна...</p>,
});



export default function Home() {
  const {locale}=useLanguage();
  const [section,setSection] = useState<Section>("reading");
  const [query,setQuery] = useState("");
  const [arcana,setArcana] = useState<"all"|"major"|"minor">("all");
  const [suit,setSuit] = useState<"all"|"Wands"|"Cups"|"Swords"|"Pentacles">("all");
  const [element,setElement] = useState<"all"|"Гал"|"Ус"|"Агаар"|"Шороо">("all");
  const [libraryCard,setLibraryCard] = useState<TarotCard|null>(null);
  useEffect(()=>{
    // Hydration-safe deep-link initialization; back/forward also restore sections.
    const readUrl=()=>{
      const params=new URLSearchParams(window.location.search);
      const candidate=params.get("view");
      setSection(isSection(candidate)?candidate:"reading");
      const id=params.get("card");
      setLibraryCard(candidate==="library"&&id!==null?tarotCards.find(card=>String(card.id)===id)??null:null);
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

  const navigate = (next: Section) => {
    const current=new URL(window.location.href);
    if(section!==next||libraryCard){
      current.searchParams.delete("card");
      current.hash="";
      current.searchParams.set("view",next);
      window.history.pushState({view:next},"",current.pathname+current.search+current.hash);
    }
    setSection(next);
    setLibraryCard(null);
    window.requestAnimationFrame(()=>{
      document.getElementById("main-content")?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:"instant"});
    });
  };
  function openCard(card:TarotCard,replace=false){
    const url=new URL(window.location.href);
    url.searchParams.set("view","library");url.searchParams.set("card",String(card.id));
    if(replace)window.history.replaceState(window.history.state,"",url);
    else window.history.pushState({cardFromLibrary:true},"",url);
    setLibraryCard(card);
  }
  function closeCard(){
    if(window.history.state?.cardFromLibrary){window.history.back();return;}
    const url=new URL(window.location.href);
    url.searchParams.delete("card");
    window.history.replaceState(window.history.state,"",url);
    setLibraryCard(null);
  }
  const cardIndex=libraryCard?filtered.findIndex(card=>card.id===libraryCard.id):-1;
  return (
    <div className="pocket-shell">
      <a href="#main-content" className="skip-link">{locale==="en"?"Skip to content":"Үндсэн агуулга руу очих"}</a>
      <NavigationMenu section={section} onNavigate={navigate}/>
      <main id="main-content" tabIndex={-1} className="site-main">
        {(section==="reading"||section==="single")&&<TraditionalTarotReading key={section} single={section==="single"}/>}
        {section==="guide"&&<ReadingGuide onNavigate={navigate}/>}
        {section==="library" && (
          <section className="mx-auto max-w-6xl">
            <header className="section-heading mb-8">

              <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">{locale==="en"?"78-card library":"78 картын сан"}</h1>
              <p className="mt-4 text-sm text-muted">{locale==="en"?"22 Major Arcana and 56 Minor Arcana. Select a card to explore its meaning.":"22 Их Аркан, 56 Бага Аркан. Карт дээр дарж утгыг нь үзнэ үү."}</p>
            </header>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
              <input type="search" aria-label={locale==="en"?"Search cards":"Карт хайх"} placeholder={locale==="en"?"Search cards by name...":"Картын нэрээр хайх..."} value={query}
                onChange={(event)=>setQuery(event.target.value)}
                className="w-full rounded-xl border border-rule bg-sheet px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-pine focus:outline-none sm:max-w-sm"/>
              <div className="flex flex-wrap gap-2" aria-label="Аркана шүүлтүүр">
                {(["all","major","minor"] as const).map((value)=>(
                  <button type="button" key={value} aria-pressed={arcana===value} onClick={()=>setArcana(value)}
                    className={"rounded-full px-4 py-2 text-sm " + (arcana===value?"bg-pine text-on-pine":"border border-rule text-ink")}>
                    {value==="all"?(locale==="en"?"All (78)":"Бүгд (78)"):value==="major"?(locale==="en"?"Major (22)":"Их Аркан (22)"):(locale==="en"?"Minor (56)":"Бага Аркан (56)")}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-rule bg-sheet p-4">
              <label className="flex-1 text-sm text-ink" htmlFor="library-suit">
                {locale==="en"?"Suit":"Бүлэг"}
                <select id="library-suit" value={suit} onChange={event=>setSuit(event.target.value as typeof suit)}
                  className="mt-2 block w-full min-w-36 rounded-lg border border-rule bg-sheet p-3 text-ink">
                  <option value="all">{locale==="en"?"All suits":"Бүх бүлэг"}</option>
                  <option value="Wands">{locale==="en"?"Wands":"Саваа (Wands)"}</option>
                  <option value="Cups">{locale==="en"?"Cups":"Хундага (Cups)"}</option>
                  <option value="Swords">{locale==="en"?"Swords":"Сэлэм (Swords)"}</option>
                  <option value="Pentacles">{locale==="en"?"Pentacles":"Зоос (Pentacles)"}</option>
                </select>
              </label>
              <label className="flex-1 text-sm text-ink" htmlFor="library-element">
                {locale==="en"?"Element":"Элемент"}
                <select id="library-element" value={element} onChange={event=>setElement(event.target.value as typeof element)}
                  className="mt-2 block w-full min-w-36 rounded-lg border border-rule bg-sheet p-3 text-ink">
                  <option value="all">{locale==="en"?"All elements":"Бүх элемент"}</option>
                  <option value="Гал">{locale==="en"?"Fire":"Гал"}</option>
                  <option value="Ус">{locale==="en"?"Water":"Ус"}</option>
                  <option value="Агаар">{locale==="en"?"Air":"Агаар"}</option>
                  <option value="Шороо">{locale==="en"?"Earth":"Шороо"}</option>
                </select>
              </label>
              <button type="button" onClick={()=>{
                setQuery("");setArcana("all");setSuit("all");setElement("all");
              }} className="min-h-11 rounded-full border border-rule px-4 py-2 text-sm text-ink">
                {locale==="en"?"Reset filters":"Шүүлтүүр цэвэрлэх"}
              </button>
              <p role="status" aria-live="polite" className="w-full text-xs text-muted">
                {locale==="en"?"Showing":"Нийт"} {filtered.length} / 78 {locale==="en"?"cards":"карт харагдаж байна."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((card)=>(
                <button type="button" key={card.id} onClick={()=>openCard(card)}
                  className="library-tile">
                  <div className="library-print">
                    <img src={card.image} onError={cardFallback}
                      alt={card.englishName} width={260} height={430} loading="lazy" className="h-full w-full object-contain"/>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold leading-snug text-ink">{locale==="en"?card.englishName:card.name}</h2>
                  <p className="mt-1 text-xs text-muted">{locale==="en"?card.arcana:card.englishName}</p>
                </button>
              ))}
            </div>
            {filtered.length===0&&<p className="mt-10 text-center text-sm text-muted">{locale==="en"?"No cards match these filters. Try resetting them.":"Шүүлтүүрт тохирох карт алга. Шүүлтүүрээ цэвэрлээд үзээрэй."}</p>}
            {libraryCard && <CardDetailsDialog card={libraryCard} onClose={closeCard}
              onPrevious={cardIndex>0?()=>openCard(filtered[cardIndex-1],true):undefined}
              onNext={cardIndex>=0&&cardIndex<filtered.length-1?()=>openCard(filtered[cardIndex+1],true):undefined}/>}
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
      <footer className="site-footer"><div><strong>Pocket Tarot</strong>
        <p>{locale==="en"?"Tarot imagery for personal reflection.":"Тарогийн бэлгэдлээр өөрийгөө эргэцүүлэх орон зай."}</p></div>
        <div className="footer-links"><Link href="/privacy">{locale==="en"?"Privacy":"Нууцлал"}</Link><Link href="/terms">{locale==="en"?"Terms":"Ашиглах нөхцөл"}</Link>
          <a href="https://github.com/osohbayr1016/pocket-tarot/blob/main/ARTWORK_PROVENANCE.md" target="_blank" rel="noopener noreferrer">{locale==="en"?"Artwork & credits":"Зураг ба эх сурвалж"}</a></div>
      </footer>
    </div>
  );
}
