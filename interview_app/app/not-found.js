import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-[#f3f0e8]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb195]">Missing</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">That page is not here.</h1>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[#ffb195] underline">
        Back home
      </Link>
    </main>
  );
}
