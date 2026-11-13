import type { SavedReading } from "./readingHistory";
import type { TarotCard } from "../data/tarotCards";

/**
 * Generates a shareable PNG locally with Canvas. No service or API.
 * The image is deliberately capped to protect mobile memory.
 */
const W=1080;
function lineWrap(ctx:CanvasRenderingContext2D,text:string,maxWidth:number):string[]{
  const result:string[]=[];
  for(const paragraph of text.split(/\r?\n/)){
    if(!paragraph.trim()){result.push("");continue;}
    let current="";
    for(const token of paragraph.split(/\s+/)){
      const proposed=current?current+" "+token:token;
      if(ctx.measureText(proposed).width>maxWidth&&current){
        result.push(current);
        current=token;
      }else{current=proposed;}
    }
    result.push(current);
  }
  return result;
}
async function readImage(src:string):Promise<HTMLImageElement|null>{
  try{
    const img=new Image();
    img.decoding="async";
    img.src=src;
    await img.decode();
    return img;
  }catch{return null;}
}
export async function exportReadingPng(record:SavedReading,deck:readonly TarotCard[]):Promise<void>{
  const canvas=document.createElement("canvas");
  const measure=document.createElement("canvas").getContext("2d");
  if(!measure)throw new Error("Canvas дэмжигдээгүй.");
  measure.font="28px sans-serif";
  const safeText=record.reading.slice(0,9500);
  const lines=lineWrap(measure,safeText,W-144);
  const cardRows=Math.ceil(Math.min(record.cards.length,10)/5);
  const cardBlock=cardRows*290;
  const limitLines=lines.slice(0,140);
  const h=Math.min(11_000,480+cardBlock+Math.max(1,limitLines.length)*42);
  canvas.width=W;canvas.height=h;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Canvas үүсгэж чадсангүй.");
  ctx.fillStyle="#111021";ctx.fillRect(0,0,W,h);
  ctx.strokeStyle="#b79c66";ctx.lineWidth=4;ctx.strokeRect(28,28,W-56,h-56);
  ctx.textAlign="center";
  ctx.fillStyle="#ebd7ac";ctx.font="46px Georgia,serif";ctx.fillText("POCKET TAROT",W/2,114);
  ctx.font="23px sans-serif";ctx.fillStyle="#b5acbc";
  ctx.fillText(record.spread.slice(0,80),W/2,162);
  ctx.font="20px sans-serif";ctx.fillText(new Date(record.date).toLocaleDateString("mn-MN"),W/2,194);
  if(record.question){
    ctx.font="24px sans-serif";ctx.fillStyle="#e8e2dd";
    const q=lineWrap(ctx,record.question,W-180).slice(0,2);
    q.forEach((line,index)=>ctx.fillText(line,W/2,230+index*30));
  }
  const images=await Promise.all(record.cards.slice(0,10).map(item=>
    readImage(deck.find(card=>card.id===item.id)?.image||"/tarot/card-placeholder.svg")));
  let y=280;
  for(let i=0;i<images.length;i++){
    const col=i%5,row=Math.floor(i/5),x=75+col*190,iy=y+row*290;
    const img=images[i];
    if(img){
      ctx.save();
      if(record.cards[i].reversed){
        ctx.translate(x+80,iy+115);ctx.rotate(Math.PI);ctx.drawImage(img,-80,-115,160,230);
      }else ctx.drawImage(img,x,iy,160,230);
      ctx.restore();
    }
    const card=deck.find(item=>item.id===record.cards[i].id);
    ctx.font="18px sans-serif";ctx.fillStyle="#ecd7a3";
    ctx.fillText(card?.name.slice(0,17)||"?",x+80,iy+260);
  }
  y+=cardBlock+35;
  ctx.textAlign="left";ctx.fillStyle="#f4eee4";ctx.font="28px sans-serif";
  limitLines.forEach((line,index)=>ctx.fillText(line,72,y+index*42));
  if(lines.length>limitLines.length){
    ctx.font="19px sans-serif";ctx.fillStyle="#b7adbf";
    ctx.fillText("Бүрэн тайлбар: Pocket Tarot дээрх уншилтын түүх",72,Math.min(h-70,y+limitLines.length*42+16));
  }
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
    file=>file?resolve(file):reject(new Error("PNG үүсгэж чадсангүй.")),"image/png",0.95
  ));
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.download="pocket-tarot-"+record.date.slice(0,10)+".png";
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
