/**
 * Cross-tab journal invalidation, never a data sync or a storage backup.
 * Only a revision token crosses tabs; questions/notes are never broadcast.
 */
export const JOURNAL_SIGNAL_KEY="pocket-tarot-journal-revision-v1";
let sequence=0;
export function notifyJournalChanged():void{
  if(typeof window==="undefined")return;
  try{
    localStorage.setItem(JOURNAL_SIGNAL_KEY,Date.now()+"-"+(++sequence));
  }catch{
    // A storage quota/private-mode failure must not undo a committed IDB write.
    // Tabs still refresh from IndexedDB when focused or made visible.
  }
}
