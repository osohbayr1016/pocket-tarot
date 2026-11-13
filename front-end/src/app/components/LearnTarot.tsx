"use client";
import { useEffect, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { secureRandomInt } from "../lib/offlineEngine";
import {loadStudyProgress,saveStudyProgress,reviewCard,learningStats,pickStudyCard,type CardProgress} from "../lib/studyProgress";
import {TAROT_LESSONS,lessonMetrics} from "../lib/tarotCurriculum";

type Question = {id:number; options:number[]};
type QuizPool = "major" | "minor" | "all";
function nextQuestion(pool: QuizPool,progress:CardProgress[],lastId:number|null,dueOnly:boolean,lessonIds?:readonly number[]):Question|null{
  const cards=lessonIds?tarotCards.filter(c=>lessonIds.includes(c.id)):pool==="all"?tarotCards:tarotCards.filter(card=>card.arcana===pool);
  if(cards.length<4)throw new Error("Дасгалд дор хаяж 4 карт байх ёстой.");
  const chosen=pickStudyCard(cards.map(c=>c.id),progress,lastId,secureRandomInt,Date.now(),dueOnly);
  if(chosen===null)return null;
  const correct=cards.find(c=>c.id===chosen);
  if(!correct)throw new Error("Сургалтын карт олдсонгүй.");
  const options=[correct.id];
  while(options.length<4){
    const candidate=cards[secureRandomInt(cards.length)].id;
    if(!options.includes(candidate))options.push(candidate);
  }
  for(let index=options.length-1;index>0;index--){
    const target=secureRandomInt(index+1);
    [options[index],options[target]]=[options[target],options[index]];
  }
  return {id:correct.id,options};
}
export default function LearnTarot(){
  const [question,setQuestion]=useState<Question|null>(null);
  const [answer,setAnswer]=useState<number|null>(null);
  const [score,setScore]=useState(0);
  const [attempts,setAttempts]=useState(0);
  const [error,setError]=useState("");
  const [pool,setPool]=useState<QuizPool>("major");
  const [lessonId,setLessonId]=useState<string|null>(null);
  const [dueOnly,setDueOnly]=useState(false);
  const [progress,setProgress]=useState<CardProgress[]>([]);
  const [priorCard,setPriorCard]=useState<number|null>(null);
  const [isReady,setIsReady]=useState(false);
  const [now,setNow]=useState(0);
  const stats=learningStats(progress,now);
  const activeLesson=TAROT_LESSONS.find(lesson=>lesson.id===lessonId);
  const poolIds=activeLesson?activeLesson.cardIds:
    (pool==="all"?tarotCards:tarotCards.filter(card=>card.arcana===pool)).map(c=>c.id);
  const dueInPool=progress.filter(p=>poolIds.includes(p.id)&&p.dueAt<=now).length;
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      try{
        setProgress(loadStudyProgress());
        setIsReady(true);
      }catch(cause){
        setError(cause instanceof Error?cause.message:"Сургалтын ахицын санг уншиж чадсангүй.");
        setIsReady(false);
      }
      setNow(Date.now());
    });
    const onVisible=()=>{if(document.visibilityState==="visible")setNow(Date.now());};
    document.addEventListener("visibilitychange",onVisible);
    const refresh=setInterval(()=>setNow(Date.now()),60_000);
    return()=>{cancelAnimationFrame(frame);clearInterval(refresh);document.removeEventListener("visibilitychange",onVisible);};
  },[]);
  const begin=()=>{
    try{
      const next=nextQuestion(pool,progress,priorCard,dueOnly,activeLesson?.cardIds);
      setQuestion(next);setAnswer(null);setError("");
      if(next)setPriorCard(next.id);
    }catch(cause){setError(cause instanceof Error?cause.message:"Санамсаргүй карт сонгох боломжгүй байна.");}
  };
  const choose=(value:number)=>{
    if(answer!==null||!question)return;
    setAnswer(value);setAttempts(current=>current+1);
    if(value===question.id)setScore(current=>current+1);
    try{
      const next=reviewCard(progress,question.id,value===question.id);
      saveStudyProgress(next);
      setProgress(next);
      setNow(next.find(row=>row.id===question.id)?.lastReviewedAt??now);
    }catch(cause){setError(cause instanceof Error?cause.message:"Сургалтын оноо хадгалагдсангүй.");}
  };
  const card=question?tarotCards.find(item=>item.id===question.id):null;
  return <section className="mx-auto max-w-3xl px-3 pb-16">
    <header className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Tarot academy</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">Таро сурах</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">Их Аркан, Бага Аркан болон бүх 78 картын дүрслэлийг таних дасгал. AI, сервер шаардлагагүй.</p>
      <p className="mt-5 text-sm text-amber-100">Энэ удаагийн оноо: {score} / {attempts}</p>
      <div aria-label="Сургалтын ахиц" className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center sm:gap-4">
        <div><span className="block text-lg font-semibold text-amber-100">{stats.studied}/78</span><span className="text-xs text-slate-300">Үзсэн карт</span></div>
        <div><span className="block text-lg font-semibold text-amber-100">{stats.due}</span><span className="text-xs text-slate-300">Давтах хэрэгтэй</span></div>
        <div><span className="block text-lg font-semibold text-amber-100">{stats.mastered}</span><span className="text-xs text-slate-300">Тогтсон карт</span></div>
      </div>
    </header>
    <section aria-label="Таро сургалтын шаталсан хөтөлбөр" className="mb-8 rounded-2xl border border-amber-300/20 bg-[#211a34] p-5 sm:p-7">
      <h2 className="font-serif text-2xl text-amber-100">7 шаттай сургалтын замнал</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Эхлээд Их Арканын бэлгэдлийг таньж, дараа нь дөрвөн бүлэг болон бүх 78 картад шилжинэ.
        Карт бүрт хоёр удаа дараалан зөв хариулбал тухайн хичээлийн ахиц нэмэгдэнэ.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {TAROT_LESSONS.map(lesson=>{
          const metrics=lessonMetrics(lesson,progress);
          const active=lessonId===lesson.id;
          return <article key={lesson.id} className={"rounded-xl border p-4 "+
            (active?"border-amber-300/65 bg-amber-300/10":"border-white/10 bg-white/5")}>
            <h3 className="font-semibold text-amber-100">{lesson.title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-300">{lesson.description}</p>
            <div role="progressbar" aria-label={lesson.title+" ахиц"} aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={metrics.completion}
              className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-300" style={{width:metrics.completion+"%"}}/>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              {metrics.started}/{metrics.total} үзсэн · {metrics.confident}/{metrics.total} танил карт
            </p>
            <button type="button" aria-pressed={active} onClick={()=>{
              setLessonId(lesson.id);setDueOnly(false);
              setQuestion(null);setAnswer(null);setScore(0);setAttempts(0);
            }} className="mt-3 min-h-11 rounded-full border border-amber-300/40 px-4 py-2 text-xs text-amber-100">
              {active?"Сонгосон хичээл":"Энэ хичээлийг сурах"}
            </button>
          </article>;
        })}
      </div>
    </section>
    <fieldset className="mx-auto mb-7 max-w-xl">
      <legend className="mb-3 text-sm text-amber-100">Суралцах картын хүрээ</legend>
      <div className="flex flex-wrap justify-center gap-2">
        {([
          ["major","Их Аркан (22)"],
          ["minor","Бага Аркан (56)"],
          ["all","Бүгд (78)"]
        ] as const).map(([value,label])=>(
          <button type="button" key={value} aria-pressed={pool===value&&lessonId===null}
            onClick={()=>{setPool(value);setLessonId(null);setQuestion(null);setAnswer(null);setScore(0);setAttempts(0);}}
            className={"rounded-full border px-4 py-2 text-sm transition-colors "+
              (pool===value?"border-amber-300 bg-amber-300 text-[#171127]":"border-white/25 text-slate-200 hover:border-amber-300/50")}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
    <div className="mx-auto mb-6 flex max-w-xl flex-wrap items-center justify-center gap-3">
      <label className="flex min-h-11 items-center gap-2 rounded-full border border-amber-300/20 px-4 py-2 text-sm text-amber-100">
        <input type="checkbox" checked={dueOnly} onChange={event=>{
          setDueOnly(event.target.checked);setQuestion(null);setAnswer(null);
        }} className="h-4 w-4 accent-amber-300"/>
        Зөвхөн давтах карт ({dueInPool})
      </label>
      <button type="button" onClick={()=>{
        if(!window.confirm("78 картын сургалтын ахицыг энэ төхөөрөмжөөс устгах уу?"))return;
        try{saveStudyProgress([]);setProgress([]);setQuestion(null);setAnswer(null);setScore(0);setAttempts(0);setError("");setIsReady(true);}
        catch(cause){setError(cause instanceof Error?cause.message:"Ахиц устгагдсангүй.");}
      }} className="min-h-11 rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200">
        Ахиц арилгах
      </button>
    </div>
    {!question?(
      <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-10 text-center">
        <p className="font-serif text-xl text-amber-100">Зураг хараад картын нэрийг таагаарай.</p>
        <button type="button" onClick={begin} disabled={!isReady||(dueOnly&&dueInPool===0)} className="mt-6 rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#171127] hover:bg-amber-200">
          {dueOnly?"Давтлага эхлүүлэх":"Дасгал эхлүүлэх"}
        </button>
        {dueOnly&&dueInPool===0&&<p role="status" className="mt-4 text-sm text-emerald-200">Одоогоор хугацаа болсон давтах карт алга. Шинэ картын дасгалыг сонгож болно.</p>}
      </div>
    ):(
      <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-6 sm:p-9">
        {card&&<div className="relative mx-auto aspect-[2/3] w-52 overflow-hidden rounded-lg border border-amber-300/40 bg-[#181226]">
          <img src={card.image} alt="Таах таро картын зураг" width={220} height={368}
            className="h-full w-full object-cover"/>
          {answer===null&&<div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-[15%] items-center justify-center border-t border-amber-300/30 bg-[#181226]">
            <span className="font-serif text-xs tracking-widest text-amber-200">POCKET TAROT</span>
          </div>}
        </div>}
        <p className="my-6 text-center font-serif text-xl text-amber-100">Энэ ямар карт вэ?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map(id=>{
            const item=tarotCards.find(c=>c.id===id);
            const correct=id===question.id;
            return <button type="button" key={id} disabled={answer!==null} onClick={()=>choose(id)}
              className={"min-h-14 rounded-xl border px-4 py-3 text-left text-sm transition-colors "+
                (answer!==null&&correct?"border-emerald-300 bg-emerald-400/15 text-emerald-100":
                answer===id?"border-red-300 bg-red-400/15 text-red-100":
                "border-white/20 bg-white/5 text-slate-100 hover:border-amber-300/50")}>
              {item?.name}
            </button>;
          })}
        </div>
        {answer!==null&&card&&(
          <div role="status" className="mt-6 rounded-xl border border-amber-300/20 bg-white/5 p-5 text-sm leading-relaxed text-slate-200">
            <p className="font-semibold text-amber-100">{answer===card.id?"Зөв хариуллаа!":"Дараагийн удаа амжилт!"} {card.name}</p>
            <p className="mt-2">{card.meaning}</p>
            <p className="mt-2 text-xs text-slate-400">Урвуу: {card.reversedMeaning}</p>
            <button type="button" onClick={begin} className="mt-4 rounded-full bg-amber-300 px-6 py-2 font-semibold text-[#171127]">Дараагийн карт</button>
            <p className="mt-3 text-xs leading-5 text-slate-400">Зөв хариулсан карт 1, 3, 7+ хоногийн зайтай давтагдана. Алдсан карт давтлагад шууд орно.</p>
          </div>
        )}
      </div>
    )}
    {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
  </section>;
}
