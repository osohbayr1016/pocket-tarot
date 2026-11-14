/**
 * Build gate for committed local artwork. Never downloads anything.
 * Refreshing the historical source is explicit via npm run assets:sync.
 */
import {readdir,stat} from "node:fs/promises";
import {resolve} from "node:path";

const dir=resolve(import.meta.dirname,"../public/tarot/rws");
const names=await readdir(dir);
const jpg=names.filter(name=>name.endsWith(".jpg")).sort();
const webp=names.filter(name=>name.endsWith(".webp")).sort();
if(jpg.length!==78||webp.length!==78)
  throw new Error("Offline deck must include 78 committed JPEG + 78 WebP card illustrations.");
const jpgKeys=jpg.map(name=>name.slice(0,-4));
const webpKeys=webp.map(name=>name.slice(0,-5));
if(jpgKeys.some((name,index)=>name!==webpKeys[index]))
  throw new Error("JPEG/WebP deck card names do not match.");
for(const name of [...jpg,...webp]){
  if((await stat(resolve(dir,name))).size<2048)
    throw new Error("Offline artwork is missing or truncated: "+name);
}
console.log("Verified 78 matching local Tarot illustrations (JPEG + WebP).");
