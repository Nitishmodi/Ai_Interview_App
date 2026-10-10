import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { loadAttempt } from "@/lib/jobs/queries";
import { buildScorecardPdf } from "@/lib/reports/pdf";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const user = await getCurrentUser();
  const bundle = await loadAttempt(params.attemptId, user);
  if (!bundle?.scorecard) return new NextResponse("Not found", { status: 404 });

  const pdf = buildScorecardPdf(bundle);
  const filename = `${bundle.candidate.fullName}-${bundle.job.title}-scorecard.pdf`.replace(/[^\w.-]+/g, "-");
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
