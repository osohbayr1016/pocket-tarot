import test from "node:test";
import assert from "node:assert/strict";
import { makeCustomSpread } from "../src/app/lib/customSpread.ts";
import { createContextualReading, detectReadingTopic } from "../src/app/lib/readingIntelligence.ts";
import { tarotCards } from "../src/app/data/tarotCards.ts";
import { tarotSpreads } from "../src/app/data/tarotSpreads.ts";
import { drawSpread } from "../src/app/lib/offlineEngine.ts";
import { parseReadings, importReadings } from "../src/app/lib/readingHistory.ts";
import {
  parseBirthUTC, calculateAscendant, computeNatalChart, calculateAspects,
} from "../src/app/lib/astroChart.ts";

test("topic detection uses transparent Mongolian/English tokens",()=>{
  assert.equal(detectReadingTopic("Хайр харилцааны тухай"),"love");
  assert.equal(detectReadingTopic("My salary and career"),"career");
  assert.equal(detectReadingTopic("Зорилго, хувийн хөгжил"),"growth");
  assert.equal(detectReadingTopic("Шинэ хүсэлт"),"general");
});
test("multi-card reading includes context and inter-card synthesis",()=>{
  const spread=tarotSpreads.find(item=>item.cardCount===3);
  const drawn=drawSpread(tarotCards,spread,()=>0);
  const text=createContextualReading(drawn,"Ажил карьер?", "career");
  assert.match(text,/Картуудын холбоо/);
  assert.match(text,/Дараагийн бодит алхам/);
  assert.match(text,/бодит мэдээл/);
  assert.match(text,/баттай таамагладаггүй/);
  assert.equal(text,createContextualReading(drawn,"Ажил карьер?","career"));
});
test("secure local journal rejects invalid or malicious imported schemas",()=>{
  assert.equal(parseReadings({}).length,0);
  assert.equal(parseReadings([{id:"valid",date:"2024-01-01",reading:"text",spread:"One",
    question:"",notes:"",cards:[{id:99,reversed:false,position:1}]}]).length,0);
  assert.throws(()=>importReadings("{}"),/JSON export/);
  assert.throws(()=>importReadings(JSON.stringify({format:"pocket-tarot-readings",version:2,readings:[]})),/JSON export/);
});
test("birth UTC offset arithmetic respects quarter-hour offsets",()=>{
  const utc=parseBirthUTC({birthDate:"2024-03-20",birthTime:"08:30",
    utcOffsetHours:8,latitude:47.9,longitude:106.9});
  assert.equal(utc.toISOString(),"2024-03-20T00:30:00.000Z");
  const unusual=parseBirthUTC({birthDate:"2024-03-20",birthTime:"09:15",
    utcOffsetHours:5.75,latitude:27.7,longitude:85.3});
  assert.equal(unusual.toISOString(),"2024-03-20T03:30:00.000Z");
  assert.throws(()=>parseBirthUTC({birthDate:"2025-02-29",birthTime:"08:30",
    utcOffsetHours:8,latitude:47.9,longitude:106.9}),/огноо/);
  assert.throws(()=>parseBirthUTC({birthDate:"2024-03-20",birthTime:"33:10",
    utcOffsetHours:8,latitude:47.9,longitude:106.9}),/цаг/);
  assert.throws(()=>parseBirthUTC({birthDate:"2024-03-20",birthTime:"10:00",
    utcOffsetHours:8,latitude:100,longitude:106.9}),/Өргөрөг/);
});
test("modern vernal equinox solar longitude is near zero degrees",()=>{
  const chart=computeNatalChart({birthDate:"2024-03-20",birthTime:"03:06",
    utcOffsetHours:0,latitude:0,longitude:0});
  const sun=chart.bodies.find(body=>body.name==="Нар");
  const angularDistance=Math.min(sun.longitude,360-sun.longitude);
  assert.ok(angularDistance<1, "Sun should be near 0 Aries at the equinox");
  assert.equal(chart.bodies.length,10);
  assert.equal(chart.houseSigns.length,12);
  assert.ok(chart.ascendant>=0&&chart.ascendant<360);
  assert.ok(chart.moonPhase>=0&&chart.moonPhase<360);
  assert.ok(chart.bodies.every(body=>body.house>=1&&body.house<=12));
});
test("ascendant and planetary aspects produce bounded geometry",()=>{
  for(const location of [{lat:47.9,lon:106.9},{lat:-33.9,lon:151.2},{lat:0,lon:0}]){
    const asc=calculateAscendant(new Date("2024-10-01T14:00:00Z"),location.lat,location.lon);
    assert.ok(Number.isFinite(asc)&&asc>=0&&asc<360);
  }
  const aspects=calculateAspects([
    {name:"A",longitude:0,latitude:0,sign:"",signDegree:0,house:1},
    {name:"B",longitude:90,latitude:0,sign:"",signDegree:0,house:1},
    {name:"C",longitude:180,latitude:0,sign:"",signDegree:0,house:1}
  ]);
  assert.ok(aspects.some(item=>item.type==="Квадрат"));
  assert.ok(aspects.some(item=>item.type==="Эсрэгцэл"));
});

test("custom spreads preserve 1–12 positions, labels and validation",()=>{
  const custom=makeCustomSpread(4,["Одоо","Боломж","  Саад  ",""]); 
  assert.equal(custom.cardCount,4);
  assert.deepEqual(custom.positions.map(p=>p.position),[1,2,3,4]);
  assert.equal(custom.positions[2].name,"Саад");
  assert.equal(custom.positions[3].name,"4-р карт");
  const reading=drawSpread(tarotCards,custom,()=>0);
  assert.equal(reading.length,4);
  assert.equal(new Set(reading.map(item=>item.card.id)).size,4);
  assert.throws(()=>makeCustomSpread(13,[]),RangeError);
  assert.throws(()=>makeCustomSpread(0,[]),RangeError);
});
