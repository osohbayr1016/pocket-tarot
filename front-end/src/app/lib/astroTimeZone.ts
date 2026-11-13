/**
 * Embedded city coordinates + IANA zones. Uses the browser/Node ICU timezone
 * database: no IP lookup, geolocation or third-party request.
 * Ambiguous/nonexistent local DST times are rejected, never guessed.
 */
export const OFFLINE_CITIES=[
  {id:"ulaanbaatar",label:"Улаанбаатар, Монгол",latitude:47.9185,longitude:106.9177,timeZone:"Asia/Ulaanbaatar"},
  {id:"darkhan",label:"Дархан, Монгол",latitude:49.4867,longitude:105.9228,timeZone:"Asia/Ulaanbaatar"},
  {id:"erdenet",label:"Эрдэнэт, Монгол",latitude:49.027,longitude:104.044,timeZone:"Asia/Ulaanbaatar"},
  {id:"khovd",label:"Ховд, Монгол",latitude:48.0056,longitude:91.6419,timeZone:"Asia/Hovd"},
  {id:"ulgii",label:"Өлгий, Монгол",latitude:48.969,longitude:89.963,timeZone:"Asia/Hovd"},
  {id:"tokyo",label:"Токио, Япон",latitude:35.6762,longitude:139.6503,timeZone:"Asia/Tokyo"},
  {id:"seoul",label:"Сөүл, БНСУ",latitude:37.5665,longitude:126.978,timeZone:"Asia/Seoul"},
  {id:"beijing",label:"Бээжин, Хятад",latitude:39.9042,longitude:116.4074,timeZone:"Asia/Shanghai"},
  {id:"london",label:"Лондон, Англи",latitude:51.5074,longitude:-0.1278,timeZone:"Europe/London"},
  {id:"paris",label:"Парис, Франц",latitude:48.8566,longitude:2.3522,timeZone:"Europe/Paris"},
  {id:"berlin",label:"Берлин, Герман",latitude:52.52,longitude:13.405,timeZone:"Europe/Berlin"},
  {id:"new-york",label:"Нью-Йорк, АНУ",latitude:40.7128,longitude:-74.006,timeZone:"America/New_York"},
  {id:"los-angeles",label:"Лос-Анжелес, АНУ",latitude:34.0522,longitude:-118.2437,timeZone:"America/Los_Angeles"},
  {id:"sydney",label:"Сидней, Австрали",latitude:-33.8688,longitude:151.2093,timeZone:"Australia/Sydney"},
] as const;
function partsAt(date:Date,zone:string){
  const fmt=new Intl.DateTimeFormat("en-US",{
    timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  });
  const items=fmt.formatToParts(date);
  const map=Object.fromEntries(items.map(part=>[part.type,part.value]));
  return [Number(map.year),Number(map.month),Number(map.day),Number(map.hour),Number(map.minute)];
}
/** Throws on missing/ambiguous local times (DST gap/fold) instead of guessing. */
export function resolveLocalTime(date:string,time:string,timeZone:string):Date {
  const dateParts=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeParts=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if(!dateParts||!timeParts)throw new Error("Төрсөн огноо, цаг буруу байна.");
  const [year,month,day]=dateParts.slice(1).map(Number);
  const [hour,minute]=timeParts.slice(1).map(Number);
  const naive=Date.UTC(year,month-1,day,hour,minute);
  const exact=new Date(naive);
  if(exact.getUTCFullYear()!==year||exact.getUTCMonth()+1!==month||exact.getUTCDate()!==day)
    throw new Error("Төрсөн огноо хүчингүй байна.");
  if(!/^[a-zA-Z_]+(?:\/[a-zA-Z_+-]+)+$/.test(timeZone))throw new Error("Time zone буруу байна.");
  const desired=[year,month,day,hour,minute];
  const offsets=new Set<number>();
  // Capture shifts surrounding the birth time; covers historic DST gaps/folds.
  for(const deltaHours of [-48,-36,-24,-12,0,12,24,36,48]){
    const sampled=naive+deltaHours*3600_000;
    const p=partsAt(new Date(sampled),timeZone);
    const localLike=Date.UTC(p[0],p[1]-1,p[2],p[3],p[4]);
    offsets.add((localLike-sampled)/60_000);
  }
  const candidates=new Set<number>();
  for(const offset of offsets){
    const millis=naive-offset*60_000;
    const actual=partsAt(new Date(millis),timeZone);
    if(actual.every((value,i)=>value===desired[i]))candidates.add(millis);
  }
  if(candidates.size===0)throw new Error("Энэ орон нутгийн цаг DST шилжилтийн улмаас байхгүй байна. Төрсөн цагаа шалгана уу.");
  if(candidates.size>1)throw new Error("Энэ цаг DST шилжилтийн үед 2 удаа давтагдсан. UTC offset-ийг гараар баталгаажуулна уу.");
  return new Date([...candidates][0]);
}
