import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, openSync, readSync, closeSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tarotCards } from "../src/app/data/tarotCards.ts";
import { tarotSpreads, getSpreadById } from "../src/app/data/tarotSpreads.ts";
import {
  drawSpread, interpretReading, secureRandomInt, zodiacFromISODate,
  zodiacFromMonthDay, isValidMonthDay, getHoroscopeLocal,
  getDailyFortuneLocal, getLifeGuidanceLocal, interpretDreamLocal
} from "../src/app/lib/offlineEngine.ts";

test("complete 78-card deck, unique identifiers and local image names",()=>{
  assert.equal(tarotCards.length,78);
  assert.equal(new Set(tarotCards.map(card=>card.id)).size,78);
  assert.equal(new Set(tarotCards.map(card=>card.image)).size,78);
  assert.equal(tarotCards.filter(card=>card.arcana==="major").length,22);
  assert.equal(tarotCards.filter(card=>card.arcana==="minor").length,56);
  for(const card of tarotCards){
    assert.ok(card.name && card.englishName && card.meaning && card.reversedMeaning);
    assert.ok(card.image.startsWith("/tarot/rws/"));
    const frontEndDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const imagePath = path.join(frontEndDir, "public", card.image);
    assert.ok(existsSync(imagePath), "Missing local image: " + card.image);
    assert.ok(statSync(imagePath).size > 10000, "Image is too small: " + card.image);
    const fd = openSync(imagePath, "r");
    const magic = Buffer.alloc(12);
    readSync(fd, magic, 0, 12, 0);
    closeSync(fd);
    assert.equal(magic.subarray(0,4).toString("ascii"), "RIFF", "Not a RIFF image: " + card.image);
    assert.equal(magic.subarray(8,12).toString("ascii"), "WEBP", "Not WebP: " + card.image);
  }
});
test("all spreads have ordered, complete positions",()=>{
  assert.equal(tarotSpreads.length,5);
  for(const spread of tarotSpreads){
    assert.equal(spread.positions.length,spread.cardCount);
    assert.deepEqual(spread.positions.map(p=>p.position),Array.from({length:spread.cardCount},(_,index)=>index+1));
    assert.ok(getSpreadById(spread.id));
  }
  assert.equal(getSpreadById("celtic-cross").cardCount,10);
});
test("Fisher-Yates deals unique cards and attaches spread positions",()=>{
  const spread = getSpreadById("celtic-cross");
  const drawn = drawSpread(tarotCards,spread,()=>0);
  assert.equal(drawn.length,10);
  assert.equal(new Set(drawn.map(entry=>entry.card.id)).size,10);
  assert.deepEqual(drawn.map(entry=>entry.position),spread.positions.map(entry=>entry.position));
  assert.ok(drawn.every(entry=>entry.isReversed));
  assert.match(interpretReading(drawn,"Миний ажил?"),/Миний ажил/);
  assert.match(interpretReading(drawn),/баттай таамагладаггүй/);
});
test("spread validation catches duplicate ids and invalid random index",()=>{
  const spread = getSpreadById("three-card");
  assert.throws(()=>drawSpread([...tarotCards.slice(0,77),tarotCards[0]],spread,()=>0),/duplicate/);
  assert.throws(()=>drawSpread(tarotCards,spread,(max)=>max),/invalid index/);
});
test("secure random returns numbers in bound",()=>{
  for(let i=0;i<50;i++){
    const n=secureRandomInt(78);
    assert.ok(n>=0 && n<78 && Number.isInteger(n));
  }
});
test("zodiac date boundaries and Gregorian validation",()=>{
  assert.equal(zodiacFromMonthDay(12,22)?.id,"capricorn");
  assert.equal(zodiacFromMonthDay(1,19)?.id,"capricorn");
  assert.equal(zodiacFromMonthDay(1,20)?.id,"aquarius");
  assert.equal(zodiacFromMonthDay(3,20)?.id,"pisces");
  assert.equal(zodiacFromMonthDay(3,21)?.id,"aries");
  assert.equal(zodiacFromMonthDay(6,20)?.id,"gemini");
  assert.equal(zodiacFromMonthDay(6,21)?.id,"cancer");
  assert.equal(zodiacFromISODate("2024-02-29")?.id,"pisces");
  assert.equal(zodiacFromISODate("2025-02-29"),null);
  assert.equal(zodiacFromISODate("2025-04-31"),null);
  assert.equal(isValidMonthDay(2,29,1900),false);
  assert.equal(isValidMonthDay(2,29,2000),true);
});
test("horoscope is local, validates mismatched sign",()=>{
  assert.match(getHoroscopeLocal("aries","2000-03-24"),/Хонь/);
  assert.throws(()=>getHoroscopeLocal("aries","2000-05-24"),/таарахгүй/);
  assert.throws(()=>getHoroscopeLocal("nonesuch"),/сонгоно/);
});
test("daily reflections are deterministic by local calendar date",()=>{
  const date = new Date(2026,10,13,9);
  const a = getDailyFortuneLocal(4,15,date);
  const b = getDailyFortuneLocal(4,15,date);
  assert.deepEqual(a,b);
  assert.equal(a.luckyNumbers.length,3);
  assert.throws(()=>getDailyFortuneLocal(4,31,date),/буруу/);
});
test("life guidance and dream outputs are explicit, not predictive",()=>{
  assert.match(getLifeGuidanceLocal("2000-04-15","Суралцаж байна","Төсөл хийх"),/Алхам 1/);
  assert.throws(()=>getLifeGuidanceLocal("2025-02-29","Ажил"),/огноо/);
  assert.match(interpretDreamLocal("Далайд сэлж байна"),/Ус/);
  assert.match(interpretDreamLocal("Зүүдэндээ ном уншсан"),/Тодорхой/);
  assert.throws(()=>interpretDreamLocal("  "),/бич/);
});
