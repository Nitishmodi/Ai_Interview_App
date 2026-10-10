import { notFound } from "next/navigation";
import JobPostForm from "@/components/jobs/JobPostForm";
import { getCurrentUser } from "@/lib/current-user";
import { getRecruiterJob } from "@/lib/jobs/queries";

export const metadata = { title: "Edit job post" };

export default async function EditJobPage({ params }) {
  const user = await getCurrentUser();
  const job = await getRecruiterJob(params.jobId, user.id);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Edit {job.title}</h1>
      <div className="mt-8">
        <JobPostForm job={job} />
      </div>
    </div>
  );
}
