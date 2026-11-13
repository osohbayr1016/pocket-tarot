"use client";
import {useEffect,useRef,useState} from "react";
import {createCompleteBackup,restoreCompleteBackup} from "../lib/offlineBackup";
import {
  defaultReadingPreferences,getReadingPreferences,saveReadingPreferences,
  type ReadingPreferences
} from "../lib/readingPreferences";

export default function PreferencesPanel(){
  const [prefs,setPrefs]=useState<ReadingPreferences>(defaultReadingPreferences);
  const backupInput=useRef<HTMLInputElement>(null);
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
  const exportAll=()=>{
    try{
      const blob=new Blob([createCompleteBackup()],{type:"application/json"});
      const href=URL.createObjectURL(blob), link=document.createElement("a");
      link.href=href;link.download="pocket-tarot-complete-backup.json";link.click();
      setTimeout(()=>URL.revokeObjectURL(href),2000);
      setMessage("Бүх өгөгдлийн JSON backup татагдлаа. Аюулгүй газар хадгалаарай.");setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Backup үүсгэж чадсангүй.");}
  };
  const importAll=async(file:File|undefined)=>{
    if(!file)return;
    if(backupInput.current)backupInput.current.value="";
    if(!window.confirm("Энэ төхөөрөмж дээрх journal, custom spread, тохиргоо бүгд шинэ backup-ээр СОЛИГДОНО. Одоогийн data-г эхлээд export хийсэн үү?"))return;
    try{
      if(file.size>3_000_000)throw new Error("Backup файл 3 MB-ээс бага байх ёстой.");
      const restored=restoreCompleteBackup(await file.text());
      setPrefs(restored.preferences);
      setMessage(restored.readings.length+" уншилт, "+restored.spreads.length+
        " дэлгэмэл болон тохиргоо сэргээгдлээ. Бусад хэсэг рүү орж шинэ мэдээллээ хараарай.");
      setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Backup сэргээхэд алдаа гарлаа.");}
  };
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
    <div className="mt-8 rounded-2xl border border-amber-300/25 bg-[#211a34] p-6 sm:p-9">
      <h2 className="font-serif text-2xl text-amber-100">Бүх мэдээллийн backup</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Journal, дуртай уншилт, custom spread болон тохиргоогоо нэг JSON файлд экспортолж
        өөр төхөөрөмж рүү зөөж болно. Нууц үг эсвэл сервер шаардлагагүй.
        JSON файл таны хувийн тэмдэглэлийг агуулдаг тул бусдад бүү илгээгээрэй.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={exportAll}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#171127]">
          Бүх data export
        </button>
        <input type="file" accept=".json,application/json" ref={backupInput}
          aria-label="Бүх data import JSON" className="sr-only"
          onChange={event=>void importAll(event.target.files?.[0])}/>
        <button type="button" onClick={()=>backupInput.current?.click()}
          className="rounded-full border border-amber-300/40 px-5 py-3 text-sm text-amber-100">
          Backup import
        </button>
      </div>
    </div>
    <p className="mt-7 text-xs leading-6 text-slate-400">
      Уншилтын түүх, асуулт, төрсөн мэдээлэл болон тохиргоог серверт илгээхгүй.
      Browser cache/сайтын мэдээллээ устгавал эдгээр тохиргоо сэргээгдэхгүй.
    </p>
  </section>;
}
