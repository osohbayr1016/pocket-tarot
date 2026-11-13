import type {SavedReading} from "./readingHistory";
import type {TarotCard} from "../data/tarotCards";
export type SocialFormat="story"|"square";
/**
 * Privacy-first local social export: only the spread and card names are shown.
 * Questions, notes, and raw reading text are NOT embedded by default.
 */
async function image(src:string):Promise<HTMLImageElement|null>{
  try{
    const img=new Image();img.decoding="async";img.src=src;
    await img.decode();return img;
  }catch{return null;}
}
export async function exportReadingSocialPng(
  record:SavedReading,deck:readonly TarotCard[],format:SocialFormat
):Promise<void>{
  const w=1080,h=format==="story"?1920:1080;
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Canvas ашиглах боломжгүй.");
  const gradient=ctx.createLinearGradient(0,0,w,h);
  gradient.addColorStop(0,"#23182f");gradient.addColorStop(.48,"#101324");gradient.addColorStop(1,"#1e162a");
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="#b7a36b";ctx.lineWidth=4;
  ctx.strokeRect(42,42,w-84,h-84);
  ctx.strokeStyle="rgba(224,189,122,.3)";ctx.lineWidth=2;
  ctx.strokeRect(60,60,w-120,h-120);
  ctx.textAlign="center";
  ctx.fillStyle="#e7d1aa";ctx.font="28px Georgia,serif";
  ctx.fillText("✦",w/2,format==="story"?172:150);
  ctx.font="bold 68px Georgia,serif";ctx.fillText("POCKET TAROT",w/2,format==="story"?268:225);
  ctx.font="28px sans-serif";ctx.fillStyle="#bfb0c6";
  ctx.fillText("A MOMENT TO REFLECT",w/2,format==="story"?326:281);
  const display=record.cards.slice(0,3),n=display.length;
  const cardW=n===1?355:n===2?310:275;
  const cardH=cardW*1.56;
  const gap=24,total=n*cardW+(n-1)*gap;
  const x0=(w-total)/2;
  const cardY=format==="story"?520:353;
  const loaded=await Promise.all(display.map(entry=>image(
    deck.find(card=>card.id===entry.id)?.image||"/tarot/card-placeholder.svg"
  )));
  for(let i=0;i<n;i++){
    const x=x0+i*(cardW+gap),entry=display[i];
    ctx.save();
    ctx.fillStyle="#302640";ctx.fillRect(x,cardY,cardW,cardH);
    ctx.strokeStyle="#ddc58c";ctx.lineWidth=3;ctx.strokeRect(x,cardY,cardW,cardH);
    const img=loaded[i];
    if(img){
      if(entry.reversed){
        ctx.translate(x+cardW/2,cardY+cardH/2);ctx.rotate(Math.PI);
        ctx.drawImage(img,-cardW/2,-cardH/2,cardW,cardH);
      }else ctx.drawImage(img,x,cardY,cardW,cardH);
    }
    ctx.restore();
    const card=deck.find(item=>item.id===entry.id);
    const text=card?.englishName||"Tarot Card";
    ctx.fillStyle="#f1ddbb";ctx.font="bold 24px Georgia,serif";
    const compact=text.length>19?text.slice(0,18)+"…":text;
    ctx.fillText(compact,x+cardW/2,cardY+cardH+43);
    ctx.font="19px sans-serif";ctx.fillStyle="#d2c4d6";
    ctx.fillText(entry.reversed?"REVERSED":"UPRIGHT",x+cardW/2,cardY+cardH+72);
  }
  if(record.cards.length>3){
    ctx.font="24px sans-serif";ctx.fillStyle="#c6b4d0";
    ctx.fillText("+"+(record.cards.length-3)+" MORE CARDS IN THIS SPREAD",w/2,cardY+cardH+122);
  }
  const captionY=format==="story"?1450:900;
  ctx.font="36px Georgia,serif";ctx.fillStyle="#e7d4ad";
  const shortTitle=record.spread.length>38?record.spread.slice(0,37)+"…":record.spread;
  ctx.fillText(shortTitle,w/2,captionY);
  ctx.font="22px sans-serif";ctx.fillStyle="#c3b4d0";
  ctx.fillText("Reflection, not prediction",w/2,captionY+57);
  ctx.font="19px sans-serif";ctx.fillText("Questions and private notes are intentionally excluded",w/2,captionY+100);
  ctx.strokeStyle="rgba(235,210,164,.4)";
  ctx.beginPath();ctx.moveTo(200,h-200);ctx.lineTo(w-200,h-200);ctx.stroke();
  ctx.font="25px Georgia,serif";ctx.fillStyle="#dfc391";
  ctx.fillText("READ  •  REFLECT  •  DISCOVER",w/2,h-143);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
    value=>value?resolve(value):reject(new Error("PNG экспорт амжилтгүй.")),"image/png"));
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download="pocket-tarot-"+format+"-"+record.date.slice(0,10)+".png";
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
