import {tarotCards} from "../data/tarotCards.ts";
import type {TarotSpread} from "../data/tarotSpreads.ts";
import type {DrawnCard} from "./offlineEngine.ts";
import type {ReadingTopic} from "./readingIntelligence.ts";

/** Only public card IDs and layout state are kept for this tab; not questions or notes. */
const KEY="pocket-tarot-active-reading-v1";
export type ActiveReading={
  spread:TarotSpread;
  drawn:DrawnCard[];
  visibleCount:number;
  topic:ReadingTopic|"auto";
};
const TOPICS=new Set(["auto","general","love","career","growth"]);
export function parseActiveReading(text:string):ActiveReading|null{
  try{
    if(text.length>20000)return null;
    const raw=JSON.parse(text);
    if(raw?.version!==1||!raw.spread||!Array.isArray(raw.cards))return null;
    const spread=raw.spread as TarotSpread;
    if(typeof spread.id!=="string"||spread.id.length>100
      ||typeof spread.name!=="string"||spread.name.length>100
      ||!Number.isInteger(spread.cardCount)||spread.cardCount<1||spread.cardCount>12
      ||!Array.isArray(spread.positions)||spread.positions.length!==spread.cardCount)return null;
    if(spread.positions.some((p,i)=>p?.position!==i+1
      ||typeof p.name!=="string"||p.name.length>100
      ||typeof p.description!=="string"||p.description.length>300))return null;
    if(raw.cards.length!==0&&raw.cards.length!==spread.cardCount)return null;
    const seen=new Set<number>();
    const drawn:DrawnCard[]=[];
    for(const [index,item] of raw.cards.entries()){
      if(!item||!Number.isInteger(item.id)||typeof item.reversed!=="boolean"||item.position!==index+1)return null;
      if(seen.has(item.id))return null;
      seen.add(item.id);
      const card=tarotCards.find(c=>c.id===item.id);
      const position=spread.positions[index];
      if(!card)return null;
      drawn.push({
        card,isReversed:item.reversed,position:position.position,
        positionName:position.name,positionDescription:position.description,
      });
    }
    if(!Number.isInteger(raw.visibleCount)||raw.visibleCount<0||raw.visibleCount>drawn.length)return null;
    if(!TOPICS.has(raw.topic))return null;
    return {spread,drawn,visibleCount:raw.visibleCount,topic:raw.topic};
  }catch{return null;}
}
export function loadActiveReading():ActiveReading|null{
  try{
    const text=sessionStorage.getItem(KEY);
    if(!text)return null;
    const data=parseActiveReading(text);
    if(!data)sessionStorage.removeItem(KEY);
    return data;
  }catch{return null;}
}
export function saveActiveReading(reading:ActiveReading|null):void{
  try{
    if(!reading){sessionStorage.removeItem(KEY);return;}
    sessionStorage.setItem(KEY,JSON.stringify({
      version:1,spread:reading.spread,visibleCount:reading.visibleCount,topic:reading.topic,
      cards:reading.drawn.map(item=>({id:item.card.id,reversed:item.isReversed,position:item.position})),
    }));
  }catch{/* Session storage may be disabled; card reading remains usable. */}
}
