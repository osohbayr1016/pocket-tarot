import Link from "next/link";

export default function LegacyAuthenticationClosed() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center text-ink">
      <h1 className="font-serif text-3xl">Хуучин нэвтрэх систем хаагдсан</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted">
        Pocket Tarot-ийн шинэ хувилбар бүртгэл, token эсвэл backend шаардлагагүй.
        Уншилт болон тэмдэглэл таны төхөөрөмж дээр хадгалагдана.
      </p>
      <Link href="/" className="mt-7 rounded-full bg-pine px-6 py-3 font-semibold text-on-pine">Нүүр хуудас</Link>
    </main>
  );
}
