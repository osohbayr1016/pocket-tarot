/**
 * Reproducible service-worker versioning. Runs BEFORE next build so both
 * public/sw.js and the compiled app can be deployed together. No network calls.
 * Hashes source, package and artwork bytes; ignores the generated SW itself.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname,"..");
const hash=createHash("sha256");
const include=[];
function scan(dir){
  for(const entry of readdirSync(join(root,dir),{withFileTypes:true})){
    const name=join(dir,entry.name);
    if(entry.isDirectory())scan(name);
    else if(/\.(tsx?|jsx?|css|webp|json)$/.test(name) && !name.includes("package-lock")) include.push(name);
  }
}
scan("src");
scan("public/tarot/rws");
include.push("package.json","next.config.ts");
for(const file of include.sort()){
  hash.update(relative(root,join(root,file)));
  hash.update(readFileSync(join(root,file)));
}
const version="pocket-tarot-"+hash.digest("hex").slice(0,12);
const swPath=join(root,"public/sw.js");
const before=readFileSync(swPath,"utf8");
if(!/const VERSION = "pocket-tarot-[^"]+";/.test(before))
  throw new Error("Missing service worker version marker");
const after=before.replace(/const VERSION = "pocket-tarot-[^"]+";/, 'const VERSION = "'+version+'";');
writeFileSync(swPath,after);
console.log("Offline service worker build version:",version);
