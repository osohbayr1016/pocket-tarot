import type {Metadata} from "next";
export const metadata:Metadata={
 title:"Ашиглах нөхцөл / Terms — Pocket Tarot",
 description:"Pocket Tarot-ийн зориулалт, тайлбарын хязгаар болон хэрэглэгчийн хариуцлага.",
};
export default function TermsPage(){
 return <main className="min-h-screen bg-[#100e1e] px-4 py-12 text-[#f6f1e9]">
  <article className="mx-auto max-w-3xl space-y-6 leading-7">
   <a href="/" className="text-amber-200 underline underline-offset-4">← Pocket Tarot</a>
   <h1 className="font-serif text-4xl text-amber-100">Ашиглах нөхцөл / Terms</h1>
   <p className="text-sm text-slate-300">Шинэчилсэн: 2026-11-13 · Updated: 13 November 2026</p>
   <section><h2 className="font-serif text-2xl text-amber-100">Зориулалт</h2>
    <p className="mt-2">Pocket Tarot нь уламжлалт Tarot бэлгэдэл, өөрийгөө эргэцүүлэх дасгал, сургалт болон зурхайн соёлын тайлбарт зориулсан программ юм. Картын тайлал, зурхай, зүүдний бэлгэдэл нь ирээдүйн үйл явдлыг шинжлэх ухааны үндэслэлтэй таамаглахгүй.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">Чухал шийдвэр</h2>
    <p className="mt-2">Эрүүл мэнд, санхүү, хууль болон аюулгүй байдалтай холбоотой шийдвэрийг зөвхөн энэ аппын тайлбарт тулгуурлан бүү гарга. Холбогдох мэргэжлийн хүнээс зөвлөгөө аваарай.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">Өгөгдөл ба тасалдал</h2>
    <p className="mt-2">Browser storage-ийг цэвэрлэх, төхөөрөмж эвдрэх эсвэл offline cache устахад өгөгдөл алдагдаж болно. Хэрэглэгч хувийн backup-аа хадгалж, нууц үгээ хамгаалах шаардлагатай. Сайтын функц, агуулга болон хүртээмж цаг хугацааны явцад өөрчлөгдөж болно.</p></section>
   <section><h2 className="font-serif text-2xl text-amber-100">English summary</h2>
    <p className="mt-2">Pocket Tarot provides cultural Tarot symbolism, reflective prompts and educational content. It cannot reliably predict the future and is not medical, legal, financial or mental-health advice. Save backups of your own on-device data. Features and availability may change as the app evolves.</p></section>
   <p className="text-sm text-slate-300">Questions / Асуулт: <a className="text-amber-200 underline" href="https://github.com/osohbayr1016/pocket-tarot/issues">GitHub Issues</a></p>
  </article>
 </main>;
}
