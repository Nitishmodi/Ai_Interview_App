import { jsPDF } from "jspdf";
import { PASS_MARK } from "@/lib/format";

function line(doc, text, y, size = 11, style = "normal") {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  const rows = doc.splitTextToSize(String(text || ""), 500);
  doc.text(rows, 48, y);
  return y + rows.length * (size + 3);
}

export function buildScorecardPdf(bundle) {
  const { scorecard, job, candidate } = bundle;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 56;

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 595, 8, "F");
  y = line(doc, "DevPilot AI", y, 12, "bold");
  y = line(doc, "Hiring scorecard", y + 4, 22, "bold");
  y = line(doc, `${candidate.fullName}  ·  ${candidate.email}`, y + 8, 11);
  y = line(doc, `${job.title}  ·  ${job.location}  ·  ${job.experienceYears} years`, y + 2, 11);
  y += 8;

  const verdict = scorecard.recommendation === "proceed" ? "Proceed to the next step" : "Not this time";
  y = line(doc, verdict, y, 16, "bold");
  y = line(
    doc,
    scorecard.recommendation === "proceed"
      ? `Every section is above ${PASS_MARK}, and the overall score is above ${PASS_MARK}.`
      : `A section or the overall score is not above ${PASS_MARK}. They may be considered for a future role.`,
    y + 2,
    11
  );

  y += 10;
  const rows = [
    ["Skills MCQ", scorecard.mcqScore],
    ["Voice", scorecard.voiceScore],
    ["Communication", scorecard.communicationScore],
    ["Overall", scorecard.overallScore],
  ];
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(String(label), 48, y);
    doc.text(`${value}%`, 220, y);
    doc.setDrawColor(230);
    doc.rect(260, y - 9, 220, 8);
    doc.setFillColor(17, 17, 17);
    doc.rect(260, y - 9, Math.max(0, Math.min(220, (Number(value) / 100) * 220)), 8, "F");
    y += 18;
  });

  y += 8;
  y = line(doc, "Summary", y, 13, "bold");
  y = line(doc, scorecard.summary, y + 4, 11);
  y += 8;
  y = line(doc, "Strengths", y, 13, "bold");
  scorecard.strengths.forEach((item) => {
    y = line(doc, `•  ${item}`, y + 2, 11);
  });
  y += 8;
  y = line(doc, "Gaps", y, 13, "bold");
  scorecard.gaps.forEach((item) => {
    y = line(doc, `•  ${item}`, y + 2, 11);
  });

  const skills = scorecard.breakdown?.skills || [];
  if (skills.length) {
    y += 10;
    y = line(doc, "Skill split", y, 13, "bold");
    skills.forEach((skill) => {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      y = line(doc, `${skill.name}: ${skill.correct}/${skill.total} correct (${skill.score}%)`, y + 2, 11);
    });
  }

  const decision =
    scorecard.decision === "move_forward"
      ? "Recruiter decision: moving forward."
      : scorecard.decision === "not_proceeding"
        ? "Recruiter decision: not proceeding."
        : "Recruiter decision: not marked yet.";
  if (y > 760) {
    doc.addPage();
    y = 56;
  }
  y = line(doc, decision, y + 16, 11, "bold");
  line(doc, "Pass mark is above 80% in skills, voice, communication, and overall.", y + 6, 9);

  return Buffer.from(doc.output("arraybuffer"));
}
