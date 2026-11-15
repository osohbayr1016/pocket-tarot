"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { tarotCards } from "../data/tarotCards";
import { interpretReading } from "../lib/offlineEngine";
import {saveDailyJournalReading} from "../lib/journalDb";
import TarotCard from "./TarotCard";
import {readingGuidance} from "../lib/readingIntelligence";
import {getReadingPreferences} from "../lib/readingPreferences";
import {useLocalDraft} from "../lib/useLocalDraft";
import {useLanguage} from "../lib/LanguageProvider";
import {englishReading,englishCardMeaning} from "../lib/englishTarot";

function hashDay(text:string):number{
  let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return hash>>>0;
}
export default function DailyTarotCard(){
  const {locale,t}=useLanguage();
  const en=locale==="en";
  const [date,setDate]=useState("");
  const draft=useLocalDraft(date?"daily-"+date:"");
  const [allowReversed,setAllowReversed]=useState(true);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const savingRef=useRef(false);
  useEffect(()=>{
    // A long-running tab must roll over to the next LOCAL calendar day.
    // Using next local midnight (instead of 24h) handles DST changes.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update=()=>{
      const today=new Date();
      setDate([today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-"));
      setAllowReversed(getReadingPreferences().allowReversed);
      setMessage("");setError("");
      const midnight=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
      timer=setTimeout(update,Math.max(100,midnight.getTime()-today.getTime()+100));
    };
    const onVisible=()=>{
      if(document.visibilityState==="visible"){
        if(timer)clearTimeout(timer);
        update();
      }
    };
    const frame=requestAnimationFrame(update);
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{
      cancelAnimationFrame(frame);
      if(timer)clearTimeout(timer);
      document.removeEventListener("visibilitychange",onVisible);
    };
  },[]);
  const seed=hashDay(date);
  const card=tarotCards[seed%78];
  const isReversed=allowReversed && (seed>>>8)%2===0;
  const drawn={card,position:1,isReversed,positionName:"Өдрийн бэлгэдэл",positionDescription:"Өдөрт нэг удаа эргэцүүлэх сэдэв"};
  const guidance=readingGuidance(drawn,"",undefined,locale);
  const reading=(en?englishReading:interpretReading)([drawn]);
  const save=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    // The ref flips before React paints the disabled state, so two clicks in
    // the same event loop cannot append an identical daily note twice.
    if(!date||!draft.ready||savingRef.current)return;
    // Capture the value shown by the browser, including a just-committed
    // composition or autofill, before the first render or asynchronous write.
    const submittedNotes=new FormData(event.currentTarget).get("notes");
    if(typeof submittedNotes!=="string")return;
    savingRef.current=true;setSaving(true);setError("");setMessage("");
    try{
      await saveDailyJournalReading({
        id:"daily-"+date,date:new Date().toISOString(),spread:"Өдрийн карт",
        question:"Өнөөдөр юунд анхаарах вэ?",reading,notes:submittedNotes.slice(0,2000),
        cards:[{id:card.id,reversed:isReversed,position:1}],
      });
      draft.clear();
      setMessage(en?"Daily reflection saved to your device. Find it in the reading journal.":"Өдрийн тэмдэглэл хадгалагдлаа. Уншилтын түүхээс харж болно.");
      setError("");
    }catch(cause){
      setError(cause instanceof Error?cause.message:
        (en?"Could not save notes; check browser storage.":"Тэмдэглэл хадгалагдсангүй. Browser storage-ийг шалгана уу."));
    }finally{
      savingRef.current=false;setSaving(false);
    }
  };
  if(!date)return <div className="p-10 text-center text-muted">{en?"Preparing your daily card...":"Өдрийн картыг бэлдэж байна..."}</div>;
  return <section className="daily-page">
    <div className="section-heading">
    <h1 className="mt-3 font-serif text-4xl text-ink">{t("Өнөөдрийн карт")}</h1>
    <p className="mt-4 text-sm text-muted">{date} · {en?"One consistent card for this calendar day.":"Тухайн өдөр тогтмол нэг карт харагдана."}</p>
    </div><div className="daily-layout"><div className="detail-art">
      <TarotCard card={card} isRevealed isReversed={isReversed} size="lg" showMeaning={false}/>
      </div><div className="reading-panel"><h2>{en?card.englishName:card.name}</h2>
      <p className="mt-3 text-lg">{en?englishCardMeaning(card,isReversed):isReversed?card.reversedMeaning:card.meaning}</p>
      <p className="panel-lead">{guidance.question}</p><div className="next-step"><div><h3>{en?"One step to try":"Туршаад үзэх нэг алхам"}</h3><p>{guidance.action}</p></div></div>
      <form onSubmit={save}><label htmlFor="daily-notes" className="mt-6 block text-left text-sm font-semibold text-ink">{en?"Daily notes":"Өдрийн тэмдэглэл"}</label>
      <textarea id="daily-notes" name="notes" value={draft.text} disabled={!draft.ready} readOnly={saving} onChange={event=>draft.setText(event.target.value)}
        rows={3} maxLength={2000} placeholder={en?"Today’s intentions and reflections...":"Өнөөдрийн зорилго, бодол..."}
        className="mt-2 w-full rounded-lg border border-rule bg-sheet p-3 text-sm text-ink placeholder:text-muted"/>
      <p className="mt-2 text-left text-xs text-muted">{en?"Your draft saves locally as you type. Saving another note today appends it without erasing earlier reflections.":"Draft нь төхөөрөмж дээр хадгалагдана. Нэг өдөр дахин хадгалахад өмнөх тэмдэглэлийг устгахгүй, үргэлжлүүлэн нэмнэ."}</p>
      <button type="submit" disabled={!draft.ready||saving} aria-busy={saving}
        className="mt-4 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-on-pine hover:bg-deep disabled:cursor-not-allowed disabled:opacity-60">
        {saving?(en?"Saving reflection...":"Тэмдэглэл хадгалж байна..."):
          (en?"Save daily reflection":"Өдрийн тэмдэглэл хадгалах")}
      </button></form>
      {message&&<p role="status" className="mt-4 text-sm text-success">{message}</p>}
      {draft.error&&<p role="alert" className="mt-3 text-sm text-danger">{draft.error}</p>}
      {error&&<p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
      <p className="mt-5 text-xs text-muted">{en?"This card is selected deterministically by local date and does not predict future events.":"Өдрийн карт нь огнооноос детерминистик сонгогдох бөгөөд ирээдүйн баттай таамаглал биш."}</p>
    </div></div>
  </section>;
}
