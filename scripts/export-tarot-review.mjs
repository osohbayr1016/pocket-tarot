#!/usr/bin/env node
/**
 * Generates a 78-card bilingual editorial-review CSV from the canonical deck.
 * Run: node --experimental-strip-types scripts/export-tarot-review.mjs [output.csv]
 * Status is deliberately PENDING for each card: auto-tests cannot sign off meanings.
 */
import {writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {tarotCards} from "../front-end/src/app/data/tarotCards.ts";
import {englishCardMeaning} from "../front-end/src/app/lib/englishTarot.ts";
const output=resolve(process.argv[2]||"tarot-editorial-review.csv");
const titles=["Card ID","Arcana","Suit","Name (MN)","Name (EN)","Upright (MN)","Reversed (MN)",
  "Upright (EN)","Reversed (EN)","Keywords","Element","Reviewer status","Reviewer notes"];
function safeCsv(value){
  const text=String(value??"").replace(/\r/g," ").replace(/\n/g," ");
  // Prevent Excel/Sheets CSV formula injection if data changes in the future.
  const safe=/^[\t\s]*[=+@-]/.test(text)?"'"+text:text;
  return '"'+safe.replace(/"/g,'""')+'"';
}
if(tarotCards.length!==78||new Set(tarotCards.map(c=>c.id)).size!==78)
  throw new Error("Expected 78 unique cards before review export");
const rows=tarotCards.map(c=>[
  c.id,c.arcana,c.suit||"",c.name,c.englishName,c.meaning,c.reversedMeaning,
  englishCardMeaning(c,false),englishCardMeaning(c,true),c.keywords.join("; "),c.element,
  "PENDING",""
]);
writeFileSync(output,"\ufeff"+[titles,...rows].map(row=>row.map(safeCsv).join(",")).join("\n")+"\n",{encoding:"utf8"});
console.log("Prepared editorial review template for",rows.length,"cards; all statuses PENDING:",output);
