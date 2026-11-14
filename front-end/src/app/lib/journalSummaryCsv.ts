import {tarotCards} from "../data/tarotCards.ts";
import type {SavedReading} from "./readingHistory.ts";

/**
 * Read-only, device-generated summary for spreadsheet analysis.
 * Never include free-text questions, interpretations, notes, tags or
 * custom-spread titles in the default CSV export.
 */
const HEADER=["Timestamp (UTC)","Cards","Card count","Reversed count","Favorite","Mood"];
const MOODS=new Set(["neutral","calm","hopeful","uncertain","anxious"]);
const cardNames=new Map(tarotCards.map(card=>[card.id,card.englishName]));

function cell(value:string|number):string{
  const raw=String(value);
  // Defensive CSV formula protection, even if future columns become editable.
  const safe=/^[\s]*[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export function formatJournalSummaryCsv(readings:readonly SavedReading[]):string{
  const lines=[HEADER.map(cell).join(",")];
  for(const reading of readings){
    const timestamp=new Date(reading.date);
    if(!Number.isFinite(timestamp.getTime()))throw new Error("Journal contains an invalid date; export was cancelled.");
    const cards=reading.cards.map(({id,reversed})=>{
      const name=cardNames.get(id);
      if(!name)throw new Error("Journal includes an unknown Tarot card; export was cancelled.");
      return name+(reversed?" (reversed)":"");
    });
    const mood=reading.mood&&MOODS.has(reading.mood)?reading.mood:"neutral";
    const columns=[
      timestamp.toISOString(),cards.join("; "),reading.cards.length,
      reading.cards.filter(card=>card.reversed).length,reading.favorite===true?"Yes":"No",mood
    ];
    lines.push(columns.map(cell).join(","));
  }
  return "\uFEFF"+lines.join("\r\n")+"\r\n";
}
