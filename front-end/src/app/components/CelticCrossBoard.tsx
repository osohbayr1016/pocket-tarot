"use client";
import type {DrawnCard} from "../lib/offlineEngine";
/**
 * Classical Celtic Cross: 1 central / 2 crossing / 3 above / 4 below /
 * 5 past left / 6 future right / 7-10 ascending staff on the right.
 * The scrollable spatial diagram has an equally usable ordered text list.
 */
const slots:Record<number,{left:number;top:number;rotate?:boolean}> = {
  1:{left:30,top:43}, 2:{left:30,top:43,rotate:true},
  3:{left:30,top:15}, 4:{left:30,top:71},
  5:{left:10,top:43}, 6:{left:50,top:43},
  7:{left:80,top:80}, 8:{left:80,top:59},
  9:{left:80,top:38}, 10:{left:80,top:17},
};
interface Props {
  cards:readonly DrawnCard[];
  visibleCount:number;
  onReveal:()=>void;
}
export default function CelticCrossBoard({cards,visibleCount,onReveal}:Props){
  const revealed=(position:number)=>position<=visibleCount;
  return <section aria-label="Келтийн загалмай — 10 картын байрлал">
    <p className="mb-3 text-center text-xs leading-6 text-slate-300">
      Загалмай — зүүн талд, 7–10 картын босоо багана — баруун талд. Гар утаснаас хэвтээ гүйлгэн харж болно.
    </p>
    <div tabIndex={0} role="region" aria-label="Келтийн загалмайн визуал байршил, хэвтээ гүйлгэх"
      className="overflow-x-auto rounded-2xl border border-amber-300/25 bg-[#181329] p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
      <div className="relative mx-auto h-[710px] min-w-[680px] max-w-[780px]" aria-hidden="true">
        <div className="absolute left-[8%] top-[9%] h-[68%] w-[55%] rounded-full border border-amber-300/10"/>
        <div className="absolute bottom-[8%] right-[8%] h-[87%] w-px bg-amber-300/15"/>
        {cards.map((item,index)=>{
          const pos=slots[item.position];
          if(!pos)return null;
          const shown=revealed(item.position);
          const isNext=index===visibleCount;
          return <div key={item.position}
            style={{left:pos.left+"%",top:pos.top+"%",zIndex:item.position===2?12:shown?2:1}}
            className="absolute w-[105px] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className={"relative mx-auto h-[125px] w-[77px] overflow-hidden rounded-md border-2 shadow-xl "+
              (shown?"border-amber-200/70 bg-[#f5e6c4]":"border-amber-400/40 bg-[#2b2443]")+
              (pos.rotate?" rotate-90":"")}>
              {shown?
                <img src={item.card.image} width={77} height={125}
                  alt="" className={"h-full w-full object-cover "+(item.isReversed?"rotate-180":"")}/>:
                <div className="flex h-full items-center justify-center font-serif text-3xl text-amber-300">✦</div>}
            </div>
            {!pos.rotate&&<span className="mt-1 block truncate text-xs font-semibold text-amber-100">
              {item.position}. {item.positionName}
            </span>}
            {pos.rotate&&<span className="mt-2 block text-xs font-semibold text-amber-100">
              2. Хөндлөн
            </span>}
            {isNext&&<span className="mt-1 block text-[10px] text-emerald-200">Дараагийн карт</span>}
          </div>;
        })}
      </div>
    </div>
    <h4 className="mt-7 text-center font-serif text-lg text-amber-100">Картуудын утга ба нээх дараалал</h4>
    <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((item,index)=>{
        const shown=index<visibleCount;
        const next=index===visibleCount;
        return <li key={item.position} className={"rounded-xl border p-4 text-sm "+
          (next?"border-amber-300/60 bg-amber-300/10":"border-white/10 bg-white/5")}>
          <p className="font-semibold text-amber-100">{item.position}. {item.positionName}</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{item.positionDescription}</p>
          {shown?
            <p className="mt-2 text-slate-100">{item.card.name}{item.isReversed?" — урвуу":" — эгц"}</p>:
            <button type="button" disabled={!next} onClick={onReveal}
              aria-label={item.position+". "+item.positionName+" картыг нээх"}
              className="mt-3 min-h-11 rounded-full border border-amber-300/40 px-4 py-2 text-xs text-amber-100 disabled:opacity-50">
              {next?"Энэ картыг нээх":"Өмнөх картыг эхлээд нээнэ"}
            </button>}
        </li>;
      })}
    </ol>
  </section>;
}
