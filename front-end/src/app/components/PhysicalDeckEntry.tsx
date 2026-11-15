"use client";
import {useState} from "react";
import {tarotCards} from "../data/tarotCards";
import type {TarotSpread} from "../data/tarotSpreads";
import type {DrawnCard} from "../lib/offlineEngine";
import {buildPhysicalReading} from "../lib/physicalReading";
import {englishSpreadPosition} from "../lib/englishSpreads";
import {useLanguage} from "../lib/LanguageProvider";

export default function PhysicalDeckEntry({spread,onReady}:{spread:TarotSpread;onReady:(cards:DrawnCard[])=>void}){
  const en=useLanguage().locale==="en";
  const tr=(mn:string,english:string)=>en?english:mn;
  const [physicalSelections,setPhysicalSelections]=useState(()=>spread.positions.map(()=>({cardId:"",isReversed:false})));
  const [error,setError]=useState("");
  function startPhysicalReading(){
    if(physicalSelections.some(choice=>!choice.cardId)){
      setError(tr("Байрлал бүрт карт сонгоно уу.","Choose a card for every position."));return;
    }
    try{
      const cards=buildPhysicalReading(tarotCards,spread,physicalSelections.map(choice=>({...choice,cardId:Number(choice.cardId)})));
      setError("");onReady(cards);
    }catch(cause){
      const message=cause instanceof Error?cause.message:"Invalid card selection.";
      setError(!en&&message.includes("same physical card")?"Нэг картыг олон байрлалд давхар сонгох боломжгүй.":message);
    }
  }
  return (
              <details className="mt-5 text-left" id="physical-deck-entry">
                <summary className="min-h-11 cursor-pointer rounded-xl border border-rule px-4 py-3 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine">
                  {tr("Бодит карт ашиглах · Гараар оруулах","Using a physical deck? Enter drawn cards")}
                </summary>
                <p className="mt-3 text-xs leading-6 text-muted">
                  {tr("Бодит хөзрөөсөө татсан картыг байрлал бүрт сонгоорой. Нэг карт давхардаж болохгүй. Бүх мэдээлэл төхөөрөмж дээр үлдэнэ.","Select the cards you drew from your own deck, in position order. Each card can appear only once. Nothing leaves your device.")}
                </p>
                <div className="mt-3 space-y-3">
                  {spread.positions.map((position,index)=>(
                    <div key={position.position} className="rounded-xl border border-rule bg-sheet p-3">
                      <label htmlFor={"physical-card-"+index} className="block text-sm text-ink">
                        {position.position}. {en?englishSpreadPosition(spread,position.position).name:position.name}
                      </label>
                      <select id={"physical-card-"+index} value={physicalSelections[index]?.cardId??""}
                        onChange={event=>setPhysicalSelections(current=>current.map((choice,i)=>
                          i===index?{...choice,cardId:event.target.value}:choice))}
                        className="mt-2 w-full rounded-lg border border-rule bg-sheet p-3 text-sm text-ink">
                        <option value="">{tr("Карт сонгох","Choose a card")}</option>
                        <optgroup label={tr("Их Аркан","Major Arcana")}>
                          {tarotCards.filter(card=>card.arcana==="major").map(card=><option key={card.id} value={card.id}>
                            {en?card.englishName:card.name}
                          </option>)}
                        </optgroup>
                        {(["Wands","Cups","Swords","Pentacles"] as const).map(suit=>
                          <optgroup key={suit} label={suit}>
                            {tarotCards.filter(card=>card.suit===suit).map(card=><option key={card.id} value={card.id}>
                              {en?card.englishName:card.name}
                            </option>)}
                          </optgroup>)}
                      </select>
                      <label className="mt-3 flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" checked={physicalSelections[index]?.isReversed??false}
                          onChange={event=>setPhysicalSelections(current=>current.map((choice,i)=>
                            i===index?{...choice,isReversed:event.target.checked}:choice))}
                          className="h-4 w-4 accent-pine"/>
                        {tr("Урвуу карт","Reversed")}
                      </label>
                      {physicalSelections[index]?.cardId!==""&&tarotCards.some(card=>String(card.id)===physicalSelections[index]?.cardId)&&
                        <div className="mt-3 flex items-center gap-3 rounded-lg bg-paper p-2">
                          <img
                            src={tarotCards.find(card=>String(card.id)===physicalSelections[index]?.cardId)?.image}
                            alt=""
                            loading="lazy"
                            className={"h-20 w-12 rounded object-cover "+(physicalSelections[index]?.isReversed?"rotate-180":"")}
                          />
                          <span className="text-xs leading-5 text-ink">
                            {en?"Check the image and orientation against your deck.":"Зураг, байрлалыг бодит карттайгаа тулгаж шалгаарай."}
                          </span>
                        </div>}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={startPhysicalReading}
                  className="mt-4 w-full rounded-full border border-pine/50 px-6 py-3 text-sm font-semibold text-ink hover:bg-tint">
                  {tr("Сонгосон картуудыг унших","Read my selected cards")}
                </button>
                {error&&<p role="alert" className="mt-3 text-danger">{error}</p>}
              </details>
  );
}
