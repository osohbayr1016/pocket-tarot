"use client";
import { useEffect, useState } from "react";
import {getReadingPreferences,applyReadingPreferences} from "../lib/readingPreferences";

/** Register update-aware offline worker only in production. */
export default function OfflineRegistration() {
  const [updateReady,setUpdateReady]=useState(false);
  useEffect(()=>{
    applyReadingPreferences(getReadingPreferences());
    if(process.env.NODE_ENV!=="production"||!("serviceWorker" in navigator))return;
    const hadWorker=!!navigator.serviceWorker.controller;
    const onControllerChange=()=>{
      if(hadWorker)setUpdateReady(true);
    };
    navigator.serviceWorker.addEventListener("controllerchange",onControllerChange);
    let live=true;
    void navigator.serviceWorker.register("/sw.js",{scope:"/"})
      .then(registration=>{
        if(!live)return;
        const onUpdate=()=>{
          const worker=registration.installing;
          if(!worker)return;
          worker.addEventListener("statechange",()=>{
            if(worker.state==="installed"&&navigator.serviceWorker.controller){
              setUpdateReady(true);
            }
          });
        };
        registration.addEventListener("updatefound",onUpdate);
      }).catch(error=>console.warn("Offline cache unavailable:",error));
    return ()=>{
      live=false;
      navigator.serviceWorker.removeEventListener("controllerchange",onControllerChange);
    };
  },[]);
  if(!updateReady)return null;
  return <div role="status" aria-live="polite"
    className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine/50 bg-sheet p-4 text-sm text-ink shadow-2xl">
    <span>Pocket Tarot шинэчлэгдлээ. Шинэ хувилбарыг нээх үү?</span>
    <button type="button" onClick={()=>window.location.reload()}
      className="rounded-full bg-pine px-4 py-2 font-semibold text-on-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine">
      Шинэчлэх
    </button>
  </div>;
}
