import Link from "next/link";
import { notFound } from "next/navigation";
import JobBody from "@/components/jobs/JobBody";
import ApplyButton from "@/components/screen/ApplyButton";
import { getCurrentUser } from "@/lib/current-user";
import { matchJob } from "@/lib/jobs/match";
import { findAttempt, getJob } from "@/lib/jobs/queries";

export const maxDuration = 60;

export async function generateMetadata({ params }) {
  const job = await getJob(params.jobId);
  return { title: job?.title || "Role" };
}

export default async function CandidateJobPage({ params }) {
  const user = await getCurrentUser();
  const job = await getJob(params.jobId);
  if (!job || job.status === "draft") notFound();
  const attempt = await findAttempt(job.id, user.id);
  const match = matchJob(user, job);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="space-y-8">
        <div>
          <p className="text-sm text-[#9c9890]">{job.department} · {job.location} · {job.employmentType}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{job.title}</h1>
          <p className="mt-2 text-sm text-[#9c9890]">{job.experienceYears} experience</p>
        </div>
        <JobBody job={job} />
      </article>
      <aside className="lift h-fit rounded-3xl border border-white/10 bg-[#141820] p-5 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c9890]">For you</p>
        <p className="mt-2 text-lg font-semibold text-[#ffb195]">{match.band}</p>
        <p className="mt-1 text-sm text-[#9c9890]">{match.reasons.join(" · ")}</p>
        <div className="mt-5">
          {job.status !== "visible" && !attempt ? (
            <p className="text-sm text-[#9c9890]">This role is closed.</p>
          ) : attempt?.status === "reported" ? (
            <Link href={`/candidate/reports/${attempt.id}`} className="text-sm font-semibold text-[#ffb195] underline">Open your scorecard</Link>
          ) : attempt ? (
            <Link href={`/candidate/screen/${attempt.id}`} className="press inline-flex rounded-full bg-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white">Continue the screen</Link>
          ) : (
            <ApplyButton jobId={job.id} />
          )}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#9c9890]">
          Applying starts the interview. The questions are written from this brief and from your profile.
        </p>
      </aside>
    </div>
  );
}
