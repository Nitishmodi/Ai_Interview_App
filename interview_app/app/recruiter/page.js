import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { firstName, statusLabel } from "@/lib/format";
import { countVisibleJobs, recruiterInbox } from "@/lib/jobs/queries";

export const metadata = { title: "Overview" };

export default async function RecruiterHome() {
  const user = await getCurrentUser();
  const [visible, inbox] = await Promise.all([countVisibleJobs(user.id), recruiterInbox(user.id)]);
  const waiting = inbox.filter((row) => row.status === "reported" && row.decision !== "move_forward" && row.decision !== "not_proceeding");
  const live = inbox.filter((row) => row.status !== "reported");
  const decided = inbox.filter((row) => row.decision === "move_forward" || row.decision === "not_proceeding");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb195]">Recruiter</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hello, {firstName(user.fullName)}.</h1>
        </div>
        <Link href="/recruiter/jobs/new" className="press rounded-full bg-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white">
          New job post
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat href="/recruiter/jobs" label="Visible roles" value={visible} hint="Open the posts" />
        <Stat href="#in-progress" label="In the interview" value={live.length} hint="Still answering" />
        <Stat href="#decisions" label="Waiting on you" value={waiting.length} hint="Scorecards to mark" />
      </section>

      <Section
        id="decisions"
        title="Decisions"
        copy="Reported screens that still need your call."
        action={<Link href="/recruiter/jobs" className="text-sm font-medium text-[#ffb195] hover:underline">All posts</Link>}
      >
        <Rows
          empty="Nothing is waiting. When a candidate finishes, the scorecard lands here."
          rows={waiting}
          href={(row) => `/recruiter/reports/${row.id}`}
          action="Open scorecard"
        />
      </Section>

      <Section id="in-progress" title="In progress" copy="People who started and have not submitted.">
        <Rows
          empty="No interview is open right now."
          rows={live}
          href={() => "/recruiter/jobs"}
          action="View post"
        />
      </Section>

      <Section id="marked" title="Already marked" copy="Screens you have already decided.">
        <Rows
          empty="No decisions yet."
          rows={decided.slice(0, 6)}
          href={(row) => `/recruiter/reports/${row.id}`}
          action="Open scorecard"
        />
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

function Rows({ rows, empty, href, action }) {
  if (!rows.length) return <p className="rounded-3xl border border-white/10 bg-[#141820] px-5 py-4 text-sm text-[#9c9890]">{empty}</p>;
  return (
    <ul className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-[#141820]">
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={href(row)} className="row-link flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium">{row.candidateName}</p>
              <p className="text-sm text-[#9c9890]">{row.title}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-lg font-semibold tabular-nums">{row.overallScore ?? "–"}</span>
              <span className="text-[#c9c4b8]">{row.recommendation ? statusLabel[row.recommendation] : statusLabel[row.status]}</span>
              <span className="font-semibold text-[#ffb195]">{action}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
