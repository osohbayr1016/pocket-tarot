/**
 * Common file size limits for portable, device-only backups.
 *
 * The plaintext cap is in UTF-8 BYTES, not JavaScript UTF-16 code units.
 * Encrypting 20MB adds AES-GCM overhead and ~33% base64 expansion, so valid
 * encrypted exports can be larger than their original JSON files.
 */
export const MAX_BACKUP_PLAINTEXT_BYTES=20_000_000;
export const MAX_BACKUP_ENCRYPTED_BYTES=28_000_000;

const encoder=new TextEncoder();
export function utf8ByteLength(value:string):number{
  return encoder.encode(value).byteLength;
}
export function assertPlaintextBackupSize(value:string):void{
  if(utf8ByteLength(value)>MAX_BACKUP_PLAINTEXT_BYTES)
    throw new Error("Backup UTF-8 хэмжээ 20 MB-ээс хэтэрсэн. Тэмдэглэлүүдээ тусад нь архивлана уу.");
}
export function assertBackupUploadSize(size:number):void{
  if(!Number.isSafeInteger(size)||size<0||size>MAX_BACKUP_ENCRYPTED_BYTES)
    throw new Error("Backup файл 28 MB-ээс хэтэрсэн эсвэл хэмжээ буруу байна.");
}
