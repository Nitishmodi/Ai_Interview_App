import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { getCurrentUser } from "@/lib/current-user";
import { firstName, statusLabel } from "@/lib/format";
import { candidateAttempts, jobsForCandidate } from "@/lib/jobs/queries";

export const metadata = { title: "Overview" };

export default async function CandidateHome() {
  const user = await getCurrentUser();
  const ready = Boolean(user.targetRole && user.skills);
  const matches = ready ? (await jobsForCandidate(user)).slice(0, 3) : [];
  const screens = await candidateAttempts(user.id);
  const open = screens.filter((screen) => screen.status !== "reported");
  const done = screens.filter((screen) => screen.status === "reported");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb195]">Candidate</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hello, {firstName(user.fullName)}.</h1>
        </div>
        <Link href="/candidate/jobs" className="press rounded-full bg-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white">
          Browse roles
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat href="/candidate/jobs" label="Roles for you" value={ready ? matches.length : "–"} hint={ready ? "See matches" : "Finish your profile"} />
        <Stat href="#continue" label="To finish" value={open.length} hint="Pick up an interview" />
        <Stat href="/candidate/results" label="Results" value={done.length} hint="Open scorecards" />
      </section>

      {!ready ? (
        <section className="rounded-3xl border border-white/10 bg-[#17130f] p-5">
          <h2 className="text-lg font-semibold">Your profile comes first</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#c9c4b8]">
            Roles are ordered from the work you want, your years, and your skills. Add those before you apply.
          </p>
          <Link href="/candidate/profile" className="press mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14120f]">
            Complete profile
          </Link>
        </section>
      ) : null}

      <Section id="continue" title="Continue" copy="Interviews you have started." action={<Link href="/candidate/results" className="text-sm font-medium text-[#ffb195] hover:underline">All results</Link>}>
        <ScreenRows rows={open} empty="You have no interview in progress." />
      </Section>

      <Section id="roles" title="Roles that fit" copy="The closest open posts for your profile." action={<Link href="/candidate/jobs" className="text-sm font-medium text-[#ffb195] hover:underline">See all</Link>}>
        <div className="grid gap-3">
          {matches.length ? matches.map(({ job, match }) => (
            <JobCard
              key={job.id}
              href={`/candidate/jobs/${job.id}`}
              job={job}
              badge={<p className="text-sm font-semibold text-[#ffb195]">{match.band}</p>}
            />
          )) : <p className="rounded-3xl border border-white/10 bg-[#141820] px-5 py-4 text-sm text-[#9c9890]">No visible roles yet.</p>}
        </div>
      </Section>

      <Section id="results" title="Your results" copy="The same scorecard the recruiter opens.">
        <ScreenRows rows={done.slice(0, 5)} empty="No result yet. Finish an interview and it shows up here." />
      </Section>
    </div>
  );
}

function Stat({ href, label, value, hint }) {
  return (
    <Link href={href} className="lift block rounded-3xl border border-white/10 bg-[#141820] px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c9890]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-[#ffb195]">{hint}</p>
    </Link>
  );
}

function Section({ id, title, copy, action, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[#9c9890]">{copy}</p>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ScreenRows({ rows, empty }) {
  if (!rows.length) return <p className="rounded-3xl border border-white/10 bg-[#141820] px-5 py-4 text-sm text-[#9c9890]">{empty}</p>;
  return (
    <ul className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-[#141820]">
      {rows.map((screen) => {
        const done = screen.status === "reported";
        return (
          <li key={screen.id}>
            <Link href={done ? `/candidate/reports/${screen.id}` : `/candidate/screen/${screen.id}`} className="row-link flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{screen.title}</p>
                <p className="text-sm text-[#9c9890]">{statusLabel[screen.status]}</p>
              </div>
              <span className="text-sm font-semibold text-[#ffb195]">{done ? `${screen.overallScore}% · Open` : "Continue"}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
