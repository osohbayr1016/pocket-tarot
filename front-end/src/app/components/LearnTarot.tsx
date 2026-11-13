"use client";
import { useState } from "react";
import { tarotCards } from "../data/tarotCards";
import { secureRandomInt } from "../lib/offlineEngine";

type Question = {id:number; options:number[]};
const major=tarotCards.filter(card=>card.arcana==="major");
function nextQuestion():Question{
  const correct=major[secureRandomInt(major.length)];
  const options=[correct.id];
  while(options.length<4){
    const candidate=major[secureRandomInt(major.length)].id;
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
  const begin=()=>{
    try{setQuestion(nextQuestion());setAnswer(null);setError("");}
    catch{setError("Санамсаргүй карт сонгох боломжгүй байна.");}
  };
  const choose=(value:number)=>{
    if(answer!==null||!question)return;
    setAnswer(value);setAttempts(current=>current+1);
    if(value===question.id)setScore(current=>current+1);
  };
  const card=question?tarotCards.find(item=>item.id===question.id):null;
  return <section className="mx-auto max-w-3xl px-3 pb-16">
    <header className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Tarot academy</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">Таро сурах</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">Их Арканын 22 картын дүрслэлийг таних богино дасгал. AI, сервер шаардлагагүй.</p>
      <p className="mt-5 text-sm text-amber-100">Зөв хариулт: {score} / {attempts}</p>
    </header>
    {!question?(
      <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-10 text-center">
        <p className="font-serif text-xl text-amber-100">Зураг хараад картын нэрийг таагаарай.</p>
        <button type="button" onClick={begin} className="mt-6 rounded-full bg-amber-300 px-8 py-3 font-semibold text-[#171127] hover:bg-amber-200">
          Дасгал эхлүүлэх
        </button>
      </div>
    ):(
      <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-6 sm:p-9">
        {card&&<img src={card.image} alt="Таах таро картын зураг" width={220} height={368}
          className="mx-auto aspect-[2/3] h-auto max-h-80 w-auto rounded-lg border border-amber-300/40 object-contain"/>}
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
          </div>
        )}
      </div>
    )}
    {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
  </section>;
}
