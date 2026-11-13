import type { TarotSpread } from "../data/tarotSpreads";

/**
 * Create a bounded custom spread while preserving deterministic positions.
 * These are user-authored labels, not claims about past or future events.
 */
export function makeCustomSpread(
  count:number,
  labels:readonly string[],
):TarotSpread {
  if(!Number.isInteger(count)||count<1||count>12) {
    throw new RangeError("Custom spread must have 1–12 cards");
  }
  const positions = Array.from({length:count},(_,index)=>{
    const safe = String(labels[index]??"").trim().replace(/\s+/g," ").slice(0,60);
    return {
      position:index+1,
      name:safe||String(index+1)+"-р карт",
      description:"Энэ байрлалтай холбоотой таны асуулт, өнцөг",
    };
  });
  return {
    id:"custom-"+count,
    name:"Миний "+count+" картын дэлгэмэл",
    description:"Өөрийн байрлал, сэдвээр зохиосон дэлгэмэл",
    category:"general",
    difficulty:count>6?"advanced":"intermediate",
    cardCount:count,
    positions
  };
}
