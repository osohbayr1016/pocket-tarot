"use client";
import {useEffect,useState} from "react";
import {
  defaultReadingPreferences,getReadingPreferences,saveReadingPreferences,
  type ReadingPreferences
} from "../lib/readingPreferences";

export default function PreferencesPanel(){
  const [prefs,setPrefs]=useState<ReadingPreferences>(defaultReadingPreferences);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>setPrefs(getReadingPreferences()));
    return()=>cancelAnimationFrame(frame);
  },[]);
  function update(next:ReadingPreferences){
    try{
      setPrefs(saveReadingPreferences(next));
      setMessage("Тохиргоог зөвхөн энэ төхөөрөмж дээр хадгаллаа.");
      setError("");
    }catch{
      setError("Тохиргоог хадгалж чадсангүй. Browser storage-г шалгана уу.");
    }
  }
  return <section className="mx-auto max-w-2xl px-3 pb-20">
    <header className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Your ritual</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">Хувийн тохиргоо</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">Эдгээр тохиргоо зөвхөн энэ төхөөрөмжийн browser-д хадгалагдана.</p>
    </header>
    <div className="space-y-5 rounded-2xl border border-amber-300/25 bg-[#211a34] p-6 sm:p-9">
      <label className="flex min-h-14 items-center justify-between gap-4 text-sm text-slate-100">
        <span><strong className="block text-amber-100">Урвуу карт оруулах</strong>
          <span className="mt-1 block text-xs leading-6 text-slate-300">
            Унтраавал шинэ нэг карт болон дэлгэмлийн бүх карт эгц гарна.
          </span></span>
        <input type="checkbox" checked={prefs.allowReversed}
          onChange={event=>update({...prefs,allowReversed:event.target.checked})}
          className="h-5 w-5 accent-amber-300"/>
      </label>
      <div className="border-t border-white/10 pt-5">
        <label htmlFor="back-style" className="block text-sm font-semibold text-amber-100">Картын арын хээ</label>
        <select id="back-style" value={prefs.cardBack}
          onChange={event=>update({...prefs,cardBack:event.target.value==="moon"?"moon":"star"})}
          className="mt-3 w-full rounded-xl border border-white/20 bg-[#171127] p-3 text-sm text-white">
          <option value="star">Одтой сонгодог хээ</option>
          <option value="moon">Сартай хээ</option>
        </select>
      </div>
      <label className="flex min-h-14 items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm text-slate-100">
        <span><strong className="block text-amber-100">Хөдөлгөөнийг багасгах</strong>
          <span className="mt-1 block text-xs leading-6 text-slate-300">
            Flip, hover болон бусад анимейшнийг багасгана. Төхөөрөмжийн reduced-motion тохиргоог мөн хүндэтгэнэ.
          </span></span>
        <input type="checkbox" checked={prefs.reduceMotion}
          onChange={event=>update({...prefs,reduceMotion:event.target.checked})}
          className="h-5 w-5 accent-amber-300"/>
      </label>
      {message&&<p role="status" className="text-sm text-emerald-200">{message}</p>}
      {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
    <p className="mt-7 text-xs leading-6 text-slate-400">
      Уншилтын түүх, асуулт, төрсөн мэдээлэл болон тохиргоог серверт илгээхгүй.
      Browser cache/сайтын мэдээллээ устгавал эдгээр тохиргоо сэргээгдэхгүй.
    </p>
  </section>;
}
