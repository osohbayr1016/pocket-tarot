"use client";
import { useState } from "react";
import { getLifeGuidanceLocal } from "../lib/offlineEngine";
export default function LifeGuidance() {
  const [birthDate,setBirthDate]=useState("");
  const [situation,setSituation]=useState("");
  const [goals,setGoals]=useState("");
  const [challenges,setChallenges]=useState("");
  const [questions,setQuestions]=useState("");
  const [result,setResult]=useState("");
  const [error,setError]=useState("");
  const calculate=()=>{
    try {setResult(getLifeGuidanceLocal(birthDate,situation,goals,challenges,questions));setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Мэдээллээ шалгана уу.");setResult("");}
  };
  const fields=[
    {id:"situation",label:"Одоогийн нөхцөл",value:situation,update:setSituation,required:true},
    {id:"goals",label:"Хүрэхийг хүсэж буй зорилго",value:goals,update:setGoals,required:false},
    {id:"challenges",label:"Саад болж буй зүйл",value:challenges,update:setChallenges,required:false},
    {id:"questions",label:"Өөрөөсөө асууж буй асуулт",value:questions,update:setQuestions,required:false},
  ];
  return <section className="mx-auto max-w-2xl px-3">
    <header className="mb-9 text-center"><p className="text-xs uppercase tracking-[0.25em] text-amber-300">Personal reflection</p>
      <h2 className="mt-3 font-serif text-4xl text-amber-50">Амьдралын удирдамж</h2>
      <p className="mt-3 text-sm text-slate-300">AI таамаглал биш. Өөрийн зорилго, саадыг цэгцлэх орон нутгийн туслах.</p>
    </header>
    <div className="space-y-5 rounded-2xl border border-amber-300/20 bg-[#201b33] p-6 sm:p-9">
      <div><label htmlFor="life-birth" className="mb-2 block text-sm font-medium text-amber-100">Төрсөн огноо</label>
        <input id="life-birth" type="date" value={birthDate} onChange={(event)=>setBirthDate(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-[#121122] p-3 text-white"/></div>
      {fields.map((field)=><div key={field.id}>
        <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-amber-100">{field.label}{field.required?" *":""}</label>
        <textarea id={field.id} required={field.required} value={field.value} maxLength={500}
          onChange={(event)=>field.update(event.target.value)} rows={2}
          className="w-full resize-y rounded-lg border border-white/20 bg-white/5 p-3 text-white focus:border-amber-300 focus:outline-none"/>
      </div>)}
      <button type="button" onClick={calculate} className="w-full rounded-full bg-amber-300 px-6 py-3 font-semibold text-[#171127] hover:bg-amber-200">
        Эргэцүүлэх алхам гаргах
      </button>
      {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
      {result&&<pre className="whitespace-pre-wrap rounded-xl bg-white/5 p-5 font-sans text-sm leading-7 text-slate-100">{result}</pre>}
      <p className="text-xs text-slate-400">Оруулсан мэдээлэл сервер рүү илгээгдэхгүй, зөвхөн энэ хуудсан дээр боловсруулагдана.</p>
    </div>
  </section>;
}
