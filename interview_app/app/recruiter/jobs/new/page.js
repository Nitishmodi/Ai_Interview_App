import JobPostForm from "@/components/jobs/JobPostForm";

export const metadata = { title: "New job post" };

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">New job post</h1>
      <p className="mt-2 text-sm leading-6 text-[#9c9890]">
        Split the post into the role, the work, and what someone should bring. That brief is what the interview is written from.
      </p>
      <div className="mt-8">
        <JobPostForm />
      </div>
    </div>
  );
}
