"use client";
import { useEffect, useRef } from "react";
import type { TarotCard as TarotCardType } from "../data/tarotCards";
import TarotCard from "./TarotCard";
import {useLanguage} from "../lib/LanguageProvider";
import {englishCardMeaning} from "../lib/englishTarot";
interface Props {card:TarotCardType;onClose:()=>void}
export default function CardDetailsDialog({card,onClose}:Props){
  const {locale,t}=useLanguage();
  const contentRef=useRef<HTMLDivElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    closeRef.current?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();return;}
      if(event.key!=="Tab"||!contentRef.current)return;
      const focusable=Array.from(contentRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      ));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    window.addEventListener("keydown",onKey);
    return ()=>{
      window.removeEventListener("keydown",onKey);
      document.body.style.overflow=overflow;
      previous?.focus();
    };
  },[onClose]);
  return (
    <div role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4">
      <div ref={contentRef} role="dialog" aria-modal="true" aria-labelledby="card-dialog-title"
        className="relative my-auto max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-300/30 bg-[#1c172d] p-5 shadow-2xl sm:p-7">
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t("Хаах")}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-[#171127] px-4 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
          Хаах
        </button>
        <h2 id="card-dialog-title" className="mb-5 pt-9 text-center font-serif text-2xl text-amber-100">{locale==="en"?card.englishName:card.name}</h2>
        <div className="mx-auto max-w-52"><TarotCard card={card} isRevealed size="lg"/></div>
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <p><strong className="text-amber-200">Эгц:</strong> {locale==="en"?englishCardMeaning(card,false):card.meaning}</p>
          <p><strong className="text-amber-200">Урвуу:</strong> {locale==="en"?englishCardMeaning(card,true):card.reversedMeaning}</p>
          <p className="text-xs text-slate-400">{card.englishName} · {card.arcana==="major"?"Их Аркан":"Бага Аркан"}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {([
              ["Аркана",card.arcana==="major"?"Их Аркан":"Бага Аркан"],
              ["Элемент",card.element],
              ["Бүлэг",card.suit||"Их Аркан"],
              ["Уламжлалт тоо",String(card.numerology)],
              ...(card.planet?[["Холбоотой гараг",card.planet]]:[]),
              ...(card.astrologicalSign?[["Уламжлалт орд",card.astrologicalSign]]:[])
            ] as [string,string][]).map(([label,value])=>(
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 font-medium text-amber-100">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {card.keywords.map(keyword=><span key={keyword} className="rounded-full border border-amber-300/25 px-3 py-1 text-xs text-amber-100">{keyword}</span>)}
          </div>
          <p className="text-xs leading-5 text-slate-400">
            Орд/гараг/элементийн холбоос нь уламжлалт Tarot correspondences, шинжлэх ухааны зөгнөл биш.
          </p>

        </div>
      </div>
    </div>
  );
}
