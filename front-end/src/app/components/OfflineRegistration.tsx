"use client";
import { useEffect } from "react";
/** Service worker registration is intentionally disabled in Next development. */
export default function OfflineRegistration() {
  useEffect(()=>{
    if(process.env.NODE_ENV!=="production" || !("serviceWorker" in navigator))return;
    navigator.serviceWorker.register("/sw.js", {scope:"/"})
      .catch((error)=>console.warn("Offline cache unavailable:", error));
  },[]);
  return null;
}
