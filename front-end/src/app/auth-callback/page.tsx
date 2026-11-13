import Link from "next/link";

export default function LegacyAuthenticationClosed() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#100e1e] px-5 text-center text-amber-100">
      <h1 className="font-serif text-3xl">Хуучин нэвтрэх систем хаагдсан</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
        Pocket Tarot-ийн шинэ хувилбар бүртгэл, token эсвэл backend шаардлагагүй.
        Уншилт болон тэмдэглэл таны төхөөрөмж дээр хадгалагдана.
      </p>
      <Link href="/" className="mt-7 rounded-full bg-amber-300 px-6 py-3 font-semibold text-[#171127]">Нүүр хуудас</Link>
    </main>
  );
}
