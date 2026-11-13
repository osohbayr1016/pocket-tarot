import type { SavedReading } from "./readingHistory";
export interface ReadingStats{
  total:number;favorites:number;distinctCards:number;
  topCardId:number|null;topCardDraws:number;
  last30Days:number;
}
export function calculateReadingStats(readings:readonly SavedReading[],now=new Date()):ReadingStats{
  const counts=new Map<number,number>();
  let favorites=0,last30Days=0;
  for(const reading of readings){
    if(reading.favorite)favorites++;
    const timestamp=Date.parse(reading.date);
    if(Number.isFinite(timestamp)&&timestamp<=now.getTime()&&timestamp>=now.getTime()-30*86400_000)last30Days++;
    for(const item of reading.cards){
      counts.set(item.id,(counts.get(item.id)||0)+1);
    }
  }
  const top=[...counts].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];
  return {
    total:readings.length,
    favorites,distinctCards:counts.size,
    topCardId:top?.[0]??null,topCardDraws:top?.[1]??0,last30Days
  };
}
