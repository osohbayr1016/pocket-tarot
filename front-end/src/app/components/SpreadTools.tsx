"use client";
import {useState,useEffect} from "react";
import {tarotSpreads,type TarotSpread} from "../data/tarotSpreads";
import {makeCustomSpread} from "../lib/customSpread";
import {useLanguage} from "../lib/LanguageProvider";
import {englishSpreadName,englishSpreadDescription} from "../lib/englishSpreads";
import {loadSavedSpreads,saveCustomSpread,deleteCustomSpread,savedToSpread,type SavedSpread} from "../lib/savedCustomSpreads";
import {Icon} from "./InterfaceIcon";

export default function SpreadTools({chooseSpread}:{chooseSpread:(spread:TarotSpread)=>void}){
  const {locale}=useLanguage(), en=locale==="en";
  const tr=(mn:string,english:string)=>en?english:mn;
  const [error,setError]=useState("");
  const [customCount,setCustomCount] = useState(3);
  const [customName,setCustomName] = useState("Миний дэлгэмэл");
  const [savedSpreads,setSavedSpreads] = useState<SavedSpread[]>([]);
  const [templateMessage,setTemplateMessage] = useState("");
  const [customLabels,setCustomLabels] = useState<string[]>([]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      try{setSavedSpreads(loadSavedSpreads());}
      catch(cause){setError(cause instanceof Error?cause.message:"Хадгалсан дэлгэмлийг уншиж чадсангүй.");}
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  const saveTemplate=()=>{
    try{
      const labels=makeCustomSpread(customCount,customLabels).positions.map(p=>p.name);
      setSavedSpreads(saveCustomSpread(customName.trim(),labels));
      setTemplateMessage(tr("Дэлгэмлийг энэ төхөөрөмж дээр хадгаллаа.","Spread template saved on this device."));
      setError("");
    }catch(cause){setError(cause instanceof Error?cause.message:"Дэлгэмлийг хадгалж чадсангүй.");}
  };
  return <section className="spread-tools">
    <h2>{tr("Дэлгэмэл сонгох","Explore the spreads")}</h2>
    <div className="spread-catalog">{tarotSpreads.map(option=><button type="button" key={option.id} onClick={()=>chooseSpread(option)}>
      <span className="spread-glyph" aria-hidden="true"><Icon name="layers" size={26}/></span>
      <span><strong>{en?englishSpreadName(option):option.name}</strong><small>{en?englishSpreadDescription(option):option.description}</small></span>
      <span className="spread-size">{option.cardCount} {en?"cards":"карт"}</span><Icon name="chevron" size={15}/>
    </button>)}</div>
          {savedSpreads.length>0&&<section aria-label={tr("Миний хадгалсан дэлгэмлүүд","My saved spreads")} className="mt-8">
            <h3 className="mb-4 font-serif text-xl text-ink">{tr("Хадгалсан дэлгэмлүүд","Saved spreads")}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedSpreads.map(template=>(
                <div key={template.id} className="flex items-center gap-2 rounded-xl border border-rule bg-sheet p-3">
                  <button type="button" onClick={()=>chooseSpread(savedToSpread(template))}
                    className="min-h-12 flex-1 text-left text-sm text-ink hover:text-ink">
                    <span className="block font-medium">{template.name}</span>
                    <span className="block text-xs text-muted">{template.labels.length} {tr("карт · Сонгож унших","cards · Select to read")}</span>
                  </button>
                  <button type="button" aria-label={template.name+(en?" delete":" устгах")} onClick={()=>{
                    if(!window.confirm(tr("Энэ хадгалсан дэлгэмлийг устгах уу?","Delete this saved spread?")))return;
                    try{setSavedSpreads(deleteCustomSpread(template.id));setTemplateMessage(tr("Дэлгэмэл устлаа.","Spread deleted."));}
                    catch(cause){setError(cause instanceof Error?cause.message:"Устгаж чадсангүй.");}
                  }} className="rounded-full border border-danger/50 px-4 py-2 text-sm text-danger">{tr("Устгах","Delete")}</button>
                </div>
              ))}
            </div>
          </section>}
          <details id="custom-spread-builder" className="group mt-8">
            <summary className="min-h-12 cursor-pointer rounded-xl border border-rule bg-sheet px-5 py-4 text-sm font-semibold text-ink hover:border-pine/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine">
              {tr("Нарийвчилсан тохиргоо · Өөрийн дэлгэмэл","Advanced · Create a custom spread")}
            </summary>
            <div className="mt-3 rounded-2xl border border-rule bg-sheet p-5 sm:p-7">
            <h3 className="font-serif text-xl text-ink">{tr("Өөрийн дэлгэмэл үүсгэх","Create your own spread")}</h3>
            <p className="mt-2 text-sm text-muted">
              {(locale==="en"?"Choose 1–12 cards and give each position a name.":"1–12 карт сонгоод, байрлал бүрд өөрийн хүссэн нэрийг өгч болно.")}
            </p>
            <label htmlFor="custom-spread-name" className="mt-5 block text-sm text-ink">{tr("Дэлгэмлийн нэр","Spread name")}</label>
            <input id="custom-spread-name" value={customName} maxLength={60}
              onChange={event=>setCustomName(event.target.value)}
              className="mt-2 w-full max-w-sm rounded-lg border border-rule bg-paper p-3 text-sm text-ink"
              placeholder={tr("Жишээ: Миний долоо хоног","Example: My week")}/>
            <label htmlFor="custom-card-count" className="mt-5 block text-sm text-ink">{tr("Картын тоо","Number of cards")}</label>
            <select id="custom-card-count" value={customCount}
              onChange={event=>setCustomCount(Number(event.target.value))}
              className="mt-2 rounded-lg border border-rule bg-paper p-3 text-ink">
              {Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} {tr("карт","cards")}</option>)}
            </select>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length:customCount},(_,index)=>(
                <div key={index}>
                  <label htmlFor={"custom-position-"+index} className="mb-1 block text-xs text-ink">
                    {index+1}{tr("-р байрлал (заавал биш)"," position (optional)")}
                  </label>
                  <input id={"custom-position-"+index} maxLength={60}
                    value={customLabels[index]||""}
                    onChange={event=>setCustomLabels(old=>{
                      const next=[...old];next[index]=event.target.value;return next;
                    })}
                    placeholder={String(index+1)+(en?" card":"-р карт")}
                    className="w-full rounded-lg border border-rule bg-sheet p-3 text-sm text-ink focus:border-pine focus:outline-none"/>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveTemplate}
              className="mr-3 mt-6 rounded-full border border-pine/50 px-6 py-3 text-sm font-semibold text-ink">
              {(locale==="en"?"Save spread":"Дэлгэмлийг хадгалах")}
            </button>
            {templateMessage&&<p role="status" className="mt-3 text-sm text-success">{templateMessage}</p>}
            <button type="button" onClick={()=>chooseSpread(makeCustomSpread(customCount,customLabels))}
              className="mt-6 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-on-pine hover:bg-deep">
              {(locale==="en"?"Start custom spread":"Миний дэлгэмлийг эхлүүлэх")}
            </button>
            </div>
          </details>
    {error&&<p role="alert">{error}</p>}
  </section>;
}
