"use client";
import {getReadingPreferences} from "./readingPreferences";

export type FeedbackKind="draw"|"flip"|"correct";
/**
 * Original, very short synthesized interface sound (not a musical work)
 * and gentle vibration. Strictly opt-in and only called from user gestures.
 */
export function emitFeedback(kind:FeedbackKind):void{
  if(typeof window==="undefined")return;
  const prefs=getReadingPreferences();
  if(prefs.haptics){
    const vibration=kind==="correct"?25:kind==="draw"?15:8;
    try{(navigator as Navigator & {vibrate?:(duration:number)=>boolean}).vibrate?.(vibration);}catch{}
  }
  if(!prefs.sound)return;
  try{
    const Audio=typeof AudioContext==="function"?AudioContext:
      (window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(!Audio)return;
    const context=new Audio();
    const oscillator=context.createOscillator(),gain=context.createGain();
    oscillator.type="sine";
    oscillator.frequency.setValueAtTime(kind==="correct"?650:kind==="draw"?420:490,context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind==="correct"?840:330,context.currentTime+0.085);
    gain.gain.setValueAtTime(0.0001,context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035,context.currentTime+0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001,context.currentTime+0.11);
    oscillator.connect(gain);gain.connect(context.destination);
    oscillator.start();oscillator.stop(context.currentTime+0.13);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();void context.close();};
  }catch{/* WebAudio may be blocked; interface still works without sound. */}
}
