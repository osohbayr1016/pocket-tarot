import {parseCompleteBackup,BACKUP_FORMAT} from "../src/app/lib/offlineBackup.ts";
import {calculateReadingStats} from "../src/app/lib/readingStats.ts";
import {normalizeReadingPreferences} from "../src/app/lib/readingPreferences.ts";
import {convertLegacyReadings} from "../src/app/lib/legacyMigration.ts";
import {parseSavedSpreads,savedToSpread} from "../src/app/lib/savedCustomSpreads.ts";
import { OFFLINE_CITIES, resolveLocalTime } from "../src/app/lib/astroTimeZone.ts";
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

test("offline city presets have valid unique IANA zones and coordinates",()=>{
  assert.ok(OFFLINE_CITIES.length>=10);
  assert.equal(new Set(OFFLINE_CITIES.map(city=>city.id)).size,OFFLINE_CITIES.length);
  for(const city of OFFLINE_CITIES){
    assert.ok(Math.abs(city.latitude)<=90);
    assert.ok(Math.abs(city.longitude)<=180);
    assert.doesNotThrow(()=>new Intl.DateTimeFormat("en-US",{timeZone:city.timeZone}));
  }
});
test("IANA timezone adjusts historical local time for standard/DST offsets",()=>{
  assert.equal(resolveLocalTime("2024-01-15","12:00","America/New_York").toISOString(),
    "2024-01-15T17:00:00.000Z");
  assert.equal(resolveLocalTime("2024-07-15","12:00","America/New_York").toISOString(),
    "2024-07-15T16:00:00.000Z");
  assert.equal(resolveLocalTime("2024-11-01","10:00","Asia/Ulaanbaatar").toISOString(),
    "2024-11-01T02:00:00.000Z");
  assert.equal(resolveLocalTime("2024-07-01","12:00","Europe/London").toISOString(),
    "2024-07-01T11:00:00.000Z");
});
test("DST folds and gaps never silently guess user birth time",()=>{
  assert.throws(()=>resolveLocalTime("2024-03-10","02:30","America/New_York"),/байхгүй/);
  assert.throws(()=>resolveLocalTime("2024-11-03","01:30","America/New_York"),/давтагдсан/);
  assert.equal(parseBirthUTC({birthDate:"2024-07-15",birthTime:"12:00",timeZone:"America/New_York",
    latitude:40.71,longitude:-74.0}).toISOString(),"2024-07-15T16:00:00.000Z");
});
test("journal rejects truncation and duplicated imported card IDs",()=>{
  const reading={id:"a",date:"2024-03-20T09:00:00.000Z",spread:"3 cards",
    question:"",notes:"",reading:"Interpretation",cards:[
      {id:1,reversed:false,position:1},{id:1,reversed:true,position:2}
    ]};
  assert.equal(parseReadings([reading]).length,0);
});

test("saved custom spread serialization validates card labels and template IDs",()=>{
  const saved={id:"custom-1234",name:"Миний долоо хоног",labels:["Зорилго","Саад","Дараагийн алхам"]};
  const parsed=parseSavedSpreads([saved]);
  assert.equal(parsed.length,1);
  assert.equal(savedToSpread(parsed[0]).positions[1].name,"Саад");
  assert.throws(()=>parseSavedSpreads([{...saved,labels:[]}]),/бүтэц/);
  assert.throws(()=>parseSavedSpreads([saved,saved]),/давхардсан/);
  assert.throws(()=>parseSavedSpreads(Array.from({length:21},()=>saved)),/сан/);
});
test("major arcana pairs include a transparent cross-card interpretation",()=>{
  const pair=[tarotCards[0],tarotCards[1]].map((card,i)=>({
    card,position:i+1,positionName:i===0?"Эхлэл":"Нөөц",
    positionDescription:"Хувийн эргэцүүлэл",isReversed:false
  }));
  const text=createContextualReading(pair,"Шинэ төсөл","career");
  assert.match(text,/Картын хослол/);
  assert.match(text,/Нөөц/);
  assert.match(text,/баттай таамагладаггүй/);
});

test("legacy account export conversion preserves only explicit local fields",()=>{
  const old={data:{readings:[{
    id:17,cardId:6,cardName:"The Lovers",cardMeaning:"Legacy text",
    question:"Миний асуулт",notes:"Old note",isFavorite:true,
    readingDate:"2024-05-02T13:40:00.000Z"
  }]}};
  const migrated=convertLegacyReadings(old);
  assert.equal(migrated.length,1);
  assert.equal(migrated[0].id,"legacy-17");
  assert.deepEqual(migrated[0].cards,[{id:6,reversed:false,position:1}]);
  assert.match(migrated[0].reading,/Legacy text/);
  assert.equal(migrated[0].favorite,true);
  assert.throws(()=>convertLegacyReadings({readings:[{id:"a",cardId:999,readingDate:"2024-05-02"}]}),/ID/);
  assert.throws(()=>convertLegacyReadings({readings:[{id:"b",cardId:1}]}),/огноо/);
});

test("upright-only preference never draws reversed cards",()=>{
  const spread=tarotSpreads.find(item=>item.cardCount===5);
  assert.ok(spread);
  const drawn=drawSpread(tarotCards,spread,()=>0,{allowReversed:false});
  assert.equal(drawn.length,5);
  assert.ok(drawn.every(card=>!card.isReversed));
  assert.equal(normalizeReadingPreferences({allowReversed:false,cardBack:"moon"}).allowReversed,false);
  assert.equal(normalizeReadingPreferences({cardBack:"other"}).cardBack,"star");
});

test("reading statistics stay local and handle favorites and repeated cards",()=>{
  const now=new Date("2024-11-15T00:00:00Z");
  const rows=[
    {id:"1",date:"2024-11-13T00:00:00Z",favorite:true,spread:"",reading:"",question:"",notes:"",
      cards:[{id:0,reversed:false,position:1},{id:1,reversed:false,position:2}]},
    {id:"2",date:"2024-07-01T00:00:00Z",favorite:false,spread:"",reading:"",question:"",notes:"",
      cards:[{id:0,reversed:true,position:1}]}
  ];
  const stats=calculateReadingStats(rows,now);
  assert.deepEqual([stats.total,stats.favorites,stats.distinctCards,stats.topCardId,stats.topCardDraws,stats.last30Days],
    [2,1,2,0,2,1]);
});

test("complete offline backup validates all journal/template/preferences before replacement",()=>{
  const valid={
    format:BACKUP_FORMAT,version:1,exportedAt:"2024-11-01T00:00:00Z",
    readings:[],spreads:[],preferences:{allowReversed:false,reduceMotion:true,cardBack:"moon"}
  };
  assert.equal(parseCompleteBackup(JSON.stringify(valid)).preferences.cardBack,"moon");
  assert.throws(()=>parseCompleteBackup(JSON.stringify({...valid,version:99})),/формат/);
  assert.throws(()=>parseCompleteBackup(JSON.stringify({...valid,preferences:{cardBack:"bad"}})),/preferences/);
  assert.throws(()=>parseCompleteBackup(JSON.stringify({...valid,readings:[{}]})),/уншилт/);
  assert.throws(()=>parseCompleteBackup(JSON.stringify({...valid,spreads:[{}]})),/дэлгэмэл|бүтэц/);
});
