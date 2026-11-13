#!/usr/bin/env node
/**
 * Run only against an explicit owner-approved PREVIEW or production URL:
 * node scripts/smoke-public-release.mjs https://preview.example.com
 * No login, no credentials, no secrets, and no destructive endpoints.
 */
const address=process.argv[2];
if(!address){
  console.error("Usage: node scripts/smoke-public-release.mjs https://approved-host.example");
  process.exitCode=2;
}else{
  let origin;
  try{
    const url=new URL(address);
    if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||
      url.pathname!=="/")throw new Error("Expected HTTPS origin only");
    origin=url.origin;
  }catch{
    console.error("Use an approved HTTPS origin without path, query or credentials");
    process.exit(2);
  }
  const checks=[
    {path:"/",type:"text/html",status:[200]},
    {path:"/manifest.webmanifest",type:"application/manifest+json",status:[200]},
    {path:"/privacy",type:"text/html",status:[200]},
    {path:"/terms",type:"text/html",status:[200]},
    {path:"/robots.txt",type:"text/plain",status:[200]},
    {path:"/icon.svg",type:"image/svg+xml",status:[200]},
    {path:"/sw.js",type:"javascript",status:[200]},
    {path:"/tarot/card-placeholder.svg",type:"image/svg+xml",status:[200]},
    {path:"/tarot/rws/00_Fool.jpg",type:"image/jpeg",status:[200]},
    {path:"/api/ai/test",type:null,status:[404,410]},
    {path:"/api/auth/login",type:null,status:[404,405,410]}
  ];
  let errors=0;
  for(const check of checks){
    try{
      const response=await fetch(origin+check.path,{redirect:"manual",signal:AbortSignal.timeout(12000),headers:{
        "User-Agent":"Pocket-Tarot-Approved-Release-Smoke/1"
      }});
      const received=response.headers.get("content-type")||"";
      if(!check.status.includes(response.status)||check.type&&!received.includes(check.type)){
        console.error("FAIL",check.path,":",response.status,received.split(";")[0]);
        errors++;
      }else console.log("PASS",check.path,":",response.status);
    }catch(error){console.error("FAIL",check.path,":",error instanceof Error?error.message:"request error");errors++;}
  }
  const response=await fetch(origin,{redirect:"manual",signal:AbortSignal.timeout(12000)});
  if(response.status===200){
    const html=await response.text();
    if(!html.includes("Pocket Tarot")){console.error("FAIL: app identity missing");errors++;}
    if(/AIza[A-Za-z0-9_-]{28,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}/.test(html)){
      console.error("FAIL: possible API token in public HTML (value suppressed)");errors++;
    }
  }
  if(errors){
    console.error("Release smoke FAILED with",errors,"problems; do not promote.");
    process.exitCode=1;
  }else console.log("Release smoke PASS. Manual security/mobile/rights checks still required.");
}
