"use client";
import {useState} from "react";
import {useLanguage} from "../lib/LanguageProvider";
export type Section = "reading"|"single"|"library"|"learn"|"horoscope"|"natal"|"moon"|"daily"|"daily-card"|"dream"|"guidance"|"history"|"offline"|"settings";
export const NAV_GROUPS: readonly {id:string;label:string;views:readonly {id:Section;label:string}[]}[]=[
  {id:"tarot",label:"Таро",views:[
    {id:"reading",label:"Таро дэлгэмэл"},{id:"single",label:"Нэг карт"},
    {id:"library",label:"78 карт"},{id:"learn",label:"Таро сурах"}
  ]},
  {id:"astro",label:"Зурхай",views:[
    {id:"horoscope",label:"Орд"},{id:"natal",label:"Төрсөн үеийн тэнгэр"},{id:"moon",label:"Сарны календарь"}
  ]},
  {id:"daily",label:"Өдөр тутам",views:[
    {id:"daily-card",label:"Өдрийн карт"},{id:"daily",label:"Өдрийн санаа"},
    {id:"dream",label:"Зүүд"},{id:"guidance",label:"Удирдамж"}
  ]},
  {id:"journal",label:"Тэмдэглэл",views:[{id:"history",label:"Миний түүх"}]},
  {id:"settings",label:"Офлайн",views:[{id:"offline",label:"Offline карт"},{id:"settings",label:"Хувийн тохиргоо"}]}
];
export function isSection(value:unknown):value is Section{
  return typeof value==="string"&&NAV_GROUPS.some(g=>g.views.some(v=>v.id===value));
}
export function groupForSection(section:Section){
  return NAV_GROUPS.find(group=>group.views.some(view=>view.id===section))||NAV_GROUPS[0];
}
export default function NavigationMenu({section,onNavigate}:{
  section:Section;onNavigate:(next:Section)=>void;
}){
  // Switching a category only reveals its submenu. It does not create a
  // phantom browser-history entry for the category's first view.
  const {locale,setLocale,t}=useLanguage();
  const [previewGroup,setPreviewGroup]=useState<string|null>(null);
  const selectedGroup=groupForSection(section);
  const active=NAV_GROUPS.find(group=>group.id===previewGroup)||selectedGroup;
  return <nav aria-label={locale==="en"?"Main navigation":"Үндсэн цэс"} className="mx-auto max-w-7xl px-4 sm:px-8">
    <div className="mb-2 flex justify-end">
      <button type="button" onClick={()=>setLocale(locale==="mn"?"en":"mn")}
        aria-label={locale==="mn"?"Switch language to English":"Монгол хэл рүү шилжих"}
        className="min-h-11 rounded-full border border-amber-300/30 px-4 py-2 text-sm font-semibold text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
        {locale==="mn"?"EN":"MN"} · {locale==="mn"?"English":"Монгол"}
      </button>
    </div>
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain border-b border-white/10 pb-3 sm:flex-wrap sm:overflow-visible" aria-label={locale==="en"?"Main categories":"Үндсэн ангиллууд"}>
      {NAV_GROUPS.map(group=>(
        <button type="button" key={group.id}
          aria-current={group.id===selectedGroup.id?"page":undefined}
          aria-pressed={group.id===active.id} onClick={()=>setPreviewGroup(group.id)}
          className={"min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 "+
            (group.id===active.id?"bg-amber-300 text-[#171127]":"border border-white/15 text-slate-200 hover:border-amber-300/50 hover:text-amber-200")}>
          {t(group.label)}
        </button>
      ))}
    </div>
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain py-3 sm:flex-wrap sm:overflow-visible" aria-label={locale==="en"?t(active.label)+" sections":active.label+" хэсгүүд"}>
      {active.views.map(view=>(
        <button type="button" key={view.id} aria-current={section===view.id?"page":undefined}
          aria-pressed={section===view.id} onClick={()=>{setPreviewGroup(null);onNavigate(view.id);}}
          className={"min-h-11 shrink-0 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 "+
            (section===view.id?"border-amber-300/60 bg-amber-300/10 text-amber-100":"border-white/10 text-slate-200 hover:border-amber-300/50 hover:text-amber-100")}>
          {t(view.label)}
        </button>
      ))}
    </div>
  </nav>;
}
