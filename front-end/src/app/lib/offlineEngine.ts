import { createContextualReading, type ReadingTopic } from "./readingIntelligence";
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
  randomInt: (max: number) => number = secureRandomInt
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
    isReversed: randomInt(2) === 0,
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
export function interpretDreamLocal(dream: string): string {
  const cleaned = dream.trim();
  if (!cleaned) throw new Error("Зүүдээ бичнэ үү.");
  const symbols: [RegExp, string][] = [
    [/ус|далай|гол|бороо/iu,"Ус нь зарим уламжлалд мэдрэмж, өөрчлөлтийг бэлгэддэг."],
    [/нис|тэнгэр|үүл/iu,"Нисэх нь эрх чөлөө, шинэ өнцөг олох хүслийг санагдуулж болно."],
    [/байшин|гэр|өрөө/iu,"Гэр нь аюулгүй байдал, хувийн орон зайтай холбогдож болно."],
    [/зам|машин|автобус|галт тэрэг/iu,"Зам нь өөрчлөлт, шийдвэрийн бэлгэдэл байж болно."],
    [/хөө|гүй|зугт/iu,"Хөөгдөх мэт үйл явдал нь стресс, зайлсхийж буй асуудлыг эргэцүүлэх шалтаг болж болно."],
  ];
  const matched = symbols.filter(([re]) => re.test(cleaned)).map(([,meaning])=>meaning);
  return "Таны зүүдийн тухай эргэцүүлэл\n\n" +
    (matched.length ? matched.join("\n\n") : "Тодорхой нийтлэг бэлгэдэл илрээгүй. Зүүдний хамгийн хүчтэй мэдрэмж болон бодит амьдралтай холбоог өөрөө тэмдэглээрэй.") +
    "\n\nБодож үзэх асуулт: Энэ зүүдийг санахад ямар мэдрэмж төрж байна вэ?\n\n" +
    "Зүүдийг бодит ирээдүйн зөгнөл, онош гэж үзэх боломжгүй.";
}
