"use client";
import {useEffect,useRef,useState} from "react";
import type {TarotCard} from "../data/tarotCards";
import {useLanguage} from "../lib/LanguageProvider";
import {englishCardMeaning} from "../lib/englishTarot";
import {englishAstroBody,englishAstroSign} from "../lib/astroLocale";
import {Icon} from "./InterfaceIcon";
import {cardFallback} from "./DeckTable";

interface Props {card:TarotCard;onClose:()=>void;onPrevious?:()=>void;onNext?:()=>void}
const elements:Record<string,string>={"Гал":"Fire","Ус":"Water","Агаар":"Air","Шороо":"Earth"};
const suits={Wands:"Саваа",Cups:"Хундага",Swords:"Сэлэм",Pentacles:"Зоос"};
export default function CardDetailsDialog({card,onClose,onPrevious,onNext}:Props){
  const en=useLanguage().locale==="en";
  const dialog=useRef<HTMLDialogElement>(null);
  const close=useRef<HTMLButtonElement>(null);
  const content=useRef<HTMLDivElement>(null);
  const [reversed,setReversed]=useState(false);
  useEffect(()=>{
    const el=dialog.current;
    const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    el?.showModal();
    document.body.style.overflow="hidden";close.current?.focus();
    return ()=>{el?.close();document.body.style.overflow=overflow;opener?.focus({preventScroll:true});};
  },[]);
  useEffect(()=>{content.current?.scrollTo({top:0,behavior:"instant"});},[card.id]);
  const arcana=card.arcana==="major"?(en?"Major Arcana":"Их Аркан"):(en?"Minor Arcana":"Бага Аркан");
  const info=[
    [en?"Element":"Элемент",en?elements[card.element]:card.element],
    [en?"Number":"Тоо",String(card.numerology)],
    ...(card.suit?[[en?"Suit":"Бүлэг",en?card.suit:suits[card.suit]]]:[]),
    ...(card.planet?[[en?"Planet":"Гараг",en?englishAstroBody(card.planet):card.planet]]:[]),
    ...(card.astrologicalSign?[[en?"Zodiac sign":"Орд",en?englishAstroSign(card.astrologicalSign):card.astrologicalSign]]:[]),
  ];
  return <dialog ref={dialog} className="card-dialog" aria-labelledby="card-dialog-title"
    onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="dialog-sheet"><header className="dialog-top"><span><Icon name="book" size={17}/>{en?"Card library":"Картын сан"}</span>
      <button ref={close} type="button" className="round-control" aria-label={en?"Close":"Хаах"} onClick={onClose}><Icon name="close" size={18}/></button></header>
      <div className="dialog-content" ref={content}><div className="detail-art"><div className="printed-card" key={card.id}>
        <img src={card.image} alt={en?card.englishName:card.name} width="480" height="800" className={reversed?"rotate-180":""} onError={cardFallback}/></div></div>
        <article className="detail-text" aria-live="polite"><div className="panel-kicker">{arcana}</div>
          <h2 id="card-dialog-title">{en?card.englishName:card.name}</h2>{!en&&<p className="alternate-name" lang="en">{card.englishName}</p>}
          <div className="orientation-switch" role="group" aria-label={en?"Orientation":"Картын байрлал"}>
            {[false,true].map(r=><button type="button" key={String(r)} aria-pressed={r===reversed} onClick={()=>setReversed(r)}>{r?(en?"Reversed":"Урвуу"):(en?"Upright":"Эгц")}</button>)}
          </div>
          <p className="detail-meaning">{en?englishCardMeaning(card,reversed):reversed?card.reversedMeaning:card.meaning}</p>
          {!en&&card.arcana==="major"&&<p className="detail-keywords">{card.keywords.join(" · ")}</p>}
          <dl className="facts">{info.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </article>
      </div>
      <nav className="dialog-nav" aria-label={en?"Browse matching cards":"Шүүсэн картууд"}>
        <button type="button" disabled={!onPrevious} onClick={onPrevious}><span aria-hidden="true">←</span> {en?"Previous card":"Өмнөх карт"}</button>
        <button type="button" disabled={!onNext} onClick={onNext}>{en?"Next card":"Дараагийн карт"} <span aria-hidden="true">→</span></button>
      </nav>
    </div>
  </dialog>;
}
