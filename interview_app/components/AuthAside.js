import Link from "next/link";

export default function AuthAside() {
  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#10131a] px-12 py-10 text-white lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_320px_at_20%_80%,rgba(255,90,31,0.28),transparent_60%)]" />
      <Link href="/" className="relative text-lg font-semibold">DevPilot AI</Link>
      <div className="relative max-w-md">
        <p className="text-4xl font-semibold leading-tight tracking-tight">The first interview, before the first call.</p>
        <p className="mt-4 text-white/70">Recruiters publish the role. Candidates sit an interview written for that work. Both of you keep the report.</p>
      </div>
      <p className="relative text-sm text-white/50">One account. Recruiter or candidate.</p>
    </aside>
  );
}
