/**
 * Independently authored English offline reflection copy.
 * Shared numeric/date validation uses the same local engine as Mongolian.
 * None of the content is predictive, diagnostic or AI-generated at runtime.
 */
import {
  getHoroscopeLocal,getDailyFortuneLocal,getLifeGuidanceLocal,
  interpretDreamLocal,expandLatinDreamSymbols,zodiacFromISODate,
  zodiacFromMonthDay,zodiacSigns
} from "./offlineEngine.ts";

const SIGNS:Record<string,[string,string,string]>={
 capricorn:["Capricorn","Earth","discipline, careful planning and responsibility"],
 aquarius:["Aquarius","Air","original thinking and shared purpose"],
 pisces:["Pisces","Water","empathy, imagination and self-awareness"],
 aries:["Aries","Fire","initiative, courage and healthy ambition"],
 taurus:["Taurus","Earth","patience, practical comfort and persistence"],
 gemini:["Gemini","Air","communication, curiosity and learning"],
 cancer:["Cancer","Water","care, belonging and emotional safety"],
 leo:["Leo","Fire","creativity, generosity and self-expression"],
 virgo:["Virgo","Earth","attention to detail and service"],
 libra:["Libra","Air","balance, fairness and relationships"],
 scorpio:["Scorpio","Water","depth, boundaries and transformation"],
 sagittarius:["Sagittarius","Fire","exploration and broad perspective"]
};
export function englishZodiacName(id:string):string{return SIGNS[id]?.[0]||id;}
export function englishHoroscope(signId:string,birthDate=""):string{
 getHoroscopeLocal(signId,birthDate);
 const sign=SIGNS[signId];
 if(!sign)throw new Error("Choose a valid zodiac sign.");
 return `${sign[0]} (${sign[1]})

In conventional Western tropical astrology, ${sign[2]} are symbolic themes associated with this sign.

Today's reflection: name one goal that matters to you and a practical step you can take.

The approximate sun-sign date ranges are cultural conventions, not a personal birth-chart calculation or a scientifically valid prediction.`;
}
const themes:[string,string][]=[
 ["Нэг чухал ажлаа дуусгахад төвлөр.","Choose one priority and give it your undivided attention."],
 ["Бусдыг анхааралтай сонсож, ойлголтоо шалга.","Listen carefully and check your assumptions."],
 ["Шинэ санаагаа жижиг туршилтаар эхлүүл.","Try a small experiment with a new idea."],
 ["Өөрийн эрүүл хил хязгаар, амралтаа бод.","Make space for healthy boundaries and rest."],
 ["Урт хугацааны зорилгоо нэг алхмаар урагшлуул.","Make one measurable step toward a longer-term goal."]
];
const colors:Record<string,string>={"Хөх":"Blue","Ногоон":"Green","Алтлаг":"Gold","Нил ягаан":"Purple","Улаан":"Red","Цагаан":"White"};
const directions:Record<string,string>={"Хойд":"North","Өмнөд":"South","Зүүн":"East","Баруун":"West"};
export function englishDailyFortune(month:number,day:number,date=new Date()){
 const result=getDailyFortuneLocal(month,day,date);
 const sign=zodiacFromMonthDay(month,day);
 if(!sign)throw new Error("Choose a valid birth month and day.");
 const tuple=SIGNS[sign.id];
 const dailyTheme=themes.find(([mn])=>result.fortune.includes(mn))?.[1]||themes[0][1];
 return {
  ...result,
  fortune:`${tuple[0]} — daily reflection

${dailyTheme}

Use ${tuple[2]} as a prompt for a short journal entry. This is symbolic play, not a prediction about actual events.`,
  luckyColors:result.luckyColors.map(color=>colors[color]||color),
  luckyDirections:result.luckyDirections.map(direction=>directions[direction]||direction)
 };
}
export function englishLifeGuidance(birthDate:string,situation:string,goals="",challenges="",questions=""):string{
 getLifeGuidanceLocal(birthDate,situation,goals,challenges,questions);
 const sign=zodiacFromISODate(birthDate);
 return [
 "Personal reflection guide",
 "",
 "Your situation: "+situation.trim().slice(0,280),
 "Your goal: "+(goals.trim().slice(0,200)||"Not defined"),
 "Challenge: "+(challenges.trim().slice(0,200)||"Not defined"),
 "Question: "+(questions.trim().slice(0,200)||"None yet"),
 "",
 "Step 1: Break a meaningful goal into a smaller measurable task.",
 "Step 2: Separate observable facts from assumptions about obstacles.",
 "Step 3: Pick one realistic action for the next seven days.",
 "",
 "Conventional symbolic zodiac: "+englishZodiacName(sign?.id||"")+
 ". This is a reflective writing prompt, not a personal assessment or prediction."
 ].join("\n");
}
const dreamSymbols:{pattern:RegExp;label:string;idea:string}[]=[
 {pattern:/ус|далай|нуур|гол|water|ocean|river|lake/i,label:"Water",idea:"Feelings, change and emotional surroundings"},
 {pattern:/гал|шат|fire|flame|burn/i,label:"Fire",idea:"Energy, strong emotions and transformation"},
 {pattern:/нис|тэнгэр|fly|flying|sky/i,label:"Flight",idea:"Freedom, ambition or changing perspective"},
 {pattern:/гэр|байшин|house|home|room/i,label:"Home",idea:"Safety, identity and personal boundaries"},
 {pattern:/машин|зам|car|drive|road/i,label:"Travel",idea:"Direction, autonomy and transitions"},
 {pattern:/хөө|зугт|chase|chased|escape/i,label:"Chase",idea:"Pressure, avoidance or unresolved concerns"},
 {pattern:/ун|өндрөөс|fall|falling|height/i,label:"Falling",idea:"Uncertainty, control and vulnerability"},
 {pattern:/шүд|tooth|teeth/i,label:"Teeth",idea:"Self-image, speech and everyday worries"},
 {pattern:/могой|snake|serpent/i,label:"Snake",idea:"Caution, change and unfamiliar situations"},
 {pattern:/нохой|dog|puppy/i,label:"Dog",idea:"Trust, protection and companionship"},
 {pattern:/муур|cat|kitten/i,label:"Cat",idea:"Independence, curiosity and boundaries"},
 {pattern:/шувуу|bird/i,label:"Bird",idea:"Freedom, perspective and messages"},
 {pattern:/мори|морь|horse/i,label:"Horse",idea:"Momentum, endurance and independence"},
 {pattern:/уул|had|mountain/i,label:"Mountain",idea:"Challenges, effort and progress"},
 {pattern:/мод|ой |forest|tree/i,label:"Forest",idea:"Growth, uncertainty and exploration"},
 {pattern:/мөнгө|алт|money|gold/i,label:"Money",idea:"Resources, values and security"},
 {pattern:/шалгалт|сургууль|exam|school/i,label:"School",idea:"Learning, expectations and performance pressure"},
 {pattern:/ажил|work|office|job/i,label:"Work",idea:"Responsibilities and collaboration"},
 {pattern:/хүүхэд|child|baby/i,label:"Child",idea:"Care, new beginnings and responsibility"},
 {pattern:/хурим|hair|wedding|marriage/i,label:"Wedding",idea:"Commitment, connection and change"},
 {pattern:/утас|phone|call/i,label:"Phone",idea:"Communication and unmet questions"},
 {pattern:/хаалга|түлхүүр|door|key/i,label:"Door or key",idea:"Opportunities, choices and access"},
 {pattern:/толь|mirror/i,label:"Mirror",idea:"Self-perception and reflection"},
 {pattern:/харанхуй|dark/i,label:"Darkness",idea:"Unknown situations and uncertainty"},
 {pattern:/гэрэл|light|sun/i,label:"Light",idea:"Hope, clarity and understanding"},
 {pattern:/сартай|сар |moon|stars/i,label:"Moon or stars",idea:"Cycles and changing perspectives"},
 {pattern:/цас|хүйтэн|snow|ice/i,label:"Cold or snow",idea:"Pause, change and emotional distance"},
 {pattern:/бороо|rain|storm/i,label:"Rain",idea:"Release, change and emotional processing"}
];
export function englishDreamReflection(raw:string):string{
 interpretDreamLocal(raw);
 const source=expandLatinDreamSymbols(raw.trim().slice(0,3000));
 const matches=dreamSymbols.filter(({pattern})=>pattern.test(source)).slice(0,8);
 return [
  "Dream symbol journal",
  "",
  ...(matches.length?matches.map(x=>"• "+x.label+": "+x.idea):
      ["No familiar symbols found. Try describing a vivid image or feeling from your dream."]),
  "",
  "Uncertainty: These are broad cultural associations from keywords, not an understanding of your personal dream or a scientific interpretation.",
  "",
  "Questions to reflect on:",
  "• How did this dream make you feel?",
  "• Does it connect to something you recently experienced?",
  "• What kind, practical action might help you?",
  "",
  "This is not clinical, mental health or medical guidance."
 ].join("\n");
}
// Preserve canonical zodiac list in shared engine; English must never invent a 13th sign.
if(zodiacSigns.length!==12)throw new Error("Unexpected zodiac catalog");
