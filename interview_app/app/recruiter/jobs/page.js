import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { statusLabel } from "@/lib/format";
import { getCurrentUser } from "@/lib/current-user";
import { listRecruiterJobs } from "@/lib/jobs/queries";

export const metadata = { title: "Job posts" };

export default async function RecruiterJobsPage() {
  const user = await getCurrentUser();
  const posts = await listRecruiterJobs(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Job posts</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#9c9890]">Each post is a brief: the role, the work, and who should apply. Visible posts show up for people who overlap.</p>
        </div>
        <Link href="/recruiter/jobs/new" className="press rounded-full bg-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white">New job post</Link>
      </div>
      <div className="mt-8 space-y-8">
        <JobGroup title="Visible" copy="Candidates can see these and apply." jobs={posts.filter((job) => job.status === "visible")} empty="Nothing is visible yet." />
        <JobGroup title="Drafts" copy="Hidden until you open them." jobs={posts.filter((job) => job.status === "draft")} empty="No drafts." />
        <JobGroup title="Closed" copy="Filled or no longer taking screens." jobs={posts.filter((job) => job.status === "closed")} empty="No closed roles." />
      </div>
    </div>
  );
}

function JobGroup({ title, copy, jobs, empty }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[#9c9890]">{copy}</p>
      <div className="mt-4 grid gap-3">
        {jobs.length ? jobs.map((job) => (
          <JobCard
            key={job.id}
            href={`/recruiter/jobs/${job.id}`}
            job={job}
            extra={`${job.attemptCount} screen${job.attemptCount === 1 ? "" : "s"}`}
            badge={<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{statusLabel[job.status] || job.status}</span>}
          />
        )) : <p className="rounded-3xl border border-white/10 bg-[#141820] px-5 py-4 text-sm text-[#9c9890]">{empty}</p>}
      </div>
    </section>
  );
}
