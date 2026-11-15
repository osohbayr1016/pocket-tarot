"use client";

import {useEffect,useRef,useState} from "react";
import {tarotCards} from "../data/tarotCards";
import {tarotSpreads,type TarotSpread} from "../data/tarotSpreads";
import {dealChoices,pickFromTable,interpretReading,type DrawnCard,type CardFace} from "../lib/offlineEngine";
import {readingGuidance,type ReadingTopic} from "../lib/readingIntelligence";
import {englishCardMeaning,englishReading} from "../lib/englishTarot";
import {englishSpreadName,englishSpreadPosition} from "../lib/englishSpreads";
import {getReadingPreferences} from "../lib/readingPreferences";
import {loadActiveReading,saveActiveReading,type ActiveReading} from "../lib/activeReading";
import {appendJournalReflection} from "../lib/journalDb";
import {useLocalDraft} from "../lib/useLocalDraft";
import {useLanguage} from "../lib/LanguageProvider";
import {emitFeedback} from "../lib/feedback";
import {exportReadingSocialPng,type SocialFormat} from "../lib/exportReadingSocialPng";
import DeckTable,{cardFallback} from "./DeckTable";
import SpreadTools from "./SpreadTools";
import PhysicalDeckEntry from "./PhysicalDeckEntry";
import CelticCrossBoard from "./CelticCrossBoard";
import {Icon} from "./InterfaceIcon";

const quickSpreads=[tarotSpreads[0],tarotSpreads[1]];
const prompts=[
  ["Өнөөдөр","Today","Өнөөдөр юунд төвлөрөх вэ?","What deserves my attention today?"],
  ["Харилцаа","Relationships","Маргалдсаны дараа яриагаа яаж эхлүүлэх вэ?","How can I start a conversation after an argument?"],
  ["Ажил","Work","Ажлаа солихоосоо өмнө юуг бодолцох вэ?","What should I consider before changing jobs?"],
];
const topicOptions=[
  ["auto","Асуултаас таних","From my question"],["general","Ерөнхий","General"],
  ["love","Хайр, харилцаа","Relationships"],["career","Ажил, карьер","Work"],
  ["growth","Хувийн хөгжил","Personal growth"],
] as const;

export default function TraditionalTarotReading({single=false}:{single?:boolean}){
  const {locale,t}=useLanguage();
  const en=locale==="en";
  const tr=(mn:string,english:string)=>en?english:mn;
  const [session,setSession]=useState<ActiveReading|null>(null);
  const [ready,setReady]=useState(false);
  const [quickIndex,setQuickIndex]=useState(0);
  const [topic,setTopic]=useState<ReadingTopic|"auto">("auto");
  const [shuffling,setShuffling]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState<number|null>(null);
  const [showChoices,setShowChoices]=useState(true);
  const [mobilePane,setMobilePane]=useState<"deck"|"reading">("deck");
  const [busy,setBusy]=useState(false);
  const saving=useRef(false);
  const [saved,setSaved]=useState(false);
  const [exporting,setExporting]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const desk=useRef<HTMLDivElement>(null);
  const liveFocus=useRef(false);
  const questionDraft=useLocalDraft(single?"single-question":"traditional-question");
  const question=questionDraft.text;
  const spread=session?.spread??quickSpreads[quickIndex];
  const cards=session?.drawn??[];
  const count=session?.visibleCount??0;
  const finished=count>0&&count===cards.length;
  const activeIndex=Math.min(selectedIndex??count-1,count-1);
  const active=cards[activeIndex];
  const phase=shuffling?"shuffle":!cards.length?"idle":(count>0&&!showChoices)||finished?"read":"pick";
  const notes=useLocalDraft(single?(active?"single-"+active.card.id+"-"+(active.isReversed?"reversed":"upright"):""):"traditional-notes");
  const selectedTopic=topic==="auto"?undefined:topic;
  const guidance=active?readingGuidance(active,question,selectedTopic,locale):null;
  const fullReading=finished?(en?englishReading(cards,question,selectedTopic):interpretReading(cards,question,selectedTopic)):"";
  const displayName=(s:TarotSpread)=>en?englishSpreadName(s):s.name;
  const positionName=(index:number)=>en?englishSpreadPosition(spread,index+1).name:spread.positions[index]?.name;
  const mobile=()=>window.matchMedia("(max-width: 720px)").matches;
  function showDesk(){
    requestAnimationFrame(()=>{
      const top=desk.current?.getBoundingClientRect().top;
      if(top!==undefined&&(top<0||top>window.innerHeight/2))desk.current?.scrollIntoView({block:"start",behavior:"instant"});
    });
  }
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const previous=loadActiveReading(single);
      if(previous){
        setSession(previous);setTopic(previous.topic);
        if(previous.visibleCount){setMobilePane("reading");setShowChoices(false);}
      }
      setReady(true);
    });
    return ()=>cancelAnimationFrame(frame);
  },[single]);
  useEffect(()=>{if(ready)saveActiveReading(session,single);},[ready,session,single]);
  useEffect(()=>{
    if(!shuffling)return;
    const timer=window.setTimeout(()=>setShuffling(false),1420);
    return ()=>window.clearTimeout(timer);
  },[shuffling]);
  useEffect(()=>{
    if(!liveFocus.current||shuffling)return;
    const target=desk.current?.querySelector<HTMLElement>(phase==="pick"&&(!count||mobilePane==="deck")?".pick-card":".meaning-heading");
    target?.focus({preventScroll:true});
    liveFocus.current=false;
  },[phase,count,shuffling,mobilePane]);

  function clearFeedback(){setSaved(false);setMessage("");setError("");setSelectedIndex(null);}
  function canReplace(){
    return !saving.current&&(!notes.text.trim()||window.confirm(tr("Хадгалаагүй тэмдэглэлээ орхиод үргэлжлүүлэх үү?","Discard your unsaved note and continue?")));
  }
  function chooseSpread(next:TarotSpread){
    if(!canReplace())return;
    if(notes.text)notes.clear();
    clearFeedback();setShuffling(false);setShowChoices(true);setMobilePane("deck");
    setSession({spread:next,drawn:[],visibleCount:0,topic});
    showDesk();
  }
  function begin(next:TarotSpread,drawn:DrawnCard[],reserve:CardFace[],animate:boolean){
    const prefs=getReadingPreferences();
    clearFeedback();
    if(notes.text)notes.clear();
    setSession({spread:next,drawn,reserve,visibleCount:0,topic,journalId:crypto.randomUUID()});
    setShowChoices(true);setMobilePane("deck");liveFocus.current=true;
    setShuffling(animate&&!prefs.reduceMotion&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    emitFeedback("draw");showDesk();
  }
  function shuffle(){
    if(!ready||shuffling||!canReplace())return;
    try{
      const {drawn,reserve}=dealChoices(spread,tarotCards,getReadingPreferences().allowReversed);
      begin(spread,drawn,reserve,true);
    }catch{setError(tr("Картыг хольж чадсангүй. Дахин оролдоорой.","Could not shuffle the deck. Please try again."));}
  }
  function reveal(offset:number){
    if(!session||shuffling||count>=cards.length)return;
    const picked=pickFromTable(cards,session.reserve??[],count,offset);
    setSession({...session,...picked,visibleCount:count+1});
    setSelectedIndex(count);setShowChoices(false);setMobilePane("reading");liveFocus.current=true;
    emitFeedback("flip");if(mobile())showDesk();
  }
  function startAgain(newQuestion=false){
    if(!canReplace())return;
    if(notes.text)notes.clear();
    if(newQuestion){questionDraft.clear();setTopic("auto");}
    clearFeedback();setSession(null);setShuffling(false);setShowChoices(true);setMobilePane("deck");showDesk();
  }
  async function save(){
    if(!session||!finished||saving.current||saved||!notes.ready||!questionDraft.ready)return;
    saving.current=true;setBusy(true);setError("");
    try{
      const id=session.journalId??crypto.randomUUID();
      await appendJournalReflection({id,date:new Date().toISOString(),spread:spread.name,
        question:question.trim().slice(0,500),reading:fullReading,notes:notes.text.trim(),
        cards:cards.map(c=>({id:c.card.id,reversed:c.isReversed,position:c.position}))});
      if(!session.journalId)setSession({...session,journalId:id});
      setSaved(true);notes.clear();setMessage(tr("Энэ төхөөрөмж дээр уншилтыг хадгаллаа.","Reading saved on this device."));
    }catch(cause){setError(cause instanceof Error?cause.message:tr("Уншлагыг хадгалж чадсангүй.","Could not save your reading."));}
    finally{saving.current=false;setBusy(false);}
  }
  async function share(format:SocialFormat){
    if(exporting||!finished)return;
    setExporting(true);setError("");
    try{
      await exportReadingSocialPng({id:crypto.randomUUID(),date:new Date().toISOString(),spread:spread.name,question:"",reading:"",notes:"",
        cards:cards.map(c=>({id:c.card.id,reversed:c.isReversed,position:c.position}))},tarotCards,format);
      setMessage(tr("Хувийн асуулт, тэмдэглэл ороогүй зураг татагдлаа.","Image downloaded without your question or notes."));
    }catch{setError(tr("Зургийг татаж чадсангүй.","Could not download the image."));}
    finally{setExporting(false);}
  }
  const step=phase==="idle"?0:count===0?1:2;
  const maxChoices=session?.reserve?.length?Math.min(5,cards.length-count+session.reserve.length):1;
  const notesId=single?"single-card-notes":"reading-notes";
  return <section className="reading-page">
    <header className="reading-intro">
      <div className="section-heading"><h1>{single?tr("Нэг картын уншилт","Single-card reading"):t("Уламжлалт таро")}</h1>
        <p>{tr("Түр саатаад, өнөөдөр сэтгэлд тань байгаа нэг зүйлээ бодоорой.","Take a moment with one thing that has been on your mind.")}</p>
      </div>
      <ol className="reading-steps" aria-label={tr("Уншлагын дараалал","Reading progress")}>
        {[tr("Асуулт","Question"),tr("Сонголт","Draw"),tr("Тайлал","Reading")].map((label,i)=><li key={label} className={i<=step?"reached":""} aria-current={i===step?"step":undefined}>
          <span>{i<step?<Icon name="check" size={12}/>:i+1}</span>{label}</li>)}
      </ol>
    </header>
    <div ref={desk} className="reading-desk" data-pane={mobilePane} data-live={cards.length>0}>
      {cards.length>0&&<div className="mobile-switch" role="group" aria-label={tr("Уншлагын хэсэг","Reading panel")}>
        <button type="button" aria-pressed={mobilePane==="deck"} onClick={()=>setMobilePane("deck")}><Icon name="cards" size={16}/>{tr("Карт","Cards")}</button>
        <button type="button" disabled={!count} aria-pressed={mobilePane==="reading"} onClick={()=>setMobilePane("reading")}><Icon name="book" size={16}/>{tr("Тайлал","Reading")}</button>
      </div>}
      <DeckTable phase={phase} choices={maxChoices} active={active} visibleCount={count} total={spread.cardCount} onPick={reveal} onShuffle={ready&&questionDraft.ready?shuffle:undefined}>
        {count>0&&<div role="group" aria-label={tr("Нээсэн картууд","Revealed cards")} className="position-list">
          {cards.slice(0,count).map((card,i)=><button key={card.card.id} type="button" aria-pressed={activeIndex===i} onClick={()=>{setSelectedIndex(i);setShowChoices(false);setMobilePane("reading");}}>
            <img alt="" src={card.card.image} className={card.isReversed?"rotate-180":""} width="20" height="32" onError={cardFallback}/>
            <span>{i+1}. {positionName(i)}</span></button>)}
        </div>}
        {count>0&&!finished&&!shuffling&&<button type="button" className="text-button table-next" onClick={()=>{setShowChoices(true);setMobilePane("deck");liveFocus.current=true;showDesk();}}><Icon name="cards" size={16}/>{tr("Дараагийн картыг ширээнээс сонгох","Choose the next card from the table")}</button>}
        {session&&<button type="button" className="text-button change-spread" disabled={busy} onClick={()=>startAgain()}>{t("Дэлгэмэл солих")}</button>}
      </DeckTable>
      <div className="reading-panel" aria-busy={shuffling}>
        {!cards.length?<><div className="panel-kicker"><Icon name="pen" size={16}/>{tr("Уншлагын эхлэл","Before you draw")}</div>
          <h2>{session?displayName(spread):tr("Юу бодогдож байна вэ?","What’s on your mind?")}</h2>
          <p className="panel-lead" id="question-hint">{tr("Асуултаа бичвэл тайлалтай холбож өгнө. Дотроо бодоод шууд карт сонгосон ч болно.","Write your question for a more personal reading, or keep it in mind and draw.")}</p>
          <label className="field-label" htmlFor="tarot-question">{tr("Таны асуулт","Your question")} <span>{tr("заавал биш","optional")}</span></label>
          <textarea id="tarot-question" aria-describedby="question-hint" disabled={!questionDraft.ready} value={question} onChange={e=>questionDraft.setText(e.target.value)}
            maxLength={500} rows={2} placeholder={tr("Жишээ нь, ажлаа солихоосоо өмнө юуг бодолцох вэ?","What should I consider before changing jobs?")}/>
          <div className="prompt-list" role="group" aria-label={tr("Жишээ асуултууд","Example questions")}><small>{tr("Жишээ","Try")}</small>{prompts.map(([mn,english,q,eq])=><button key={mn} type="button" disabled={!questionDraft.ready} onClick={()=>questionDraft.setText(en?eq:q)}>{en?english:mn}</button>)}</div>
          {!single&&!session&&<fieldset className="spread-picker"><legend>{tr("Хэдэн карт сугалах вэ?","Choose your spread")}</legend>
            {quickSpreads.map((s,i)=><button type="button" key={s.id} aria-pressed={quickIndex===i} onClick={()=>setQuickIndex(i)}>
              <i className={"mini-spread n"+s.cardCount} aria-hidden="true"><b/>{i===1&&<><b/><b/></>}</i>
              <span><strong>{i?tr("Гурван карт","Three cards"):tr("Нэг карт","One card")}</strong><small>{i?tr("Гурван өнцөг","Three perspectives"):tr("Нэг гол санаа","One clear focus")}</small></span>
            </button>)}</fieldset>}
          <button type="button" className="primary-button shuffle-action" disabled={!ready||!questionDraft.ready} onClick={shuffle}><Icon name="shuffle"/>
            {tr("Картаа холих","Shuffle the deck")}<Icon name="arrow" size={19}/></button>
          <details className="minor-disclosure" id="reading-topic-settings"><summary>{tr("Асуултын чиглэл сонгох","Set a question topic")}</summary>
            <label htmlFor="tarot-topic">{t("Асуултын чиглэл")}</label><select id="tarot-topic" value={topic} onChange={e=>setTopic(e.target.value as typeof topic)}>
              {topicOptions.map(([value,mn,english])=><option key={value} value={value}>{en?english:mn}</option>)}</select></details>
          {(session||single)&&<PhysicalDeckEntry key={spread.id} spread={spread} onReady={cards=>{if(canReplace())begin(spread,cards,[],false);}}/>}
        </>:<>
          <div className="panel-kicker"><Icon name="book" size={16}/>{displayName(spread)}</div>
          {shuffling?<div role="status"><h2>{tr("Картыг хольж байна…","Shuffling the cards…")}</h2><p className="panel-lead">{tr("Хөзрөө дэлгэсний дараа хүссэн нэгээ сонгоорой.","Choose a card when the deck opens.")}</p></div>:
            active&&guidance?<article className="current-meaning" key={active.card.id}>
              <div className="meaning-title"><img src={active.card.image} alt="" width="40" height="64" className={active.isReversed?"rotate-180":""} onError={cardFallback}/>
                <div><div className="position-line">{positionName(activeIndex)} · {active.isReversed?tr("Урвуу","Reversed"):tr("Эгц","Upright")}</div>
                  <h2 className="meaning-heading" tabIndex={-1}>{en?active.card.englishName:active.card.name}</h2></div></div>
              <p className="card-meaning">{en?englishCardMeaning(active.card,active.isReversed):active.isReversed?active.card.reversedMeaning:active.card.meaning}</p>
              {question.trim()&&<blockquote className="your-question">{question.trim()}</blockquote>}
              <p>{guidance.lead} {guidance.question}</p>
              <div className="next-step"><Icon name="pen" size={17}/><div><h3>{tr("Туршаад үзэх нэг алхам","One step to try")}</h3><p>{guidance.action}</p></div></div>
            </article>:<><h2 className="meaning-heading" tabIndex={-1}>{tr("Нэг картаа сонгоорой","Choose a card")}</h2>
              <p className="panel-lead">{session?.reserve?.length?tr("Доош харсан картуудаас аль нэгийг дараарай. Сонгосон картын тань утга энд гарна.","Tap any face-down card on the table. Its meaning will open here."):tr("Эхний картыг дарахад байрлалынх нь тайлал гарна.","Turn over the first card to see its meaning in this position.")}</p>
              {question.trim()&&<blockquote className="your-question">{question.trim()}</blockquote>}</>}
          {!shuffling&&!finished&&<div className="next-controls">
            {count>0&&<button className="primary-button choose-next" type="button" onClick={()=>{setShowChoices(true);setMobilePane("deck");liveFocus.current=true;showDesk();}}>{tr("Ширээнээс дахин сонгох","Choose from the table")}<Icon name="arrow"/></button>}
            <button type="button" className="text-button" onClick={()=>reveal(0)}>{t("Дараагийн картыг нээх")}<Icon name="arrow" size={16}/></button>
          </div>}
          {finished&&<div className="reading-actions">
            <details className="summary-disclosure"><summary>{t("Таны уншилтын тайлал")}</summary>
              <div className="reading-prose">{fullReading.split("\n\n").map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></details>
            <label className="field-label" htmlFor={notesId}>{t("Хувийн тэмдэглэл")} <span>{tr("заавал биш","optional")}</span></label>
            <textarea id={notesId} rows={2} maxLength={2000} disabled={!notes.ready} value={notes.text} onChange={e=>{notes.setText(e.target.value);setSaved(false);setMessage("");}} placeholder={tr("Юу нь танд хамгийн ойр санагдав?","What stayed with you?")}/>
            <div className="action-row"><button type="button" className="primary-button" disabled={busy||saved||!notes.ready} onClick={save}><Icon name={saved?"check":"journal"} size={17}/>{busy?tr("Хадгалж байна…","Saving…"):saved?tr("Хадгалсан","Saved"):t("Төхөөрөмж дээр хадгалах")}</button>
              <button type="button" className="text-button" disabled={busy} onClick={()=>startAgain(true)}>{tr("Шинэ уншлага","New reading")}</button></div>
            <details className="minor-disclosure"><summary>{tr("Зураг татах ба дахин холих","Download or reshuffle")}</summary><div className="action-row">
              <button className="text-button" type="button" onClick={()=>share("story")} disabled={exporting}>{tr("Story зураг татах","Share as Story")}</button>
              <button className="text-button" type="button" onClick={()=>share("square")} disabled={exporting}>{tr("Дөрвөлжин зураг татах","Share square image")}</button>
              <button className="text-button" type="button" onClick={shuffle} disabled={busy}>{t("Дахин холих")}</button></div>
              <small>{tr("Зурагт зөвхөн дэлгэмлийн нэр, картууд орно.","Only the cards and spread name appear in the image.")}</small></details>
          </div>}
        </>}
        {message&&<p role="status" className="form-message">{message}</p>}
        {(error||notes.error||questionDraft.error)&&<p role="alert" className="form-error">{error||notes.error||questionDraft.error}</p>}
      </div>
    </div>
    {session?.spread.id==="celtic-cross"&&cards.length>0&&!shuffling&&<CelticCrossBoard cards={cards} visibleCount={count} onReveal={()=>reveal(0)}/>}
    {!cards.length&&!single&&<SpreadTools chooseSpread={chooseSpread}/>}
  </section>;
}
