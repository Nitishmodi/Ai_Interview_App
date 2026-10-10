import Link from "next/link";
import { notFound } from "next/navigation";
import JobBody from "@/components/jobs/JobBody";
import VisibilityForm from "@/components/jobs/VisibilityForm";
import { getCurrentUser } from "@/lib/current-user";
import { formatWhen, statusLabel } from "@/lib/format";
import { getRecruiterJob, listJobAttempts } from "@/lib/jobs/queries";

export async function generateMetadata({ params }) {
  const user = await getCurrentUser();
  if (!user) return { title: "Job post" };
  const job = await getRecruiterJob(params.jobId, user.id);
  return { title: job?.title || "Job post" };
}

export default async function RecruiterJobPage({ params }) {
  const user = await getCurrentUser();
  const job = await getRecruiterJob(params.jobId, user.id);
  if (!job) notFound();
  const screens = await listJobAttempts(job.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#9c9890]">{job.department} · {job.location} · {job.employmentType} · {job.experienceYears}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{job.title}</h1>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{statusLabel[job.status]}</span>
      </div>
      <JobBody job={job} />
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/recruiter/jobs/${job.id}/edit`} className="press rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">Edit post</Link>
        <VisibilityForm jobId={job.id} status={job.status} />
      </div>
      <section>
        <h2 className="text-xl font-semibold">Candidates</h2>
        <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-[#141820]">
          {screens.length ? screens.map((screen) => (
            <li key={screen.id}>
              <div className="row-link flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium">{screen.candidateName}</p>
                  <p className="text-sm text-[#9c9890]">{screen.candidateEmail} · {formatWhen(screen.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg font-semibold tabular-nums">{screen.overallScore ?? "–"}</span>
                  <span className="text-[#c9c4b8]">{screen.recommendation ? statusLabel[screen.recommendation] : statusLabel[screen.status]}</span>
                  {screen.status === "reported" ? (
                    <Link href={`/recruiter/reports/${screen.id}`} className="font-semibold text-[#ffb195] underline">Scorecard</Link>
                  ) : (
                    <span className="text-[#9c9890]">Still in the screen</span>
                  )}
                </div>
              </div>
            </li>
          )) : <li className="px-5 py-4 text-sm text-[#9c9890]">No candidates yet. Make the post visible and matching candidates can apply.</li>}
        </ul>
      </section>
    </div>
  );
}
