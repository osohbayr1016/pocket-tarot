/**
 * Encrypted portable backups, using standard AES-256-GCM and PBKDF2-SHA256.
 * Passphrase is never sent to a network, saved in storage, or logged.
 * This protects EXPORTED files, not device-local IndexedDB.
 */
import {assertPlaintextBackupSize,MAX_BACKUP_ENCRYPTED_BYTES} from "./backupLimits.ts";
const FORMAT="pocket-tarot-encrypted-backup";
const ITERATIONS=310000;
const enc=new TextEncoder(),dec=new TextDecoder();
interface Envelope{
  format:typeof FORMAT;
  version:1;
  algorithm:"AES-256-GCM";
  kdf:"PBKDF2-SHA256";
  iterations:number;
  salt:string;iv:string;ciphertext:string;
}
function b64(bytes:Uint8Array):string{
  let raw="";
  for(let i=0;i<bytes.length;i++)raw+=String.fromCharCode(bytes[i]);
  return btoa(raw);
}
function unb64(value:string):Uint8Array{
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(value)||value.length%4!==0||value.length>28_000_000)
    throw new Error("Шифрлэсэн backup өгөгдлийн код буруу байна.");
  const raw=atob(value),bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  return bytes;
}
async function key(passphrase:string,salt:Uint8Array,iterations:number):Promise<CryptoKey>{
  if(typeof crypto==="undefined"||!crypto.subtle)throw new Error("Web Crypto боломжгүй. HTTPS орчноос нээнэ үү.");
  const material=await crypto.subtle.importKey("raw",enc.encode(passphrase),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey(
    {name:"PBKDF2",salt:new Uint8Array(salt),iterations,hash:"SHA-256"},
    material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]
  );
}
export function isEncryptedBackup(source:string):boolean{
  try{
    const data=JSON.parse(source) as Record<string,unknown>;
    return data?.format===FORMAT;
  }catch{return false;}
}
export async function encryptBackup(plaintext:string,passphrase:string):Promise<string>{
  if(passphrase.length<12)throw new Error("Backup-ийн нууц үг 12-оос олон тэмдэгттэй байна.");
  assertPlaintextBackupSize(plaintext);
  const plaintextBytes=enc.encode(plaintext);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const derived=await key(passphrase,salt,ITERATIONS);
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},derived,plaintextBytes);
  const envelope:Envelope={
    format:FORMAT,version:1,algorithm:"AES-256-GCM",
    kdf:"PBKDF2-SHA256",iterations:ITERATIONS,
    salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(encrypted))
  };
  const exported=JSON.stringify(envelope);
  if(exported.length>MAX_BACKUP_ENCRYPTED_BYTES)
    throw new Error("Шифрлэсэн backup файл 28 MB-ээс хэтэрсэн.");
  return exported;
}
export async function decryptBackup(contents:string,passphrase:string):Promise<string>{
  if(contents.length>MAX_BACKUP_ENCRYPTED_BYTES)throw new Error("Шифрлэсэн backup хэмжээ хэтэрсэн.");
  if(!passphrase)throw new Error("Нууц үгээ оруулна уу.");
  let data:Record<string,unknown>;
  try{data=JSON.parse(contents);}catch{throw new Error("Шифрлэсэн JSON файл буруу.");}
  if(!data||data.format!==FORMAT||data.version!==1||
     data.algorithm!=="AES-256-GCM"||data.kdf!=="PBKDF2-SHA256"||
     data.iterations!==ITERATIONS||typeof data.salt!=="string"||
     typeof data.iv!=="string"||typeof data.ciphertext!=="string")
    throw new Error("Шифрлэсэн backup хувилбар эсвэл формат буруу.");
  const salt=unb64(data.salt),iv=unb64(data.iv),ciphertext=unb64(data.ciphertext);
  if(salt.length!==16||iv.length!==12||ciphertext.length<16)
    throw new Error("Backup шифрийн бүтэц буруу.");
  try{
    const derived=await key(passphrase,salt,ITERATIONS);
    const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv:new Uint8Array(iv)},derived,new Uint8Array(ciphertext));
    const plaintext=dec.decode(decrypted);
    assertPlaintextBackupSize(plaintext);
    return plaintext;
  }catch{
    throw new Error("Нууц үг буруу эсвэл backup файл гэмтсэн.");
  }
}
