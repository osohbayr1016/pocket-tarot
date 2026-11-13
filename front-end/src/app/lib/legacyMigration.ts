/**
 * Consent-based local converter for account reading exports from the old app.
 * It does not contact the old backend. Users must obtain their OWN export
 * through an independently authenticated service/admin process.
 */
import type { SavedReading } from "./readingHistory";
import { tarotCards } from "../data/tarotCards";

function getRows(raw:unknown):unknown[]{
  if(Array.isArray(raw))return raw;
  if(!raw||typeof raw!=="object")throw new Error("Legacy export JSON бүтэц буруу.");
  const object=raw as Record<string,unknown>;
  if(Array.isArray(object.readings))return object.readings;
  if(object.data&&typeof object.data==="object"&&
     Array.isArray((object.data as Record<string,unknown>).readings))
    return (object.data as {readings:unknown[]}).readings;
  throw new Error("Legacy reading list олдсонгүй.");
}
export function convertLegacyReadings(raw:unknown):SavedReading[]{
  const rows=getRows(raw);
  if(rows.length>100)throw new Error("Эхлээд хуучин системээс 100 хүртэлх уншилтаар хэсэгчилж экспортлоно уу.");
  const ids=new Set<string>();
  return rows.map((item,index)=>{
    if(!item||typeof item!=="object"||Array.isArray(item))throw new Error("Хуучин уншилтын мөр буруу.");
    const data=item as Record<string,unknown>;
    const oldCard=data.card&&typeof data.card==="object"?data.card as Record<string,unknown>:undefined;
    const idValue=typeof data.cardId==="number"?data.cardId:oldCard?.id;
    const cardId=typeof idValue==="number"?idValue:typeof idValue==="string"?Number(idValue):NaN;
    if(!Number.isInteger(cardId)||cardId<0||cardId>=tarotCards.length)
      throw new Error((index+1)+"-р мөрийн Tarot card ID буруу.");
    const oldDate=data.readingDate||data.createdAt||data.date;
    const date=typeof oldDate==="string"?oldDate:new Date(oldDate as number).toISOString();
    if(!Number.isFinite(Date.parse(date)))throw new Error("Legacy уншилтын огноо буруу.");
    const oldId=typeof data.id==="string"||typeof data.id==="number"?String(data.id):
      typeof data._id==="string"?data._id:String(index);
    const safeId="legacy-"+oldId.replace(/[^a-zA-Z0-9-]/g,"").slice(0,60);
    if(ids.has(safeId))throw new Error("Legacy reading ID давхардсан байна.");
    ids.add(safeId);
    const meaning=typeof data.cardMeaning==="string"?data.cardMeaning:
      typeof oldCard?.meaning==="string"?oldCard.meaning:tarotCards[cardId].meaning;
    const question=typeof data.question==="string"?data.question.slice(0,500):"";
    const notes=typeof data.notes==="string"?data.notes.slice(0,2000):"";
    return {
      id:safeId,date:new Date(date).toISOString(),
      spread:"Хуучин системийн уншилт",
      question,
      reading:"Өмнөх системээс хэрэглэгч өөрөө импортолсон карт: "+
        tarotCards[cardId].name+"\n\n"+meaning.slice(0,15000)+
        "\n\nЭнэ бол хуучин өгөгдөл; шинэ систем түүний анхны AI тайлбарыг сэргээж чадахгүй.",
      notes,favorite:data.isFavorite===true,
      cards:[{id:cardId,reversed:false,position:1}]
    };
  });
}
