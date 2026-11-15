"use client";
import { useState } from "react";
import { getLifeGuidanceLocal } from "../lib/offlineEngine";
import {englishLifeGuidance} from "../lib/englishReflections";
import {useLanguage} from "../lib/LanguageProvider";
export default function LifeGuidance() {
  const {locale}=useLanguage();
  const en=locale==="en";
  const [birthDate,setBirthDate]=useState("");
  const [situation,setSituation]=useState("");
  const [goals,setGoals]=useState("");
  const [challenges,setChallenges]=useState("");
  const [questions,setQuestions]=useState("");
  const [result,setResult]=useState("");
  const [error,setError]=useState("");
  const calculate=()=>{
    try {setResult(en?englishLifeGuidance(birthDate,situation,goals,challenges,questions):getLifeGuidanceLocal(birthDate,situation,goals,challenges,questions));setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Мэдээллээ шалгана уу.");setResult("");}
  };
  const fields=[
    {id:"situation",label:en?"Current situation":"Одоогийн нөхцөл",value:situation,update:setSituation,required:true},
    {id:"goals",label:en?"Goal to work toward":"Хүрэхийг хүсэж буй зорилго",value:goals,update:setGoals,required:false},
    {id:"challenges",label:en?"Main obstacle":"Саад болж буй зүйл",value:challenges,update:setChallenges,required:false},
    {id:"questions",label:en?"Question you are asking":"Өөрөөсөө асууж буй асуулт",value:questions,update:setQuestions,required:false},
  ];
  return <section className="mx-auto max-w-2xl px-3">
    <header className="mb-9 text-center"><p className="text-xs uppercase tracking-[0.25em] text-pine">Personal reflection</p>
      <h2 className="mt-3 font-serif text-4xl text-ink">{en?"Life reflection guide":"Амьдралын удирдамж"}</h2>
      <p className="mt-3 text-sm text-muted">{en?"Organize your goals and obstacles locally, without AI prediction.":"AI таамаглал биш. Өөрийн зорилго, саадыг цэгцлэх орон нутгийн туслах."}</p>
    </header>
    <div className="space-y-5 rounded-2xl border border-rule bg-sheet p-6 sm:p-9">
      <div><label htmlFor="life-birth" className="mb-2 block text-sm font-medium text-ink">{en?"Birth date (required)":"Төрсөн огноо (заавал)"}</label>
        <input id="life-birth" type="date" required value={birthDate} onChange={(event)=>setBirthDate(event.target.value)}
          className="w-full rounded-lg border border-rule bg-paper p-3 text-ink"/></div>
      {fields.map((field)=><div key={field.id}>
        <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-ink">{field.label}{field.required?" *":""}</label>
        <textarea id={field.id} required={field.required} value={field.value} maxLength={500}
          onChange={(event)=>field.update(event.target.value)} rows={2}
          className="w-full resize-y rounded-lg border border-rule bg-sheet p-3 text-ink focus:border-pine focus:outline-none"/>
      </div>)}
      <button type="button" onClick={calculate} className="w-full rounded-full bg-pine px-6 py-3 font-semibold text-on-pine hover:bg-deep">
        {en?"Create reflection steps":"Эргэцүүлэх алхам гаргах"}
      </button>
      {error&&<p role="alert" className="text-sm text-danger">{error}</p>}
      {result&&<pre className="whitespace-pre-wrap rounded-xl bg-sheet p-5 font-sans text-sm leading-7 text-ink">{result}</pre>}
      <p className="text-xs text-muted">{en?"Your answers stay on this page and are never sent to a server.":"Оруулсан мэдээлэл сервер рүү илгээгдэхгүй, зөвхөн энэ хуудсан дээр боловсруулагдана."}</p>
    </div>
  </section>;
}
