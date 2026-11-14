import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const project=resolve(import.meta.dirname,"../..");
const read=path=>readFileSync(resolve(project,path),"utf8");
test("retired deploy scripts cannot silently deploy or recreate legacy secrets",()=>{
  for(const file of ["deploy-complete.sh","deploy-to-vercel.sh","deploy-to-render.sh"]){
    const source=read(file);
    assert.match(source,/exit 2/);
    assert.doesNotMatch(source,/vercel --prod|npm install -g vercel|config\.production\.env|npm run check:gemini/);
  }
});
test("developer scripts do not kill unrelated processes or launch the old backend",()=>{
  const start=read("start-servers.sh");
  const stop=read("stop-servers.sh");
  assert.match(start,/npm --prefix front-end run dev/);
  for(const code of [start,stop]){
    assert.doesNotMatch(code,/\bpkill\b|\bkill -9\b|lsof -ti:|npm start &/);
  }
});
test("normal development and build use only committed artwork",()=>{
  const pkg=JSON.parse(read("front-end/package.json"));
  assert.match(pkg.scripts.prebuild,/assets:verify/);
  assert.match(pkg.scripts.predev,/assets:verify/);
  assert.doesNotMatch(pkg.scripts.prebuild+" "+pkg.scripts.predev,/assets:sync/);
  assert.match(read("front-end/scripts/verify-artwork.mjs"),/jpeg|JPEG/);
});
