"use client";
import {useEffect,useState} from "react";

interface DeferredInstallPrompt extends Event{
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
}
export default function InstallGuide(){
  const [prompt,setPrompt]=useState<DeferredInstallPrompt|null>(null);
  const [installed,setInstalled]=useState(false);
  const [status,setStatus]=useState("");
  useEffect(()=>{
    const onPrompt=(event:Event)=>{
      event.preventDefault();setPrompt(event as DeferredInstallPrompt);
    };
    const onInstalled=()=>{setInstalled(true);setPrompt(null);setStatus("Pocket Tarot суулгагдлаа.");};
    window.addEventListener("beforeinstallprompt",onPrompt);
    window.addEventListener("appinstalled",onInstalled);
    const isStandalone=window.matchMedia?.("(display-mode: standalone)").matches
      ||(navigator as Navigator&{standalone?:boolean}).standalone===true;
    const frame=requestAnimationFrame(()=>{if(isStandalone)setInstalled(true);});
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt",onPrompt);
      window.removeEventListener("appinstalled",onInstalled);
    };
  },[]);
  const install=async()=>{
    if(!prompt)return;
    try{
      await prompt.prompt();
      const response=await prompt.userChoice;
      setStatus(response.outcome==="accepted"?"Суулгах хүсэлт баталгаажлаа.":"Суулгах хүсэлтийг цуцаллаа.");
      setPrompt(null);
    }catch{setStatus("Автоматаар суулгах боломжгүй. Доорх browser зааврыг ашиглаарай.");}
  };
  return <section aria-label="Pocket Tarot веб апп суулгах заавар"
    className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-300/25 bg-[#211a34] p-6">
    <h2 className="font-serif text-2xl text-amber-100">Утсан дээрээ апп шиг суулгах</h2>
    <p className="mt-3 text-sm leading-6 text-slate-300">
      Pocket Tarot нь PWA. Эхлээд онлайн үед ачаалж, шаардлагатай зургуудаа offline татсаны дараа
      интернэтгүй үед ихэнх үндсэн үйлдлийг ашиглаж болно.
    </p>
    {prompt&&!installed&&<button type="button" onClick={()=>void install()}
      className="mt-5 min-h-11 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#171127]">
      Энэ төхөөрөмж дээр апп суулгах
    </button>}
    {installed&&<p role="status" className="mt-4 text-sm text-emerald-200">Энэ төхөөрөмж дээр суулгасан горимоор ажиллаж байна.</p>}
    {status&&<p role="status" className="mt-4 text-sm text-amber-100">{status}</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-semibold text-amber-100">iPhone / Safari</h3>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-300">
          <li>Safari-аар Pocket Tarot сайтаа нээнэ</li>
          <li>Share (<span aria-label="Share icon">□↑</span>) товчин дээр дарна</li>
          <li>Add to Home Screen сонгоод Add дарна</li>
          <li>Home Screen-ээс аппыг нээгээд offline карт татна</li>
        </ol>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-semibold text-amber-100">Android / Chrome</h3>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-300">
          <li>Chrome-оор сайтаа нээнэ</li>
          <li>⋮ цэснээс Install app эсвэл Add to Home screen сонгоно</li>
          <li>Install дарж баталгаажуулна</li>
          <li>Offline картын сангаас 78 зургийг татна</li>
        </ol>
      </div>
    </div>
    <p className="mt-5 text-xs leading-6 text-slate-400">
      iOS болон browser бүр PWA-г ялгаатай дэмждэг. Storage цэвэрлэх, cache eviction, анхны offline нээлт
      дээр татагдаагүй content харагдахгүй байж болно. Суулгалт нь automatic data backup биш.
    </p>
  </section>;
}
