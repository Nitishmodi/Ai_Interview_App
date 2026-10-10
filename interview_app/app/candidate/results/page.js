import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { formatWhen, statusLabel } from "@/lib/format";
import { candidateAttempts } from "@/lib/jobs/queries";

export const metadata = { title: "Results" };

export default async function ResultsPage() {
  const user = await getCurrentUser();
  const screens = await candidateAttempts(user.id);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Results</h1>
      <p className="mt-2 text-sm text-[#9c9890]">The same scorecard is on the recruiter&apos;s desk.</p>
      <ul className="mt-6 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-[#141820]">
        {screens.length ? screens.map((screen) => {
          const done = screen.status === "reported";
          return (
            <li key={screen.id}>
              <Link href={done ? `/candidate/reports/${screen.id}` : `/candidate/screen/${screen.id}`} className="row-link flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">{screen.title}</p>
                  <p className="text-sm text-[#9c9890]">{screen.location} · {formatWhen(screen.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{screen.overallScore != null ? `${screen.overallScore}%` : statusLabel[screen.status]}</span>
                  {screen.recommendation ? <span className="text-[#c9c4b8]">{statusLabel[screen.recommendation]}</span> : null}
                  <span className="font-semibold text-[#ffb195]">{done ? "Open" : "Continue"}</span>
                </div>
              </Link>
            </li>
          );
        }) : <li className="px-5 py-4 text-sm text-[#9c9890]">No screens yet.</li>}
      </ul>
    </div>
  );
}
