"use client";
import {useCallback,useEffect,useState} from "react";

const PREFIX="pocket-tarot-draft-v1:";
interface DraftState{key:string;text:string;ready:boolean}
const limit=4000;
/**
 * Synchronous write on edit avoids losing unsaved notes when navigation
 * unmounts a component. The key separates dates/card types/reading flows.
 * No network request. Consumers should gate editing until hydration completes.
 */
export function useLocalDraft(key:string,defaultText=""){
  const [state,setState]=useState<DraftState>({key:"",text:"",ready:false});
  const [error,setError]=useState("");
  useEffect(()=>{
    if(!key){return;}
    const frame=requestAnimationFrame(()=>{
      try{
        const stored=localStorage.getItem(PREFIX+key);
        setState({key,text:(stored??defaultText).slice(0,limit),ready:true});
        setError("");
      }catch{
        setState({key,text:defaultText.slice(0,limit),ready:true});
        setError("Тэмдэглэлийн автомат хадгалалт хаалттай байна. Хуулж backup хийнэ үү.");
      }
    });
    return()=>cancelAnimationFrame(frame);
  },[key,defaultText]);
  const setText=useCallback((value:string)=>{
    const text=value.slice(0,limit);
    setState({key,text,ready:true});
    try{
      localStorage.setItem(PREFIX+key,text);
      setError("");
    }catch{
      setError("Автомат хадгалалт амжилтгүй. Browser storage болон сул зайг шалгана уу.");
    }
  },[key]);
  const clear=useCallback(()=>{
    try{localStorage.removeItem(PREFIX+key);setError("");}
    catch{setError("Түр хадгалсан тэмдэглэлийг устгаж чадсангүй.");}
    setState({key,text:"",ready:true});
  },[key]);
  return {
    text:state.key===key?state.text:"",
    ready:state.key===key&&state.ready,
    setText,clear,error
  };
}
/** Retained drafts deliberately never contain account secrets or API keys. */
export function readRawDraftKeys():string[]{
  return Object.keys(localStorage).filter(key=>key.startsWith(PREFIX));
}
