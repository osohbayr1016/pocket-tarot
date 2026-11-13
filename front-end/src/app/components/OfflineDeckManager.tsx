"use client";
import { useEffect, useRef, useState } from "react";
import { tarotCards } from "../data/tarotCards";

const CACHE_NAME = "pocket-tarot-v3-assets";
const images = tarotCards.map(c=>c.image);
export default function OfflineDeckManager(){
  const [cached,setCached]=useState(0);
  const [working,setWorking]=useState(false);
  const [error,setError]=useState("");
  const [status,setStatus]=useState("");
  const [storage,setStorage]=useState("");
  const cancelled=useRef(false);
  const supported=typeof window!=="undefined"&&"caches" in window;
  const refresh=async()=>{
    if(!("caches" in window))return;
    const cache=await caches.open(CACHE_NAME);
    const results=await Promise.all(images.map(src=>cache.match(src)));
    setCached(results.filter(Boolean).length);
    if(navigator.storage?.estimate){
      const {usage,quota}=await navigator.storage.estimate();
      if(usage!==undefined&&quota!==undefined){
        setStorage((usage/1024/1024).toFixed(1)+" MB / "+(quota/1024/1024).toFixed(0)+" MB");
      }
    }
  };
  useEffect(()=>{
    void refresh().catch(()=>setError("Cache мэдээллийг уншиж чадсангүй."));
    return ()=>{cancelled.current=true;};
  },[]);
  const download=async()=>{
    cancelled.current=false;
    setWorking(true);setError("");setStatus("Картын зургуудыг татаж байна...");
    let success=0;
    try{
      if(!supported)throw new Error("Энэ browser Offline Cache API дэмжихгүй байна.");
      const cache=await caches.open(CACHE_NAME);
      for(const src of images){
        if(cancelled.current)break;
        if(await cache.match(src)){success++;setCached(success);continue;}
        const response=await fetch(src,{cache:"reload"});
        if(!response.ok || !response.headers.get("content-type")?.includes("image")){
          throw new Error("Зураг татаж чадсангүй: "+src);
        }
        await cache.put(src,response.clone());
        success++;setCached(success);
      }
      if(cancelled.current)setStatus("Таталт зогссон. Дараа нь үргэлжлүүлж болно.");
      else setStatus(success===78?"78 картын зураг энэ төхөөрөмж дээр бэлэн.":"Кэш хэсэгчлэн бэлэн.");
      await refresh();
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Offline карт татахад алдаа гарлаа.");
      setStatus("Татагдсан зургууд хадгалагдсан. Дахин оролдож үргэлжлүүлнэ үү.");
    }finally{setWorking(false);}
  };
  const clear=async()=>{
    if(!supported)return;
    if(!window.confirm("Энэ төхөөрөмжөөс 78 картын татсан зургийг арилгах уу?"))return;
    try{
      const cache=await caches.open(CACHE_NAME);
      await Promise.all(images.map(src=>cache.delete(src)));
      setCached(0);setStatus("Картын зураг cache-ээс ариллаа.");setError("");
      await refresh();
    }catch{setError("Зургийн cache арилгаж чадсангүй.");}
  };
  return <section className="mx-auto max-w-3xl px-3 pb-20">
    <header className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Offline library</p>
      <h1 className="mt-3 font-serif text-4xl text-amber-50">Офлайн картын сан</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        Бүх 78 картын WebP зургийг нэг удаа татаж хадгалаад интернэтгүй үед харах боломжтой.
        Тайлбарын engine анхнаасаа таны төхөөрөмж дээр ажилладаг.
      </p>
    </header>
    <div className="rounded-2xl border border-amber-300/20 bg-[#211a34] p-6 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-amber-100">Картын offline бэлэн байдал</h2>
        <span className="rounded-full border border-amber-300/25 px-4 py-2 text-sm text-amber-100">
          {cached} / 78
        </span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={78} aria-valuenow={cached}
        aria-label="Offline карт таталтын явц" className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
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
      {status&&<p role="status" className="mt-5 text-sm text-emerald-200">{status}</p>}
      {error&&<p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
      <p className="mt-7 text-xs leading-6 text-slate-400">
        Browser хадгалсан зургийг зай хүрэлцэхгүй үед өөрөө арилгаж болдог. Жинхэнэ offline reload-д
        вэб аппын PWA service worker-ийг онлайн үед суулгасан байх шаардлагатай.
        Энэ нь таны төрсөн мэдээлэл, асуулт, тэмдэглэлийг хаашаа ч илгээхгүй.
      </p>
    </div>
  </section>;
}
