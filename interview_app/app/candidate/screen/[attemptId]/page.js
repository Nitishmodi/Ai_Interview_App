import { notFound, redirect } from "next/navigation";
import QuestionPaper from "@/components/screen/QuestionPaper";
import ResumeScoring from "@/components/screen/ResumeScoring";
import { getCurrentUser } from "@/lib/current-user";
import { loadAttempt } from "@/lib/jobs/queries";

export const maxDuration = 60;
export const metadata = { title: "Screen" };

export default async function ScreenPage({ params }) {
  const user = await getCurrentUser();
  const bundle = await loadAttempt(params.attemptId, user);
  if (!bundle || user.role !== "candidate") notFound();
  if (bundle.scorecard) redirect(`/candidate/reports/${bundle.attempt.id}`);
  if (bundle.attempt.status === "submitted") {
    return <ResumeScoring attemptId={bundle.attempt.id} answers={bundle.communicationAnswers} />;
  }

  return (
    <QuestionPaper
      attemptId={bundle.attempt.id}
      jobTitle={bundle.job.title}
      paper={bundle.paper}
      saved={{
        mcq: bundle.mcqAnswers,
        voice: bundle.voiceAnswers,
        communication: bundle.communicationAnswers,
      }}
    />
  );
}
