import { notFound } from "next/navigation";
import ScorecardView from "@/components/reports/ScorecardView";
import { getCurrentUser } from "@/lib/current-user";
import { loadAttempt } from "@/lib/jobs/queries";

export const metadata = { title: "Scorecard" };

export default async function RecruiterReportPage({ params }) {
  const user = await getCurrentUser();
  const bundle = await loadAttempt(params.attemptId, user);
  if (!bundle?.scorecard) notFound();
  return <ScorecardView bundle={bundle} viewerRole="recruiter" />;
}
