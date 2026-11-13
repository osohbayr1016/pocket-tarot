/**
 * One-time/deployment-time download of the public-domain 1909 Rider–Waite–Smith
 * images. Images are stored locally; the browser never calls this source.
 *
 * Run: npm run assets:sync (in front-end/)
 * Source: https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px
 * Carefully review copyright status for your distribution jurisdiction.
 */
import { mkdir, readFile, rename, stat, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../public/tarot/rws");
const major = ["00_Fool","01_Magician","02_High_Priestess","03_Empress","04_Emperor",
  "05_Hierophant","06_Lovers","07_Chariot","08_Strength","09_Hermit",
  "10_Wheel_of_Fortune","11_Justice","12_Hanged_Man","13_Death",
  "14_Temperance","15_Devil","16_Tower","17_Star","18_Moon",
  "19_Sun","20_Judgement","21_World"];
const names = [...major, ...["Wands","Cups","Swords","Pents"].flatMap((suit) =>
  Array.from({length:14},(_,index) => suit + String(index+1).padStart(2,"0"))
)];
const source = "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/720px/";
const download = async (name) => {
  const filepath = path.join(outputDir, name + ".jpg");
  try {
    if ((await stat(filepath)).size > 10_000) return {cached: true, name};
  } catch { /* not downloaded yet */ }
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const tmp = filepath + ".tmp";
    try {
      const response = await fetch(source + encodeURIComponent(name) + ".jpg", {
        signal: AbortSignal.timeout(30000),
        headers: {"User-Agent":"pocket-tarot-asset-sync"},
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length < 10000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        throw new Error("Invalid JPEG asset");
      }
      await writeFile(tmp, bytes);
      await rename(tmp, filepath);
      return {cached:false,name};
    } catch (error) {
      lastError = error;
      await unlink(tmp).catch(() => {});
    }
  }
  throw new Error("Failed to download "+name+": "+String(lastError));
};
await mkdir(outputDir,{recursive:true});
let cursor = 0;
let downloaded = 0, cached = 0;
await Promise.all(Array.from({length:5},async()=>{
  while (cursor < names.length) {
    const index = cursor++;
    const result = await download(names[index]);
    if (result.cached) cached++; else downloaded++;
  }
}));
if (downloaded + cached !== 78) throw new Error("Incomplete Rider-Waite-Smith deck");
console.log("Ready: "+(downloaded+cached)+" images ("+downloaded+" new, "+cached+" cached)");
