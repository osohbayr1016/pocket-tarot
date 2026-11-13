"use client";
import { useEffect, useRef, useState } from "react";
import { tarotCards } from "../data/tarotCards";
import InstallGuide from "./InstallGuide";
import {useLanguage} from "../lib/LanguageProvider";

const CACHE_NAME = "pocket-tarot-art-v1";
const images = tarotCards.map(c=>c.image);
export default function OfflineDeckManager(){
  const {locale}=useLanguage();
  const en=locale==="en";
  const [cached,setCached]=useState(0);
  const [working,setWorking]=useState(false);
  const [error,setError]=useState("");
  const [status,setStatus]=useState("");
  const [storage,setStorage]=useState("");
  const [persisted,setPersisted]=useState<boolean|null>(null);
  const cancelled=useRef(false);
  const supported=typeof window!=="undefined"&&"caches" in window;
  const refresh=async()=>{
    if(!("caches" in window))return;
    const cache=await caches.open(CACHE_NAME);
    const results=await Promise.all(images.map(src=>cache.match(src)));
    setCached(results.filter(Boolean).length);
    if(navigator.storage?.persisted){
      try{setPersisted(await navigator.storage.persisted());}catch{/* Unsupported storage estimate should not prevent offline cards. */}
    }
    if(navigator.storage?.estimate){
      const {usage,quota}=await navigator.storage.estimate();
      if(usage!==undefined&&quota!==undefined){
        setStorage((usage/1024/1024).toFixed(1)+" MB / "+(quota/1024/1024).toFixed(0)+" MB");
      }
    }
  };
  useEffect(()=>{
    // Browser Cache API is asynchronous and only available after hydration.
    const frame=requestAnimationFrame(()=>{
      void refresh().catch(()=>setError(en?"Could not read cached images.":"Cache мэдээллийг уншиж чадсангүй."));
    });
    return ()=>{cancelled.current=true;cancelAnimationFrame(frame);};
  },[en]);
  const download=async()=>{
    cancelled.current=false;
    setWorking(true);setError("");setStatus(en?"Downloading card images...":"Картын зургуудыг татаж байна...");
    let success=0;
    try{
      if(!supported)throw new Error(en?"This browser does not support offline Cache API.":"Энэ browser Offline Cache API дэмжихгүй байна.");
      const cache=await caches.open(CACHE_NAME);
      for(const src of images){
        if(cancelled.current)break;
        if(await cache.match(src)){success++;setCached(success);continue;}
        const response=await fetch(src,{cache:"reload"});
        if(!response.ok || !response.headers.get("content-type")?.includes("image")){
          throw new Error((en?"Could not download image: ":"Зураг татаж чадсангүй: ")+src);
        }
        await cache.put(src,response.clone());
        success++;setCached(success);
      }
      if(cancelled.current)setStatus(en?"Download paused. You can resume later.":"Таталт зогссон. Дараа нь үргэлжлүүлж болно.");
      else setStatus(success===78?(en?"All 78 cards are ready on this device.":"78 картын зураг энэ төхөөрөмж дээр бэлэн."):(en?"Partial cache ready.":"Кэш хэсэгчлэн бэлэн."));
      await refresh();
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Offline карт татахад алдаа гарлаа.");
      setStatus(en?"Downloaded images were kept. Retry to continue.":"Татагдсан зургууд хадгалагдсан. Дахин оролдож үргэлжлүүлнэ үү.");
    }finally{setWorking(false);}
  };
  const clear=async()=>{
    if(!supported)return;
    if(!window.confirm(en?"Delete the downloaded artwork for all 78 cards?":"Энэ төхөөрөмжөөс 78 картын татсан зургийг арилгах уу?"))return;
    try{
      const cache=await caches.open(CACHE_NAME);
      await Promise.all(images.map(src=>cache.delete(src)));
      setCached(0);setStatus(en?"Downloaded card images cleared.":"Картын зураг cache-ээс ариллаа.");setError("");
      await refresh();
    }catch{setError("Зургийн cache арилгаж чадсангүй.");}
  };
  const requestPersistence=async()=>{
    if(!navigator.storage?.persist)return;
    try{
      const result=await navigator.storage.persist();
      setPersisted(result);
      setStatus(result?
        (en?"Persistent storage granted. Browser data deletion can still remove your files.":"Тогтвортой хадгалалтын зөвшөөрөл олгогдлоо. Browser-ийн өгөгдлийг арилгавал файлууд устаж болно."):
        (en?"Persistent storage not granted. Keep a separate backup.":"Тогтвортой хадгалалтын зөвшөөрөл олгосонгүй. Тусдаа backup хадгална уу."));
    }catch{setError(en?"Could not request persistent storage.":"Тогтвортой хадгалалтын зөвшөөрөл авахад алдаа гарлаа.");}
  };
  const checkUpdate=async()=>{
    try{
      const registration=await navigator.serviceWorker?.getRegistration();
      if(!registration)throw new Error(en?"Install this PWA online before checking updates.":"Шинэчлэлт шалгахын өмнө онлайн үед PWA суулгана уу.");
      await registration.update();
      setStatus(en?"Update check completed. A new version will activate if available.":"Шинэчлэлт шалгалаа. Шинэ хувилбар байвал автоматаар идэвхжинэ.");
    }catch(cause){setError(cause instanceof Error?cause.message:"PWA шинэчлэлт шалгаж чадсангүй.");}
  };
  return <section className="mx-auto max-w-3xl px-3 pb-20">
    <header className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Offline library</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">{en?"Offline card library":"Офлайн картын сан"}</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {en?"Download the 78 optimized card images once to use them without internet. The interpretation engine already runs locally on your device.":"Бүх 78 картын WebP зургийг нэг удаа татаж хадгалаад интернэтгүй үед харах боломжтой. Тайлбарын engine анхнаасаа таны төхөөрөмж дээр ажилладаг."}
      </p>
    </header>
    <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-6 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-amber-100">{en?"Artwork available offline":"Картын offline бэлэн байдал"}</h2>
        <span className="rounded-full border border-amber-300/25 px-4 py-2 text-sm text-amber-100">
          {cached} / 78
        </span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={78} aria-valuenow={cached}
        aria-label={en?"Offline artwork download progress":"Offline карт таталтын явц"} className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-amber-300 transition-[width]" style={{width:(cached/78*100)+"%"}}/>
      </div>
      {storage&&<p className="mt-3 text-xs text-slate-400">Browser storage: {storage}</p>}
      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={()=>void download()} disabled={!supported||working||cached===78}
          className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127] disabled:opacity-50">
          {working?"Татаж байна...":cached===78?"Бүх зураг бэлэн":"78 зураг offline татах"}
        </button>
        {working&&<button type="button" onClick={()=>{cancelled.current=true;}}
          className="rounded-full border border-white/30 px-5 py-3 text-sm text-slate-200">
          Зогсоох
        </button>}
        <button type="button" onClick={()=>void clear()} disabled={working||cached===0}
          className="rounded-full border border-red-300/40 px-5 py-3 text-sm text-red-200 disabled:opacity-50">
          Cache арилгах
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <button type="button" onClick={()=>void requestPersistence()}
          disabled={persisted===true||typeof navigator==="undefined"||!navigator.storage?.persist}
          className="min-h-11 rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-100 disabled:opacity-50">
          {persisted===true?(en?"Persistent storage enabled":"Тогтвортой хадгалалт идэвхтэй"):
            (en?"Protect offline storage":"Offline хадгалалтыг хамгаалах")}
        </button>
        <button type="button" onClick={()=>void checkUpdate()}
          className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200">
          {en?"Check for app updates":"Шинэчлэлт шалгах"}
        </button>
      </div>
      {status&&<p role="status" className="mt-5 text-sm text-emerald-200">{status}</p>}
      {error&&<p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
      <p className="mt-7 text-xs leading-6 text-slate-400">
        {en?"Browsers may evict caches under storage pressure. A PWA service worker must be installed online before an offline reload. This does not upload your birth details, questions or notes.":
        "Browser хадгалсан зургийг зай хүрэлцэхгүй үед өөрөө арилгаж болдог. Жинхэнэ offline reload-д вэб аппын PWA service worker-ийг онлайн үед суулгасан байх шаардлагатай. Энэ нь таны төрсөн мэдээлэл, асуулт, тэмдэглэлийг хаашаа ч илгээхгүй."}
      </p>
    </div>
    <InstallGuide/>
  </section>;
}
