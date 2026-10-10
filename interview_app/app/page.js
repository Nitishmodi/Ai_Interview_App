import Link from "next/link";
import DeskSwitch from "@/components/marketing/DeskSwitch";
import SiteFooter from "@/components/marketing/SiteFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { getCurrentUser } from "@/lib/current-user";
import { homeFor } from "@/lib/format";

export const dynamic = "force-dynamic";

const moments = [
  {
    title: "A role with a real brief",
    copy: "The post carries the work, the skills, and the experience you actually want. Draft it, show it, or close it when the seat is filled.",
  },
  {
    title: "An interview written for that person",
    copy: "Applying opens a conversation built from the job and the candidate. Two people on the same role do not sit the same interview.",
  },
  {
    title: "One read, shared",
    copy: "When the interview is done, the recruiter and the candidate open the same report. The hiring call still belongs to the person running the role.",
  },
];

const path = [
  {
    number: "01",
    title: "Publish the role",
    copy: "Write the job the way you would brief a colleague. Edit it later. Keep it private until you are ready for people to see it.",
  },
  {
    number: "02",
    title: "Let the right people find it",
    copy: "Candidates set the work they want, their years, and their skills. Open roles line up against that, instead of landing in one long list.",
  },
  {
    number: "03",
    title: "They sit the interview",
    copy: "There is no separate first form. Applying is the interview: questions on the work, a few things said out loud, and a few things written down.",
  },
  {
    number: "04",
    title: "You decide",
    copy: "The report is a read of the interview, not a hire. You mark who moves forward. The candidate sees the same outcome you do.",
  },
];

const questions = [
  ["Who is this for?", "Hiring teams that want a first interview before the first call, and people applying to those roles. One account is either a recruiter or a candidate."],
  ["Do both sides see the same thing?", "They see the same report. The desks are separate: recruiters run roles, candidates take interviews."],
  ["Is the interview a generic test?", "No. It is written from the job description and that person's profile, so a backend role does not look like a design role."],
  ["Who makes the hiring call?", "The recruiter. The product prepares the interview and the report. It does not hire anyone."],
  ["Can a role stay private?", "Yes. A post can stay a draft, go live for candidates, or close when you are done hiring."],
];

export default async function HomePage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  const deskHref = user ? homeFor(user.role) : "/sign-up";

  return (
    <div className="bg-[#0c0e12] text-[#f3f0e8]">
      <SiteHeader signedIn={Boolean(user)} deskHref={deskHref} />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_80%_-10%,rgba(255,90,31,0.28),transparent_55%),radial-gradient(640px_420px_at_0%_20%,rgba(88,122,196,0.18),transparent_50%)]" />
          <div className="relative mx-auto grid max-w-6xl items-end gap-16 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#ffb195]">DEVPILOT AI</p>
              <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]">
                The first interview, before the first call.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#c9c4b8]">
                Post the role. People who fit sit an interview written for that work. You both leave with the same picture of the person.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={deskHref} className="press rounded-full bg-[#ff5a1f] px-5 py-3 text-sm font-semibold text-white">
                  {user ? "Open desk" : "Create account"}
                </Link>
                <a href="#path" className="press rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white">
                  See a role move
                </a>
              </div>
            </div>
            <DeskSwitch />
          </div>
        </section>

        <section id="product" className="scroll-mt-20 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <SectionLabel kicker="The product" title="Hiring software for the conversation you used to schedule." />
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
              {moments.map((moment) => (
                <article key={moment.title} className="wash bg-[#0c0e12] p-7">
                  <h3 className="text-xl font-semibold tracking-tight">{moment.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#c9c4b8]">{moment.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="teams" className="scroll-mt-20 border-b border-white/10 bg-[#10131a]">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <SectionLabel kicker="For teams" title="Run the role from one desk." />
              <p className="mt-6 max-w-md text-[15px] leading-7 text-[#c9c4b8]">
                Write the job once. Change it when the brief changes. See who sat the interview, open their report, and decide who you want to meet.
              </p>
            </div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {[
                ["The post is the brief", "Description, skills, and experience live on the role, and that is what the interview is built from."],
                ["Visibility is yours", "Keep a draft, open it to candidates, or close it when the seat is filled."],
                ["The report is readable", "Charts, notes, and a PDF you can hand to someone else on the hiring team."],
                ["The decision stays human", "Move someone forward, or leave them for a later role. The product does not hire them."],
              ].map(([title, copy]) => (
                <li key={title} className="wash rounded-2xl px-3 py-5">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#c9c4b8]">{copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="candidates" className="scroll-mt-20 border-b border-white/10">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <div className="order-2 lg:order-1">
              <RoleStack />
            </div>
            <div className="order-1 lg:order-2">
              <SectionLabel kicker="For candidates" title="See work that fits, then interview for it." />
              <p className="mt-6 max-w-md text-[15px] leading-7 text-[#c9c4b8]">
                Your profile is the role you want, your years, and your skills. Open posts are ordered from that. Applying does not send a resume into a pile. It starts the interview.
              </p>
              <Link href={user?.role === "candidate" ? "/candidate" : "/sign-up"} className="press mt-8 inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#14120f]">
                {user?.role === "candidate" ? "Open your desk" : "Create a candidate profile"}
              </Link>
            </div>
          </div>
        </section>

        <section id="path" className="scroll-mt-20 border-b border-white/10 bg-[#12151b]">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <SectionLabel kicker="How it runs" title="From a job post to a decision." />
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {path.map((step) => (
                <article key={step.number} className="lift rounded-3xl border border-white/10 bg-[#0c0e12] p-7">
                  <p className="text-sm font-semibold text-[#ff5a1f]">{step.number}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#c9c4b8]">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
            <SectionLabel kicker="Why it exists" title="The first round should feel like the job." />
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                ["Less waiting on a calendar", "The interview happens when the person applies, not when three people find a slot."],
                ["Closer to the actual work", "Questions follow the role you wrote, not a bank that could belong to any company."],
                ["The same story on both sides", "Candidates are not guessing what happened to their application. They can open the report."],
                ["A record you can share", "Download the report when someone else on the team needs to read it."],
              ].map(([title, copy]) => (
                <article key={title}>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#c9c4b8]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="questions" className="scroll-mt-20 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <SectionLabel kicker="Questions" title="Before you open a desk." />
            <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {questions.map(([title, answer]) => (
                <details key={title} className="group py-5 transition hover:pl-2">
                  <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
                    <span className="flex items-center justify-between gap-6">
                      {title}
                      <span className="text-[#ff5a1f] transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c9c4b8]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#ff5a1f] text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 py-16 lg:py-24">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-white/80">START</p>
              <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">Pick a side and open the desk.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="press rounded-full bg-[#14120f] px-5 py-3 text-sm font-semibold text-white">
                Create account
              </Link>
              <Link href="/sign-in" className="press rounded-full border border-white/40 px-5 py-3 text-sm font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionLabel({ kicker, title }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb195]">{kicker}</p>
      <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    </div>
  );
}

function RoleStack() {
  const roles = [
    ["Backend engineer", "Platform · Remote", "Strong match"],
    ["Product engineer", "Growth · Bengaluru", "Possible"],
    ["Support engineer", "Customer · Hybrid", "Looser"],
  ];
  return (
    <div className="space-y-3">
      {roles.map(([title, meta, band], index) => (
        <div key={title} className={`lift rounded-3xl border border-white/10 p-5 ${index === 0 ? "bg-[#17130f]" : "bg-[#141820]"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">{title}</p>
              <p className="mt-1 text-sm text-[#9c9890]">{meta}</p>
            </div>
            <p className="text-sm font-medium text-[#ffb195]">{band}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
