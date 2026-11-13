#!/usr/bin/env node
/**
 * Pre-commit/CI guard against newly committed credentials in TRACKED text.
 * This does not rewrite history or revoke already exposed credentials.
 * Only paths, line numbers and issue categories are printed, never values.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname } from "node:path";

const skipExtensions=new Set([".jpg",".jpeg",".png",".webp",".ico",".svg",".woff",".woff2",".gif",".pdf",".zip"]);
const paths=execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
const issueRules=[
  {name:"credential-bearing database URI",regex:/\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^:\s'"\/]+:[^@\s'"\/]{4,}@/gi},
  {name:"live-looking Google API token",regex:/\bAIza[A-Za-z0-9_-]{28,}\b/g},
  {name:"live-looking OpenAI token",regex:/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g},
  {name:"private key block",regex:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g},
  {name:"hardcoded secret assignment",regex:/(?:JWT_SECRET|DATABASE_PASSWORD|GOOGLE_CLIENT_SECRET|GEMINI_API_KEY|OPENAI_API_KEY)\s*[:=]\s*['"](?!(?:REPLACE|your_|example|placeholder|changeme))[^'"\s]{18,}['"]/gi},
];
let issues=0,scanned=0;
for(const path of paths){
  if(path.includes("node_modules/")||path.includes("/.next/")||path.startsWith(".git/"))continue;
  if(skipExtensions.has(extname(path).toLowerCase()))continue;
  let source;
  try{source=readFileSync(path);}catch{continue;}
  if(source.length>1_500_000||source.includes(0))continue;
  scanned++;
  const lines=source.toString("utf8").split(/\r?\n/);
  for(let line=0;line<lines.length;line++){
    const text=lines[line];
    for(const rule of issueRules){
      rule.regex.lastIndex=0;
      if(rule.regex.test(text)){
        console.error(path+":"+(line+1)+" — "+rule.name);
        issues++;
      }
    }
  }
}
console.log("Secret hygiene: scanned "+scanned+" tracked text files; findings: "+issues);
if(issues)process.exitCode=1;
