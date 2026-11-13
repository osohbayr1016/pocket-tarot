"use client";
export type Section = "reading"|"single"|"library"|"learn"|"horoscope"|"natal"|"daily"|"daily-card"|"dream"|"guidance"|"history"|"offline";
export const NAV_GROUPS: readonly {id:string;label:string;views:readonly {id:Section;label:string}[]}[]=[
  {id:"tarot",label:"Таро",views:[
    {id:"reading",label:"Таро дэлгэмэл"},{id:"single",label:"Нэг карт"},
    {id:"library",label:"78 карт"},{id:"learn",label:"Таро сурах"}
  ]},
  {id:"astro",label:"Зурхай",views:[
    {id:"horoscope",label:"Орд"},{id:"natal",label:"Төрсөн үеийн тэнгэр"}
  ]},
  {id:"daily",label:"Өдөр тутам",views:[
    {id:"daily-card",label:"Өдрийн карт"},{id:"daily",label:"Өдрийн санаа"},
    {id:"dream",label:"Зүүд"},{id:"guidance",label:"Удирдамж"}
  ]},
  {id:"journal",label:"Тэмдэглэл",views:[{id:"history",label:"Миний түүх"}]},
  {id:"settings",label:"Офлайн",views:[{id:"offline",label:"Offline карт"}]}
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
  const active=groupForSection(section);
  return <nav aria-label="Үндсэн цэс" className="mx-auto max-w-7xl px-4 sm:px-8">
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3" aria-label="Үндсэн ангиллууд">
      {NAV_GROUPS.map(group=>(
        <button type="button" key={group.id}
          aria-current={group.id===active.id?"page":undefined}
          aria-pressed={group.id===active.id} onClick={()=>onNavigate(group.views[0].id)}
          className={"min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 "+
            (group.id===active.id?"bg-amber-300 text-[#171127]":"border border-white/15 text-slate-200 hover:border-amber-300/50 hover:text-amber-200")}>
          {group.label}
        </button>
      ))}
    </div>
    <div className="flex flex-wrap gap-2 py-3" aria-label={active.label+" хэсгүүд"}>
      {active.views.map(view=>(
        <button type="button" key={view.id} aria-current={section===view.id?"page":undefined}
          aria-pressed={section===view.id} onClick={()=>onNavigate(view.id)}
          className={"min-h-11 rounded-xl border px-4 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 "+
            (section===view.id?"border-amber-300/60 bg-amber-300/10 text-amber-100":"border-white/10 text-slate-200 hover:border-amber-300/50 hover:text-amber-100")}>
          {view.label}
        </button>
      ))}
    </div>
  </nav>;
}
