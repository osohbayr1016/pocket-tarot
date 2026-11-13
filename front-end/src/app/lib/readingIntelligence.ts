import type { DrawnCard } from "./offlineEngine";

export type ReadingTopic = "general" | "love" | "career" | "growth";
/**
 * Transparent, rule-based category detection. No AI, no unsupported inference.
 * Topic can be overridden by user; an unknown question stays general.
 */
export function detectReadingTopic(question: string): ReadingTopic {
  const text = question.toLocaleLowerCase().normalize("NFC");
  if (/\b(love|romance|relationship|partner|dating)\b|хайр|дурлал|харилцаа|найз залуу|найз охин|гэрлэлт|болзоо/i.test(text)) return "love";
  if (/\b(work|job|career|business|salary)\b|ажил|карьер|мэргэжил|цалин|бизнес|албан тушаал|сургууль/i.test(text)) return "career";
  if (/\b(growth|self|change|confidence|study)\b|хөгжил|өөрчлөлт|зорилго|сурах|итгэл|сэтгэл/i.test(text)) return "growth";
  return "general";
}
const topicAdvice: Record<ReadingTopic, {question:string; action:string}> = {
  general: {
    question:"Одоогийн нөхцөлдөө аль нөлөөг өөрчилж, алийг нь хүлээн зөвшөөрөх хэрэгтэй вэ?",
    action:"Нэг бодит баримт, нэг таамаглалаа ялгаж бичээд дараагийн бага алхмаа сонго."
  },
  love: {
    question:"Та өөрийн мэдрэмжийг ойлгомжтой илэрхийлж, нөгөө хүний хил хязгаарыг хүндэтгэж байна уу?",
    action:"Ямар нэг дүгнэлт хийхээс өмнө харилцагчтайгаа тайван, нээлттэй ярилц."
  },
  career: {
    question:"Та энэ шийдвэрт ямар мэдээлэл дутуу байгааг бодитоор шалгаж чадах вэ?",
    action:"Шийдвэрийн нэг шалгуур гаргаж, ажил/сургалтын боломжоо бодит мэдээллээр харьцуул."
  },
  growth: {
    question:"Танд одоо хамгийн хэрэгтэй жижиг өөрчлөлт юу вэ?",
    action:"Энэ долоо хоногт хийж дуусгах нэг хэмжигдэхүйц дадал сонго."
  }
};
const elementDescriptions: Record<string,string> = {
  "Гал": "санаачилга ба хүсэл тэмүүлэл",
  "Ус": "мэдрэмж ба харилцаа",
  "Агаар": "бодол ба шийдвэр",
  "Шороо": "бодит ажил ба тогтвортой байдал"
};
const elementPairAdvice: Record<string,string> = {
  "Агаар+Гал":"Санаачилгаа бодож төлөвлөхтэй уялдуул.",
  "Гал+Ус":"Зоригтой алхам хийхийн өмнө мэдрэмжээ анзаар.",
  "Гал+Шороо":"Санаагаа бодит төлөвлөгөөтэй холбож үз.",
  "Агаар+Ус":"Мэдрэмж болон бодит мэдээллээ тэнцүүлж бод.",
  "Агаар+Шороо":"Өөрийн бодож төлөвлөснөө жижиг үйлдлээр шалга.",
  "Ус+Шороо":"Сэтгэлийн хэрэгцээгээ өдөр тутмын бодит нөхцөлтэй нийцүүл."
};
function thematicConnections(cards: readonly DrawnCard[]): string[] {
  const out: string[] = [];
  const major = cards.filter(item => item.card.arcana === "major");
  if (major.length >= 2) {
    out.push("Их Арканын " + major.length +
      " карт гарсан нь энэ дэлгэмэлд амьдралын өргөн сэдэв илүү олон байгааг уламжлалт утгаар онцолдог.");
  }
  const reversed = cards.filter(item => item.isReversed).length;
  if (reversed > 0) {
    out.push(reversed + " урвуу карт гарсан. Үүнийг зөвхөн муу ёр гэхээс илүү саатал, дотоод эргэцүүлэл, өөр өнцөг гэсэн боломжит утгаар авч үз.");
  }
  const elementCounts = new Map<string,number>();
  for(const item of cards){
    const element=item.card.element;
    if (element in elementDescriptions) elementCounts.set(element,(elementCounts.get(element)||0)+1);
  }
  const dominant=[...elementCounts].sort((a,b)=>b[1]-a[1])[0];
  if(dominant && dominant[1]>=2) {
    out.push(dominant[0]+" элемент "+dominant[1]+" удаа давтагдсан тул "+elementDescriptions[dominant[0]]+" сэдэвт анхаарал хандуулж болно.");
  }
  const elements=[...elementCounts.keys()].sort();
  if(elements.length===2){
    const key=elements.join("+");
    if(elementPairAdvice[key]) out.push(elementPairAdvice[key]);
  }
  if(cards.length>1){
    const opening=cards[0], closing=cards[cards.length-1];
    if(opening.isReversed !== closing.isReversed){
      out.push("Эхний болон сүүлийн карт өөр чиглэлтэй байна. Үүнийг нөхцөлөө дахин үнэлэх, өөр арга турших урилга гэж харж болно.");
    }
    out.push("Дэлгэмлийн эхлэл ("+opening.positionName+") ба төгсгөл ("+closing.positionName+")-ийн сэдвийг хамтад нь эргэцүүл; эдгээр нь үр дүнг заавал тодорхойлохгүй.");
  }
  return out;
}
/** Deterministic, auditable, contextual Tarot reading. */
export function createContextualReading(drawn:readonly DrawnCard[], question="", chosen?:ReadingTopic):string {
  if(drawn.length===0)return "Эхлээд карт сонгоно уу.";
  const topic=chosen||detectReadingTopic(question);
  const guide=topicAdvice[topic];
  const parts=[
    "Таро нь бодит ирээдүйг баттай таамагладаггүй. Энэ бол уламжлалт бэлгэдэлд тулгуурласан эргэцүүлэл.",
    question.trim()?"Асуулт: "+question.trim().slice(0,300):"",
    "Карт ба байрлалууд",
    ...drawn.map(({card,isReversed,positionName,positionDescription},i)=>
      (i+1)+". "+positionName+" — "+card.name+
      (isReversed?" (урвуу)":" (эгц)")+"\n"+
      positionDescription+". "+(isReversed?card.reversedMeaning:card.meaning)+"."),
    ...(drawn.length>1?["Картуудын холбоо",...thematicConnections(drawn)]:[]),
    "Таны эргэцүүлэх асуулт\n"+guide.question,
    "Дараагийн бодит алхам\n"+guide.action,
  ];
  return parts.filter(Boolean).join("\n\n");
}
