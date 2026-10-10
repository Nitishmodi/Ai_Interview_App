import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { getCurrentUser } from "@/lib/current-user";
import { jobsForCandidate } from "@/lib/jobs/queries";

export const metadata = { title: "Roles for you" };

export default async function CandidateJobsPage() {
  const user = await getCurrentUser();
  if (!user.targetRole || !user.skills) {
    return (
      <p className="text-sm">
        Finish your <Link href="/candidate/profile" className="font-semibold text-[#ffb195] underline">profile</Link> so roles can be matched to your experience and skills.
      </p>
    );
  }
  const matches = await jobsForCandidate(user);
  const recommended = matches.filter((item) => item.match.score >= 40);
  const others = matches.filter((item) => item.match.score < 40);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Roles for you</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9c9890]">
          Ordered from your target role, {user.experienceYears} years, and {user.skills}.
        </p>
      </div>
      <JobGroup title="Recommended" items={recommended} empty="Nothing lines up closely yet. Update your profile or check the other open roles." />
      <JobGroup title="Other open roles" items={others} empty="No other visible roles." />
    </div>
  );
}

function JobGroup({ title, items, empty }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map(({ job, match }) => (
          <JobCard
            key={job.id}
            href={`/candidate/jobs/${job.id}`}
            job={job}
            badge={<p className="text-sm font-semibold text-[#ffb195]">{match.score}% · {match.band}</p>}
            note={match.reasons.join(" · ")}
          />
        )) : <p className="text-sm text-[#9c9890]">{empty}</p>}
      </div>
    </section>
  );
}
