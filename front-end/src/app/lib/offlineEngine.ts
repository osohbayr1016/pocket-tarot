import { createContextualReading, type ReadingTopic } from "./readingIntelligence.ts";
import type { TarotCard } from "../data/tarotCards";
import type { TarotSpread } from "../data/tarotSpreads";

/** Uniform integer in [0,max) using rejection sampling (no modulo bias). */
export function secureRandomInt(max: number): number {
  if (!Number.isSafeInteger(max) || max < 1 || max > 0x100000000) {
    throw new RangeError("Invalid random range");
  }
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure randomness requires HTTPS or localhost");
  }
  const range = 0x100000000;
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  let n: number;
  do {
    globalThis.crypto.getRandomValues(buffer);
    n = buffer[0];
  } while (n >= limit);
  return n % max;
}
export interface DrawnCard {
  card: TarotCard;
  position: number;
  isReversed: boolean;
  positionName: string;
  positionDescription: string;
}
/** Unbiased Fisher-Yates draw, unique cards, per-card reversal. */
export function drawSpread(
  cards: readonly TarotCard[],
  spread: TarotSpread,
  randomInt: (max: number) => number = secureRandomInt,
  options: {allowReversed?:boolean} = {}
): DrawnCard[] {
  if (!spread || spread.cardCount < 1 || spread.cardCount > cards.length ||
      spread.positions.length !== spread.cardCount) {
    throw new Error("Invalid spread or incomplete deck");
  }
  if (new Set(cards.map((card) => card.id)).size !== cards.length) {
    throw new Error("Deck contains duplicate cards");
  }
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    if (!Number.isInteger(j) || j < 0 || j > i) {
      throw new Error("Random number generator returned invalid index");
    }
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return spread.positions.map((position, index) => ({
    card: shuffled[index],
    position: position.position,
    positionName: position.name,
    positionDescription: position.description,
    isReversed: options.allowReversed===false ? false : randomInt(2) === 0,
  }));
}
export function interpretReading(
  drawn: readonly DrawnCard[],
  question = "",
  topic?: ReadingTopic
): string {
  return createContextualReading(drawn, question, topic);
}
export interface ZodiacSign {
  id: string;
  name: string;
  element: string;
  description: string;
}
export const zodiacSigns: readonly ZodiacSign[] = [
  {id:"capricorn",name:"Матар",element:"Шороо",description:"сахилга, хариуцлага"},
  {id:"aquarius",name:"Хумх",element:"Агаар",description:"шинэ санаа, хамтын зорилго"},
  {id:"pisces",name:"Загас",element:"Ус",description:"мэдрэмж, уран сэтгэмж"},
  {id:"aries",name:"Хонь",element:"Гал",description:"санаачилга, зориг"},
  {id:"taurus",name:"Үхэр",element:"Шороо",description:"тогтвортой байдал, тэвчээр"},
  {id:"gemini",name:"Ихэр",element:"Агаар",description:"харилцаа, суралцах хүсэл"},
  {id:"cancer",name:"Мэлхий",element:"Ус",description:"халамж, гэр бүлийн үнэ цэн"},
  {id:"leo",name:"Арслан",element:"Гал",description:"бүтээлч байдал, өөрийгөө илэрхийлэх"},
  {id:"virgo",name:"Охин",element:"Шороо",description:"нарийн нягт байдал, үйлчлэх"},
  {id:"libra",name:"Жинлүүр",element:"Агаар",description:"зохицол, шударга сонголт"},
  {id:"scorpio",name:"Хилэнц",element:"Ус",description:"гүн мэдрэмж, өөрчлөлт"},
  {id:"sagittarius",name:"Нум",element:"Гал",description:"эрэл хайгуул, суралцах"},
];
const signBoundaries: [number, number, number][] = [
  [1,20,1],[2,19,2],[3,21,3],[4,20,4],[5,21,5],[6,21,6],
  [7,23,7],[8,23,8],[9,23,9],[10,23,10],[11,22,11],[12,22,0]
];
export function isValidMonthDay(month: number, day: number, year = 2000): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day)) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28,31,30,31,30,31,31,30,31,30,31];
  return day >= 1 && day <= monthDays[month - 1];
}
/** Conventional tropical sun-sign date ranges; cusp can depend on year/time. */
export function zodiacFromMonthDay(month: number, day: number): ZodiacSign | null {
  if (!isValidMonthDay(month, day)) return null;
  const code = month * 100 + day;
  let index = 0;
  for (const [m,d,sign] of signBoundaries) {
    if (code >= m * 100 + d) index = sign;
  }
  return zodiacSigns[index];
}
export function zodiacFromISODate(value: string): ZodiacSign | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (!isValidMonthDay(month, day, year)) return null;
  return zodiacFromMonthDay(month, day);
}
export function getHoroscopeLocal(signId: string, birthDate = ""): string {
  const sign = zodiacSigns.find((entry) => entry.id === signId);
  if (!sign) throw new Error("Зурхайн орд сонгоно уу.");
  if (birthDate) {
    const derived = zodiacFromISODate(birthDate);
    if (!derived) throw new Error("Төрсөн огноо буруу байна.");
    if (derived.id !== sign.id) throw new Error("Сонгосон орд төрсөн огноотой таарахгүй байна.");
  }
  return sign.name + " (" + sign.element + ")\n\nУламжлалт зурхайд " +
    sign.description + " гэсэн бэлгэдлээр тайлбарладаг.\n\n" +
    "Өнөөдрийн эргэцүүлэл: өөрт чухал нэг зорилго, түүнд хүрэх бодит нэг алхмаа бичээрэй.\n\n" +
    "Энэ нь ордын уламжлалт ерөнхий тайлбар бөгөөд хувийн одон орны байрлалын тооцоо, эсвэл баттай таамаглал биш.";
}
function hashText(text: string): number {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  }
  return value >>> 0;
}
export function getDailyFortuneLocal(
  month: number, day: number, date = new Date()
): { fortune: string; luckyNumbers: number[]; luckyColors: string[]; luckyDirections: string[] } {
  const sign = zodiacFromMonthDay(month, day);
  if (!sign) throw new Error("Төрсөн сар, өдөр буруу байна.");
  const localDate = [date.getFullYear(), date.getMonth()+1, date.getDate()].join("-");
  const seed = hashText(localDate + ":" + month + ":" + day);
  const themes = [
    "Нэг чухал ажлаа дуусгахад төвлөр.",
    "Бусдыг анхааралтай сонсож, ойлголтоо шалга.",
    "Шинэ санаагаа жижиг туршилтаар эхлүүл.",
    "Өөрийн эрүүл хил хязгаар, амралтаа бод.",
    "Урт хугацааны зорилгоо нэг алхмаар урагшлуул.",
  ];
  const colors = ["Хөх","Ногоон","Алтлаг","Нил ягаан","Улаан","Цагаан"];
  const directions = ["Хойд","Өмнөд","Зүүн","Баруун"];
  const fortune = sign.name + " орд — өдрийн эргэцүүлэл\n\n" +
    themes[seed % themes.length] + "\n\nУламжлалт зурхайн бэлгэдлээр " +
    sign.description + " сэдэвтэй холбон бодож болно. Энэ нь ирээдүйн баттай таамаглал биш.";
  return {
    fortune,
    luckyNumbers: [((seed >>> 0) % 49) + 1, ((seed >>> 8) % 49) + 1, ((seed >>> 16) % 49) + 1],
    luckyColors: [colors[seed % colors.length]],
    luckyDirections: [directions[(seed >>> 3) % directions.length]],
  };
}
export function getLifeGuidanceLocal(
  birthDate: string, situation: string, goals = "", challenges = "", questions = ""
): string {
  const sign = zodiacFromISODate(birthDate);
  if (!sign) throw new Error("Зөв төрсөн огноо оруулна уу.");
  if (!situation.trim()) throw new Error("Одоогийн нөхцөлөө бичнэ үү.");
  return "Өөрийгөө эргэцүүлэх удирдамж\n\n" +
    "• Одоогийн нөхцөл: " + situation.trim().slice(0, 280) + "\n" +
    "• Зорилго: " + (goals.trim().slice(0, 200) || "Тодорхойлоогүй") + "\n" +
    "• Саад: " + (challenges.trim().slice(0, 200) || "Тодорхойлоогүй") + "\n" +
    "• Асуулт: " + (questions.trim().slice(0, 200) || "Одоохондоо алга") + "\n\n" +
    "Алхам 1: Зорилгоо хэмжиж болох жижиг хэсэгт хуваа.\n" +
    "Алхам 2: Саадыг баримт, таамаглал гэж ялга.\n" +
    "Алхам 3: Энэ долоо хоногт хийх нэг үйлдэл сонго.\n\n" +
    "Орд: " + sign.name + ". Энэ тайлбар нь уламжлалт бэлгэдэл, хувийн онош эсвэл ирээдүйн баталгаа биш.";
}
/**
 * Transparent symbolic dictionary. Matching phrases are clues for reflection,
 * not psychological diagnosis, scientifically verified meanings or prophecies.
 */
const DREAM_SYMBOLS: readonly [RegExp,string][] = [
  [/\b(?:water|river|ocean)\b|далай|усанд|голын|усан|нуур|горхи/iu,"Ус: мэдрэмж, урсгал эсвэл өөрчлөлт"],
  [/гал|шатах|дөл|түймэр|утах/iu,"Гал: эрч хүч, уур, анхаарах шаардлагатай өөрчлөлт"],
  [/нисэх|нисэж|нислээ|дүүл|үүл|тэнгэр/iu,"Нисэх/тэнгэр: эрх чөлөө, хүсэл мөрөөдөл"],
  [/байшин|гэртээ|өрөө|ордон|барилга/iu,"Гэр/байшин: аюулгүй байдал, хувийн орон зай"],
  [/машин|автобус|галт тэрэг|зам|жолоо|такси/iu,"Зам/тээвэр: шийдвэрийн чиглэл, хөдөлгөөн"],
  [/хөөж|хөөгдөж|зугтаж|гүйж|зугтаах/iu,"Хөөгдөх/зугтах: дарамтаас зайлсхийх эсвэл тайлагдаагүй асуудал"],
  [/унаж|унах|өндрөөс|хальтир|савж/iu,"Унах: тогтвортой байдал, хяналтын тухай бодол"],
  [/шүд|соёо|амнаас/iu,"Шүд: өөртөө итгэх, дүр төрх, өөрчлөлтийн тухай санаа"],
  [/могой|мэлхий|хорхой/iu,"Мөлхөгч: болгоомжлол, үл мэдэгдэх нөхцөл"],
  [/нохой|гөлөг/iu,"Нохой: нөхөрлөл, итгэл, хамгаалалт"],
  [/муур|зулзага/iu,"Муур: бие даах, дотоод мэдрэмж"],
  [/шувуу|болжмор|бүргэд/iu,"Шувуу: шинэ өнцөг, эрх чөлөө"],
  [/морь|адуу/iu,"Морь: хөдөлгөөн, тэнхээ, урагшлах хүсэл"],
  [/өндөр уул|ууланд|хад|хясаа/iu,"Уул: сорилт, том зорилго"],
  [/ой мод|ойгоор|модон дунд|навч/iu,"Ой/мод: өсөлт, замаа олох үйл явц"],
  [/мөнгөө|мөнгө|зоос|түрийвч|алт/iu,"Мөнгө: нөөц, үнэ цэн, аюулгүй байдал"],
  [/шалгалт|сургууль|анги|багш|хичээл/iu,"Сургууль/шалгалт: суралцах, үнэлэгдэхтэй холбоотой мэдрэмж"],
  [/ажил|дарга|оффис|ширээ/iu,"Ажил: үүрэг, хүлээлт, өдөр тутмын дарамт"],
  [/хүүхэд|нялх|нярай|хүү|охин/iu,"Хүүхэд: халамж, шинэ эхлэл, хариуцлага"],
  [/хурим|гэрлэлт|сүй|хайртай/iu,"Харилцаа: дотно холбоо, хамтын амьдралын тухай бодол"],
  [/утас|мессеж|залгаж|дуудлага/iu,"Утас: мэдээлэл, холбоо тогтоох, хүлээлт"],
  [/түлхүүр|хаалга|цонх|нээгдэх/iu,"Хаалга/түлхүүр: боломж, хувийн хил"],
  [/толь|толинд|хөрөг/iu,"Толь: өөрийн дүр төрх, бусдад харагдах байдал"],
  [/харанхуй|сүүдэр|шөнө/iu,"Харанхуй: тодорхойгүй байдал, эргэлзээ"],
  [/гэрэл|нарлаг|нарны|гэгээ/iu,"Гэрэл: ойлголт тодрох, итгэл"],
  [/сарны|сартай|одод|одон/iu,"Сар/од: мөчлөг, төсөөлөл"],
  [/цас|мөсөн|хүйтэн/iu,"Цас/хүйтэн: түр завсарлага, зай авах"],
  [/бороо|шуурга|аянга/iu,"Бороо/шуурга: мэдрэмжийн эрчим, өөрчлөлт"],
  [/усанд жив|живж|живсэн/iu,"Живэх: хэт ачаалалтай мэдрэмж; өнөөдрийн тайван байдлыг эргэцүүл"],
  [/үхэл|үхэж|нас бар|оршуул|авс/iu,"Төгсгөл/үхлийн дүрслэл: шууд зөгнөл биш; өөрчлөлт ба алдагдлын тухай мэдрэмж"],
];
export function interpretDreamLocal(dream:string):string {
  const cleaned=dream.trim().slice(0,3000);
  if(!cleaned)throw new Error("Зүүдээ бичнэ үү.");
  const matches=DREAM_SYMBOLS.filter(([pattern])=>pattern.test(cleaned)).slice(0,8)
    .map(([,meaning])=>"• "+meaning);
  return [
    "Зүүдний бэлгэдлийн тэмдэглэл",
    matches.length?matches.join("\n"):"Тодорхой бэлгэдэл илрээгүй. Зүүдэн дэх хамгийн хүчтэй мэдрэмжээ тэмдэглээрэй.",
    "Эргэцүүлэх асуултууд:\n• Энэ зүүд ямар мэдрэмж төрүүлсэн бэ?\n• Сүүлийн өдрийн ямар үйл явдалтай төстэй байж болох вэ?\n• Ямар жижиг өөрчлөлт танд хэрэгтэй байна вэ?",
    "Эдгээр нь соёлын олон янзын бэлгэдлийн санал бөгөөд шинжлэх ухааны зөгнөл, онош биш."
  ].join("\n\n");
}
