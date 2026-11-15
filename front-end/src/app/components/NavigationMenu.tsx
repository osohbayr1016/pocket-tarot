"use client";
import type {MouseEvent, ReactNode} from "react";
import {useLanguage} from "../lib/LanguageProvider";
import {Icon, type IconName} from "./InterfaceIcon";

export type Section = "reading"|"single"|"library"|"learn"|"horoscope"|"natal"|"moon"|"daily"|"daily-card"|"dream"|"guidance"|"history"|"offline"|"settings"|"guide";
const groups: {icon:IconName;label:string;views:{id:Section;label:string}[]}[]=[
  {icon:"cards",label:"Таро",views:[{id:"reading",label:"Таро дэлгэмэл"},{id:"single",label:"Нэг карт"},{id:"library",label:"78 карт"},{id:"learn",label:"Таро сурах"}]},
  {icon:"orbit",label:"Зурхай",views:[{id:"horoscope",label:"Орд"},{id:"natal",label:"Төрсөн үеийн тэнгэр"},{id:"moon",label:"Сарны календарь"}]},
  {icon:"sun",label:"Өдөр тутам",views:[{id:"daily-card",label:"Өдрийн карт"},{id:"daily",label:"Өдрийн санаа"},{id:"dream",label:"Зүүд"},{id:"guidance",label:"Удирдамж"}]},
  {icon:"journal",label:"Тэмдэглэл",views:[{id:"history",label:"Миний түүх"}]},
  {icon:"offline",label:"Офлайн",views:[{id:"offline",label:"Offline карт"},{id:"settings",label:"Хувийн тохиргоо"}]},
];
export function isSection(value:unknown):value is Section{
  return value==="guide"||groups.some(group=>group.views.some(view=>view.id===value));
}
type NavProps={onNavigate:(next:Section)=>void};
export function ViewLink({view,onNavigate,children,className,current}:NavProps & {view:Section;children:ReactNode;className?:string;current?:boolean}){
  const click=(event:MouseEvent<HTMLAnchorElement>)=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    onNavigate(view);
  };
  return <a className={className} href={"/?view="+view} onClick={click} aria-current={current?"page":undefined}>{children}</a>;
}
export default function NavigationMenu({section,onNavigate}:NavProps & {section:Section}){
  const {locale,setLocale,t}=useLanguage();
  const group=groups.find(group=>group.views.some(view=>view.id===section));
  const en=locale==="en";
  return <header className="masthead">
    <div className="masthead-row">
      <ViewLink view="reading" onNavigate={onNavigate} className="wordmark"><img src="/icon.svg" alt="" width="36" height="36"/>Pocket Tarot</ViewLink>
      <nav className="destinations" aria-label={en?"Main navigation":"Үндсэн цэс"}>
        {groups.map(item=><ViewLink key={item.icon} view={item.views[0].id} onNavigate={onNavigate}
          className={"destination"+(group===item?" active":"")} current={section===item.views[0].id}>
          <Icon name={item.icon} size={19}/><span>{t(item.label)}</span>
        </ViewLink>)}
      </nav>
      <div className="masthead-tools">
        <ViewLink view="guide" onNavigate={onNavigate} current={section==="guide"} className="guide-link"><Icon name="book" size={17}/>{en?"Guide":"Заавар"}</ViewLink>
        <button type="button" className="language" onClick={()=>setLocale(en?"mn":"en")} aria-label={en?"Монгол хэл рүү шилжих":"Switch language to English"}><Icon name="globe" size={15}/>{en?"MN":"EN"}</button>
      </div>
    </div>
    {group&&<div className="subnav-bar"><nav className="subnav" aria-label={en?"Section navigation":"Хэсгийн цэс"}>
      {group.views.map(view=><ViewLink key={view.id} view={view.id} onNavigate={onNavigate} current={section===view.id}>{t(view.label)}</ViewLink>)}
    </nav></div>}
  </header>;
}
