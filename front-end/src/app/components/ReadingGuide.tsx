"use client";
import {useLanguage} from "../lib/LanguageProvider";
import {ViewLink,type Section} from "./NavigationMenu";
import {Icon} from "./InterfaceIcon";

export default function ReadingGuide({onNavigate}:{onNavigate:(view:Section)=>void}){
  const en=useLanguage().locale==="en";
  const steps=en?[
    ["Make room for a question","You can keep it in mind or write it down. A written question lets the reading offer a more specific prompt. Try “What do I need from my next job?”"],
    ["Shuffle and choose","Start with one card for one idea. Three cards explore the past, the present and a possible direction. Shuffle, then tap any face-down card on the table."],
    ["Read and reflect","The meaning appears beside the cards. On a phone it opens in the Reading tab. Try the suggested step, or save a thought in your journal. You can revisit any card you have turned over."],
  ]:[
    ["Асуултаа бодоорой","Асуултаа дотроо бодоод ч картаа сонгож болно. Харин бичвэл тайлал таны дурдсан сэдэвтэй холбогдоно. «Дараагийн ажлаасаа би юу хүсэж байна вэ?» гээд асуугаад үзээрэй."],
    ["Холиод нэгийг сонгоорой","Нэг карт нэг санаанд төвлөрөхөд тустай. Гурван картаар өнгөрсөн, одоо, цаашдын боломжийг харна. Хольсны дараа ширээн дээрх доош харсан картуудаас хүссэнээ дараарай."],
    ["Тайллаа уншаарай","Сонгосон картын тайлал хажууд нь гарна. Утсаар бол «Тайлал» хэсэг шууд нээгдэнэ. Санаанд орсон зүйлээ тэмдэглэж хадгалах эсвэл өмнөх картаа дахин үзэж болно."],
  ];
  return <section className="guide-page"><div className="section-heading"><h1>{en?"Your first reading":"Анхны уншлага"}</h1><p>{en?"All you need is a question, or a moment to pause.":"Эхлэхэд асуулт байхад л болно. Зүгээр л нэг карт сугалаад үзсэн ч болно."}</p></div>
    <ol className="guide-steps">{steps.map(([name,body],i)=><li key={name}><span className="step-index">{i+1}</span><div><h2>{name}</h2><p>{body}</p></div></li>)}</ol>
    <p className="guide-footnote">{en?"Your cards are drawn at random. The prompts use traditional card meanings and familiar themes in your written question. Your question stays on this device.":"Картууд санамсаргүй гарна. Тайллыг картын уламжлалт утга, таны бичсэн асуултаас таньсан сэдэвтэй холбож гаргадаг. Асуулт тань энэ төхөөрөмж дээр үлдэнэ."}</p>
    <ViewLink view="reading" onNavigate={onNavigate} className="primary-button">{en?"Go to the reading table":"Уншлагаа эхлүүлэх"}<Icon name="arrow"/></ViewLink>
  </section>;
}
