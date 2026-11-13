/**
 * Make lazy-loaded Next.js chunks available offline on the initial PWA install.
 * Executes after next build. Does not precache 78 optional card illustrations.
 */
import {existsSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join,relative,resolve,sep} from "node:path";
const root=resolve(import.meta.dirname,"..");
const staticDir=join(root,".next/static");
if(!existsSync(staticDir))throw new Error("Next build missing: .next/static");
const assets=[];
function visit(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    const full=join(dir,entry.name);
    if(entry.isDirectory())visit(full);
    else if(/\.(js|css|woff2|wasm)$/.test(entry.name)){
      const subpath=relative(staticDir,full).split(sep).join("/");
      assets.push("/_next/static/"+subpath);
    }
  }
}
visit(staticDir);
if(!assets.length)throw new Error("No static chunks to cache");
assets.sort();
const filename=join(root,"public/sw.js");
const before=readFileSync(filename,"utf8");
const updated=before.replace(/const BUILD_ASSETS = \[[\s\S]*?\];/,
  "const BUILD_ASSETS = "+JSON.stringify(assets)+";");
if(updated===before)throw new Error("Service worker BUILD_ASSETS marker missing or unchanged");
writeFileSync(filename,updated);
console.log("PWA precache manifest:",assets.length,"static chunk/CSS/font files");
