"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";

export type Locale="mn"|"en";
const KEY="pocket-tarot-locale-v1";
const EN:Record<string,string>={
  "Таро":"Tarot","Зурхай":"Astrology","Өдөр тутам":"Daily","Тэмдэглэл":"Journal","Офлайн":"Offline",
  "Таро дэлгэмэл":"Tarot spreads","Нэг карт":"Single card","78 карт":"Card library",
  "Таро сурах":"Learn Tarot","Орд":"Zodiac","Төрсөн үеийн тэнгэр":"Natal chart",
  "Сарны календарь":"Moon calendar","Өдрийн карт":"Daily card","Өдрийн санаа":"Daily reflection",
  "Зүүд":"Dream symbols","Удирдамж":"Life guidance","Миний түүх":"My journal",
  "Offline карт":"Offline deck","Хувийн тохиргоо":"Preferences",
  "Уламжлалт таро":"Traditional Tarot","Шинэ эхлэл":"New beginning",
  "Асуултын чиглэл":"Question topic","Таны уншилтын тайлал":"Your reading",
  "Хувийн тэмдэглэл":"Private notes","Төхөөрөмж дээр хадгалах":"Save to this device",
  "Дараагийн картыг нээх":"Reveal next card","Дэлгэмэл солих":"Change spread",
  "Хольж, хөзөр сугалах":"Shuffle and draw cards","Дахин холих":"Shuffle again",
  "Таро уншилт":"Tarot reading","Зөвлөгөө":"Reflection",
  "Өнөөдрийн карт":"Today's card","Бүх мэдээллийн backup":"Complete data backup",
  "Келтийн загалмай":"Celtic Cross","Төрсөн үеийн тэнгэрийн зураг":"Natal chart",
  "Хаах":"Close","Уншилтын түүх":"Reading journal"
};
interface LanguageContextType{
  locale:Locale;
  setLocale:(next:Locale)=>void;
  t:(message:string)=>string;
}
const Context=createContext<LanguageContextType>({
  locale:"mn",setLocale:()=>{},t:(message)=>message
});
export function LanguageProvider({children}:{children:ReactNode}){
  const [locale,setState]=useState<Locale>("mn");
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      try{
        const stored=localStorage.getItem(KEY);
        if(stored==="mn"||stored==="en"){
          setState(stored);document.documentElement.lang=stored;
        }
      }catch{/* private-mode storage can be unavailable */}
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  const value=useMemo(()=>({
    locale,
    setLocale:(next:Locale)=>{
      setState(next);
      document.documentElement.lang=next;
      try{localStorage.setItem(KEY,next);}catch{/* session-only preference */}
    },
    t:(message:string)=>locale==="en"?(EN[message]??message):message
  }),[locale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLanguage(){return useContext(Context);}
