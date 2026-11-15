"use client";
import type {CSSProperties, ReactNode} from "react";
import type {DrawnCard} from "../lib/offlineEngine";
import {Icon} from "./InterfaceIcon";
import {useLanguage} from "../lib/LanguageProvider";

export function cardFallback(event:React.SyntheticEvent<HTMLImageElement>){
  const image=event.currentTarget;
  if(!image.src.endsWith("/tarot/card-placeholder.svg"))image.src="/tarot/card-placeholder.svg";
}
function Compass(){
  return <svg aria-hidden="true" className="compass" viewBox="0 0 400 400" fill="none" stroke="currentColor">
    <circle cx="200" cy="200" r="182"/><circle cx="200" cy="200" r="176" strokeDasharray="1 5"/>
    <circle cx="200" cy="200" r="157"/><ellipse cx="200" cy="200" rx="85" ry="174" transform="rotate(-34 200 200)"/>
    <ellipse cx="200" cy="200" rx="85" ry="174" transform="rotate(34 200 200)"/>
    {Array.from({length:48},(_,i)=><path key={i} transform={"rotate("+i*7.5+" 200 200)"} d={i%4===0?"M200 18v17":"M200 18v6"}/>)}
  </svg>;
}
function CardBack(){return <span className="card-back-pattern" aria-hidden="true"><span className="moon-medallion">☾</span></span>;}
type StageProps={
  phase:"idle"|"shuffle"|"pick"|"read"; choices:number; active?:DrawnCard; visibleCount:number; total:number;
  onPick:(offset:number)=>void; onShuffle?:()=>void; children?:ReactNode;
};
export default function DeckTable({phase,choices,active,visibleCount,total,onPick,onShuffle,children}:StageProps){
  const en=useLanguage().locale==="en";
  return <div className={"table-column phase-"+phase}>
    <div className="felt" data-phase={phase}>
      <div className="felt-frame" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="felt-label"><span className="felt-rule"/>{en?"The reading table":"Уншлагын ширээ"}<span className="felt-rule"/></div>
      <Compass/>
      {phase==="idle"&&<button type="button" className="art-fan" disabled={!onShuffle} onClick={onShuffle} aria-label={en?"Shuffle the cards on the table":"Ширээн дээрх картыг холих"}>
        {["18_Moon","19_Sun","17_Star"].map((file,i)=><span key={file} className={"printed-card art-"+i}><img src={"/tarot/rws/"+file+".webp"} alt="" width="480" height="800" onError={cardFallback}/></span>)}
      </button>}
      {phase==="shuffle"&&<div className="riffle" aria-hidden="true">
        {Array.from({length:14},(_,i)=><div key={i} className="riffle-card" style={{
          "--side":i%2?1:-1,"--depth":Math.floor(i/2),"--lag":(i*19)+"ms", zIndex:i+1
        } as CSSProperties}><CardBack/></div>)}
      </div>}
      {phase==="pick"&&<div className="pick-fan" data-choices={choices} role="group" aria-label={en?"Face-down cards":"Доош харсан картууд"}>
        {Array.from({length:choices},(_,i)=><button type="button" className="pick-card" key={i} onClick={()=>onPick(i)}
          aria-label={en?"Choose card "+(i+1):"Ширээнээс "+(i+1)+"-р картыг сонгох"}
          style={{"--offset":i-(choices-1)/2,"--lift":Math.abs(i-(choices-1)/2),zIndex:i+1} as CSSProperties}>
          <CardBack/><span className="pick-number">{i+1}</span>
        </button>)}
      </div>}
      {phase==="read"&&active&&<div className="revealed-art" key={active.card.id}><div className="printed-card">
        <img src={active.card.image} alt={en?active.card.englishName:active.card.name} width="480" height="800" className={active.isReversed?"rotate-180":""} onError={cardFallback}/>
      </div></div>}
      <div className="felt-caption"><span aria-hidden="true">✧</span>
        {phase==="idle"?"Rider–Waite–Smith · 1909":phase==="shuffle"?(en?"Shuffling the deck…":"Картыг хольж байна…"):
          phase==="pick"?(en?"Choose a face-down card":"Доош харсан картуудаас нэгийг сонгоорой"):active?.card.englishName}
        <span aria-hidden="true">✧</span></div>
    </div>
    <div className="table-legend"><span className="legend-mark"><Icon name="star" size={15}/></span>
      <span>{phase==="idle"?(en?"Illustrated by Pamela Colman Smith":"Зураач Памела Колман Смит"):(en?"Your spread":"Таны дэлгэмэл")}</span>
      <span className="table-count" role="status">{phase==="idle"?(en?"78 cards":"78 карт"):visibleCount+" / "+total+(en?" cards revealed":" карт нээсэн")}</span>
    </div>{children}
  </div>;
}
