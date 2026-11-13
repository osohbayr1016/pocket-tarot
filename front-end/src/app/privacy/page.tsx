import type {Metadata} from "next";
export const metadata:Metadata={
 title:"Нууцлал / Privacy — Pocket Tarot",
 description:"Pocket Tarot-ийн local storage, privacy болон өгөгдөл хадгалах талаарх мэдээлэл.",
};
export default function PrivacyPage(){
 return <main className="min-h-screen bg-[#100e1e] px-4 py-12 text-[#f6f1e9]">
  <article className="mx-auto max-w-3xl space-y-6 leading-7">
   <a href="/" className="text-amber-200 underline underline-offset-4">← Pocket Tarot</a>
   <h1 className="font-serif text-4xl text-amber-100">Нууцлал / Privacy</h1>
   <p className="text-sm text-slate-300">Шинэчилсэн: 2026-11-13 · Updated: 13 November 2026</p>
   <section><h2 className="font-serif text-2xl text-amber-100">Таны мэдээлэл хаана хадгалагдах вэ?</h2>
    <p className="mt-2">Pocket Tarot v2-ийн уншлага, хувийн тэмдэглэл IndexedDB-д; сургалтын ахиц, тохиргоо болон түр тэмдэглэл browser-ийн local storage-д хадгалагдана. Tarot, зурхай, зүүдний бэлгэдлийн үндсэн тайлбарууд төхөөрөмж дээр ажилладаг. Апп эдгээр тэмдэглэлээ аккаунтын серверт илгээдэггүй.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">Устгах ба сэргээх</h2>
    <p className="mt-2">Journal дотроос уншлагаа устгаж, Settings хэсгээс түр тэмдэглэлээ цэвэрлэж болно. Browser-ийн site data-г устгавал backup хийгээгүй мэдээлэл алдагдаж болно. Settings-ийн encrypted export нь файлыг нууц үгээр хамгаална, харин төхөөрөмж дээрх өгөгдөл өөрөө шифрлэгдээгүй.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">Network ба хостинг</h2>
    <p className="mt-2">Сайтыг анх нээх, зураг татах, шинэчлэхэд интернет хэрэгтэй. Хостинг үйлчилгээ техникийн хүсэлтийн лог (жишээ нь IP хаяг, user agent) боловсруулж болзошгүй. Энэ баримт нь хостинг нийлүүлэгчийн тусдаа нууцлалын нөхцөлийг орлохгүй.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">English summary</h2>
    <p className="mt-2">Readings and private notes are stored on this device, not sent to an account server by the v2 app. Browser cleanup may erase unsaved data. Encrypted backups are password-protected files; local browser storage is not encrypted at rest. Initial loading, assets and updates require network requests and the hosting provider may process technical logs.</p></section>
   <p className="text-sm text-slate-300">Support / Холбоо: <a className="text-amber-200 underline" href="https://github.com/osohbayr1016/pocket-tarot/issues">GitHub Issues</a></p>
  </article>
 </main>;
}
