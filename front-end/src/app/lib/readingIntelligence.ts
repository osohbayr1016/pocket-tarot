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

const suitDescriptions:Record<string,string>={
  Wands:"санаачилга, зорилго, үйлдэл",
  Cups:"мэдрэмж, хүн хоорондын холбоо",
  Swords:"шийдвэр, бодол, ярилцлага",
  Pentacles:"нөөц, ур чадвар, бодит төлөвлөгөө"
};
const numberThemes:Record<number,string>={
  1:"эхлэл болон шинэ санаа",2:"сонголт ба хоёр тал",3:"бүтээл ба хамтын ажиллагаа",
  4:"суурь, бүтэц",5:"сорилт ба өөрчлөлт",6:"зохицол ба эргэж харах",
  7:"шинжилгээ, өөрийгөө шалгах",8:"хөдөлгөөн ба дадал",
  9:"бие даах, туршлага",10:"мөчлөгийн төгсгөл"
};
const meaningfulPairs:Record<string,string>={
  "0:1":"Шинэ эхлэлийг хэрэгжүүлэхийн тулд нөөц, ур чадвараа бодитоор шалгах.",
  "3:4":"Бүтээлч санааг тогтвортой бүтэц болон хил хязгаартай хослуулах.",
  "6:11":"Харилцааны сонголтыг шударга байдал, харилцан хариуцлагаар харах.",
  "7:9":"Урагшлах зоригийн өмнө ганцаар эргэцүүлж, чиглэлээ тодорхойлох.",
  "8:15":"Хувийн тэвчээр ба хязгаарлаж буй дадлын харилцааг эргэцүүлэх.",
  "13:17":"Хуучин мөчлөгөөс салсны дараа найдвар, шинэ боломжийг анзаарах.",
  "14:16":"Огцом өөрчлөлтийн дараа тэнцвэрээ аажмаар сэргээх.",
  "18:19":"Тодорхойгүй мэдрэмжийг илүү тодорхой мэдээллээр шалгах."
};
function extraConnections(cards:readonly DrawnCard[],topic:ReadingTopic):string[]{
  const notes:string[]=[];
  const suits=new Map<string,DrawnCard[]>();
  const ranks=new Map<number,DrawnCard[]>();
  for(const entry of cards){
    if(entry.card.suit){
      const group=suits.get(entry.card.suit)||[];
      group.push(entry);suits.set(entry.card.suit,group);
      if(entry.card.numerology<=10){
        const rank=ranks.get(entry.card.numerology)||[];
        rank.push(entry);ranks.set(entry.card.numerology,rank);
      }
    }
  }
  for(const [suit,group] of suits){
    if(group.length>=2){
      notes.push(group.length+" карт нэг бүлэгт ("+group[0].card.name.split(" ").slice(-1).join(" ")+") хамаарна: "+
        suitDescriptions[suit]+". Тэдгээрийн байрлалуудыг хооронд нь харьцуул.");
    }
  }
  for(const [rank,group] of ranks){
    if(group.length>=2){
      notes.push(rank+" дугаартай "+group.length+" карт давтагдсан: "+
        numberThemes[rank]+". Энэ нь уламжлалт тоон бэлгэдэл бөгөөд баттай үр дүн биш.");
    }
  }
  const majors=cards.filter(entry=>entry.card.arcana==="major");
  for(let i=0;i<majors.length;i++){
    for(let j=i+1;j<majors.length;j++){
      const a=majors[i],b=majors[j],key=[a.card.id,b.card.id].sort((x,y)=>x-y).join(":");
      if(meaningfulPairs[key])notes.push("Картын хослол ("+a.card.name+" / "+b.card.name+"): "+meaningfulPairs[key]+
        " Байрлал: "+a.positionName+" ба "+b.positionName+".");
    }
  }
  const relevant=topic==="love"?["Cups"]:topic==="career"?["Wands","Pentacles"]:topic==="growth"?["Swords"]:[];
  const related=cards.filter(entry=>entry.card.suit&&relevant.includes(entry.card.suit));
  if(related.length){
    notes.push("Сонгосон асуултын чиглэлтэй холбоотой бэлгэдэл: "+
      related.map(entry=>entry.card.name+" ("+entry.positionName+")").join(", ")+
      ". Тухайн картын утгыг өөрийн бодит нөхцөлд тулгаж үз.");
  }
  return notes.slice(0,8);
}

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
    ...(drawn.length>1?["Картуудын холбоо",...thematicConnections(drawn),...extraConnections(drawn,topic)]:[]),
    "Таны эргэцүүлэх асуулт\n"+guide.question,
    "Дараагийн бодит алхам\n"+guide.action,
  ];
  return parts.filter(Boolean).join("\n\n");
}
