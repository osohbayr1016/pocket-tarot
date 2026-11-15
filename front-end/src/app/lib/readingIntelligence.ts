import type { DrawnCard } from "./offlineEngine";

export type ReadingTopic = "general" | "love" | "career" | "growth";
type Line = [mn: string, en: string];
type Angle = {lead: Line; ask: Line; act: Line; pause: Line};
type Situation = Angle & {topic: ReadingTopic; match: RegExp};

const situations: Situation[] = [
  {topic:"career", match:/ажл.{0,12}(солих|солиход|соливол|гарах|гармаар|гарвал)|ажлаасаа|шинэ ажил|өөр ажил|ажлын санал|ajlaasaa|ajlaa sol|shine ajil|chang(?:e|ing) jobs?|quit my job|job offer/i,
    lead:["Ажлаа солих тухай бодоход одоо юунаас залхсанаа, цаашдаа юу хүсэж байгаагаа ялгахад амаргүй байдаг.","When you think about changing jobs, it helps to separate what you want to leave from what you want to move toward."],
    ask:["Дараагийн ажилд тань яг юу өөр байвал үлдэх шалтгаан болох вэ?","What would have to be different for you to want to stay in your next role?"],
    act:["Сонирхож буй нэг ажлынхаа талаар тэнд ажилладаг хүнээс асуугаарай. Хариултыг нь өөрт хамгийн чухал нөхцөлтэй тулгаад үзээрэй.","Ask someone doing a role you are considering about an ordinary workday. Compare it with one condition that matters to you."],
    pause:["Шийдэхээсээ өмнө одоогийн ажлаасаа авч үлдмээр нэг зүйл, давтмааргүй нэг зүйлээ бичээд үзээрэй.","Before deciding, write down one thing you would keep from this job and one you would want to change."]},
  {topic:"love", match:/сал(ах|сан|лаа|чих|маар)|эргэж нийлэх|хуучин (найз|хайр)|салалт|sal(san|ah|ahuu)|break.?up|broke up|get back together/i,
    lead:["Салалтын тухай бодох үед хүнээ санах, тэр харилцаандаа буцаж очихыг хүсэх хоёр мэдрэмж давхцаж болно.","Missing someone and wanting the relationship back can feel very similar."],
    ask:["Та хамт байсан хүнээ илүү санаж байна уу, эсвэл хамт байхдаа мэдэрдэг байсан зүйлээ юу?","What do you miss most about that person or about the time you shared?"],
    act:["Хэлмээр байгаа зүйлээ эхлээд өөртөө зориулж бичээрэй. Дараа нь юуг үнэхээр хуваалцмаар байгаагаа сонгож болно.","Write what you would like to say just for yourself, then decide what you actually want to share."],
    pause:["Өнөөдөр шийдвэр гаргахаа түр азнаад, энэ харилцаанд өөрт хэрэгтэй байсан нэг зүйлийг нэрлээрэй.","Give the decision a little time and name one thing you needed in that relationship."]},
  {topic:"love", match:/маргалд|муудалц|хэрэлд|ойлголцох|гомд(сон|оод)|margald|muudal|argu(ed|ment)|fighting with/i,
    lead:["Маргааны дараа хэлсэн үг сэтгэлд үлддэг. Тэр ярианаас яг юуг ойлгуулахыг хүссэнээ эргээд бодоорой.","After an argument, the words can linger. Think back to what you wanted the other person to understand."],
    ask:["Тайван үедээ ганц өгүүлбэрээр юу хэлэхийг хүсэж байна вэ?","If you had one quiet moment together, what would you like to say?"],
    act:["Яриагаа «Тэр үед надад … санагдсан» гэж эхлүүлээд, нөгөө хүндээ хариулах зай үлдээгээрэй.","Try opening with “At the time I felt …” and leave room for their response."],
    pause:["Яриагаа үргэлжлүүлэхээс өмнө таныг гомдоосон үг, түүнээс өөрийн хийсэн дүгнэлт хоёрыг салгаж бичээд үзээрэй.","Before restarting the conversation, separate the words you remember from the meaning you gave them."]},
  {topic:"career", match:/ачаалал|ажил.{0,16}(ядар|амжихгүй)|хэт их ажил|ажлаа амж|ach(aal|aa)lal|burn.?out|overwork|workload/i,
    lead:["Ажил давхцах үед бүгдийг амжуулах гэж яваад аль нь үнэхээр яаралтайг анзаарахгүй өнгөрөх нь бий.","When work piles up, even small tasks can start to feel equally urgent."],
    ask:["Өнөөдөр заавал дуусгах нэг ажил юу вэ? Алийг нь хойшлуулж болох вэ?","Which task actually needs to be done today, and which can wait?"],
    act:["Хугацаа нь давхцсан хоёр ажлаа нэрлээд, алийг нь түрүүлж хийхээ хариуцсан хүнтэй нь тохироорой.","Pick two competing deadlines and agree on their order with the person expecting the work."],
    pause:["Хийх ажлынхаа жагсаалтаас өнөөдөр түр азнаж болох нэгийг тэмдэглээрэй.","Mark one task on your list that can reasonably wait until tomorrow."]},
  {topic:"growth", match:/шалгалт|сургууль|хичээл|суралц|сурмаар|shalgalt|hicheel|exam|stud(y|ies)|school/i,
    lead:["Сурах зүйл их санагдвал эхлэх цэгээ жижигрүүлэхэд дөхөм байдаг.","When there is a lot to learn, a smaller starting point makes progress easier to see."],
    ask:["Өнөөдөр нэг л зүйлийг өөр хүнд тайлбарлаж чаддаг болбол тэр нь юу байх вэ?","What one idea would you like to be able to explain by the end of today?"],
    act:["Нэг дасгалыг тусламжгүй хийгээд гацсан газраа тэмдэглээрэй. Дараагийн давтлагаа тэндээс эхлүүлж болно.","Try one exercise unaided and mark where you get stuck. Start your next practice there."],
    pause:["Шинэ бүлэг эхлэхийн өмнө өчигдөр сурснаа харалгүйгээр өөртөө тайлбарлаад үзээрэй.","Before starting a new chapter, try explaining yesterday’s lesson without looking at your notes."]},
  {topic:"love", match:/хариу.{0,8}(өгөхгүй|бичихгүй)|холдоо|надтай ярихгүй|надад хайртай|сэтгэлтэй|nadad hairtai|does .* love me|text back|distant/i,
    lead:["Хариу хүлээхэд хүний бодлыг таах гээд байдаг. Өөрт тань ямар харилцаа хэрэгтэйг нэрлэх нь илүү тодорхой эхлэл.","Waiting for an answer can invite guesswork. Start with what kind of contact would feel right to you."],
    ask:["Та ямар асуултад тэр хүнээс өөрөөс нь хариу сонсмоор байна вэ?","What would you most like to hear from the person directly?"],
    act:["Өөрт тохирох үед «Сүүлийн үед бид бага ярьж байна. Чамд ямар санагдаж байна?» гэж асууж болно.","When it feels right, try asking how they feel about the amount of contact you have had lately."],
    pause:["Анзаарсан нэг үйл явдал, түүний тухай өөрийн таамгийг тусад нь бичээрэй.","Write down one thing you observed and, separately, what you think it might mean."]},
];
const defaults: Record<ReadingTopic, Angle> = {
  general:{lead:["Энэ зургийг хараад санаанд тань хамгийн түрүүнд юу орж ирэв? Тэр бодлоосоо эхлээрэй.","What first came to mind when you saw this card? Start with that detail."],
    ask:["Таны бодож байгаа зүйлээс яг одоо аль хэсэгт нь нөлөөлж чадах вэ?","Which part of the situation is within your reach today?"],
    act:["Өнөөдөр хийж үзэхэд амархан нэг алхам сонгоод, дараа нь юу өөрчлөгдсөнийг анзаараарай.","Choose one small thing to try today and notice what changes."],
    pause:["Яг юу мэдэж байгаагаа, юуг таамаглаж байгаагаа тус тусад нь бичээд үзээрэй.","Jot down one thing you know and one thing you are still guessing."]},
  career:{lead:["Ажлын тухай асуултаа ойрын нэг шийдвэртэй холбож үзээрэй.","Bring your work question back to one decision you are facing."],
    ask:["Та энэ шийдвэрт ямар мэдээлэл дутуу байгааг хэнээс тодруулж болох вэ?","Who could help you fill in a missing piece of this decision?"],
    act:["Нэг боломж сонгоод, хэрэгжүүлэхэд юу шаардагдахыг бодит мэдээллээр шалгаарай.","Pick one possibility and check what it would actually take to try it."],
    pause:["Яарахаасаа өмнө өөрт чухал хоёр нөхцөлийг бичээд, тэдгээрийг бодит мэдээлэлтэй тулгаарай.","List two conditions that matter to you and check what you know about each."]},
  love:{lead:["Харилцаагаа бодохдоо хамгийн сүүлд сэтгэлд үлдсэн нэг мөчийг санаарай.","Think of one recent moment in this relationship that has stayed with you."],
    ask:["Тэр мөчид танд юу хэрэгтэй байсан бэ? Үүнийг яаж хэлж болох вэ?","What did you need in that moment, and how could you put it into words?"],
    act:["Өөрийн мэдрэмжийг нэг өгүүлбэрээр хэлээд, нөгөө хүнээс тэр мөчийг хэрхэн мэдэрснийг асуугаарай.","Put your feeling into one sentence, then ask how the other person experienced that moment."],
    pause:["Хэлэхээсээ өмнө өөртөө шударгаар нэрлэчихмээр байгаа нэг мэдрэмжээ бичээд үзээрэй.","Name one feeling to yourself before deciding what you would like to share."]},
  growth:{lead:["Өөрчлөхийг хүсэж байгаа зүйлээ өдөр тутмын нэг дадалтай холбож бодоорой.","Connect the change you want to one ordinary part of your day."],
    ask:["Өчигдрийг дахин өнгөрөөвөл та нэг зүйлийг яаж өөрөөр хийх байсан бэ?","If you could revisit yesterday, what is one thing you would do differently?"],
    act:["Арван минут гаргаад тэр өөрчлөлтийн хамгийн жижиг хувилбарыг өнөөдөр туршаарай.","Give yourself ten minutes to try the smallest version of that change."],
    pause:["Өмнө нь танд тус болж байсан нэг дадлыг санаад, дахин эхлэхэд юу хэрэгтэйг бичээрэй.","Recall a habit that helped before and write down what you need to start it again."]},
};
function matchTopic(text:string):ReadingTopic{
  if (/хайр|дурлал|харилцаа|найз (залуу|охин)|гэрлэлт|болзоо|hair|hariltsaa|naiz (ohin|zaluu)|love|romance|relationship|partner|dating/i.test(text)) return "love";
  if (/ажил|ажл|карьер|мэргэжил|цалин|бизнес|албан тушаал|ajil|ajl|tsalin|work|job|career|business|salary/i.test(text)) return "career";
  if (/хөгж|өөрчлөлт|зорилго|сурах|итгэл|сэтгэл|zorilgo|sural|growth|confidence|habit|change/i.test(text)) return "growth";
  return "general";
}
export function detectReadingTopic(question: string): ReadingTopic {
  const text=question.trim().normalize("NFC");
  return situations.find(s=>s.match.test(text))?.topic ?? matchTopic(text);
}
export function readingGuidance(entry:Pick<DrawnCard,"card"|"isReversed">, question="", chosen?:ReadingTopic, locale:"mn"|"en"="mn"){
  const text=question.trim().normalize("NFC");
  const situation=situations.find(s=>(!chosen||chosen===s.topic)&&s.match.test(text));
  const angle=situation??defaults[chosen??matchTopic(text)];
  const reflective=entry.isReversed||[2,9,12,14,18].includes(entry.card.id);
  const i=locale==="en"?1:0;
  return {lead:angle.lead[i], question:angle.ask[i], action:(reflective?angle.pause:angle.act)[i]};
}
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

const suitNames:Record<string,string>={Wands:"Саваа",Cups:"Хундага",Swords:"Сэлэм",Pentacles:"Зоос"};
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
      notes.push(group.length+" карт нэг бүлэгт ("+suitNames[suit]+") хамаарна: "+
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
    out.push("«"+opening.positionName+"» байрлалд "+opening.card.name+", «"+closing.positionName+"» байрлалд "+closing.card.name+" гарчээ. Эхний картаас сүүлийнх рүү шилжихэд таны бодолд юу өөрчлөгдөв?");
  }
  return out;
}
/** Deterministic, auditable, contextual Tarot reading. */
export function createContextualReading(drawn:readonly DrawnCard[], question="", chosen?:ReadingTopic):string {
  if(drawn.length===0)return "Эхлээд карт сонгоно уу.";
  const topic=chosen||detectReadingTopic(question);
  const guide=readingGuidance(drawn[drawn.length-1], question, chosen);
  const parts=[
    guide.lead,
    question.trim()?"Асуулт: "+question.trim().slice(0,500):"",
    "Карт ба байрлалууд",
    ...drawn.map(({card,isReversed,positionName,positionDescription},i)=>
      (i+1)+". "+positionName+" — "+card.name+
      (isReversed?" (урвуу)":" (эгц)")+"\n"+
      positionDescription.replace(/[.!?]+$/,"")+". "+(isReversed?card.reversedMeaning:card.meaning)),
    ...(drawn.length>1?["Картуудын холбоо",...thematicConnections(drawn),...extraConnections(drawn,topic)]:[]),
    "Таны эргэцүүлэх асуулт\n"+guide.question,
    "Дараагийн бодит алхам\n"+guide.action,
    "Таро нь ирээдүйг баттай таамагладаггүй. Тайллыг өөрийн нөхцөлтэй харьцуулж уншаарай.",
  ];
  return parts.filter(Boolean).join("\n\n");
}
