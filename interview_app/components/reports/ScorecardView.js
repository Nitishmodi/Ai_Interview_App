"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { setDecision } from "@/lib/screening/actions";
import { PASS_MARK, statusLabel } from "@/lib/format";
import { FormError, quietClass } from "@/components/Field";
import { ScoreBars, SectionPie } from "@/components/reports/ScoreCharts";

export default function ScorecardView({ bundle, viewerRole }) {
  const { scorecard, job, candidate, attempt } = bundle;
  const cleared = scorecard.recommendation === "proceed";
  const skills = scorecard.breakdown?.skills || [];
  const voice = scorecard.breakdown?.voice || [];
  const communication = scorecard.breakdown?.communication || [];
  const mcq = scorecard.breakdown?.mcq || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#9c9890]">{job.title}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{candidate.fullName}</h1>
          <p className="text-sm text-[#9c9890]">{candidate.email}</p>
        </div>
        <a href={`/api/reports/${attempt.id}/pdf`} className={quietClass}>
          Download PDF
        </a>
      </header>

      <section className={`rounded-3xl px-6 py-5 ${cleared ? "bg-[#14241c] text-[#d7f3e3]" : "bg-[#2a1812] text-[#ffd7c8]"}`}>
        <p className="text-sm font-semibold uppercase tracking-wide">{cleared ? "Proceed" : "Not this time"}</p>
        <p className="mt-2 max-w-2xl text-[15px] leading-6">
          {cleared
            ? `Every section is above ${PASS_MARK}%, and the overall score is above ${PASS_MARK}%. This candidate can go to the next step.`
            : `This screen did not clear ${PASS_MARK}% in every section and overall. Not this time. They may be considered for a future role.`}
        </p>
        <p className="mt-3 text-5xl font-semibold tabular-nums">{scorecard.overallScore}%</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#141820] p-5">
          <h2 className="text-lg font-semibold">Section split</h2>
          <div className="mt-4">
            <SectionPie mcq={scorecard.mcqScore} voice={scorecard.voiceScore} communication={scorecard.communicationScore} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#141820] p-5">
          <h2 className="text-lg font-semibold">Against the pass mark</h2>
          <div className="mt-4">
            <ScoreBars
              rows={[
                { label: "Skills MCQ", value: scorecard.mcqScore },
                { label: "Voice", value: scorecard.voiceScore },
                { label: "Communication", value: scorecard.communicationScore },
                { label: "Overall", value: scorecard.overallScore },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#141820] p-5">
        <h2 className="text-lg font-semibold">What the screen showed</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7">{scorecard.summary}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <NoteList title="Strengths" items={scorecard.strengths} />
          <NoteList title="Gaps" items={scorecard.gaps} />
        </div>
      </section>

      {skills.length ? (
        <section className="rounded-3xl border border-white/10 bg-[#141820] p-5">
          <h2 className="text-lg font-semibold">Skills</h2>
          <div className="mt-4">
            <ScoreBars rows={skills.map((skill) => ({ label: `${skill.name} · ${skill.correct}/${skill.total}`, value: skill.score }))} />
          </div>
        </section>
      ) : null}

      <AnswerNotes title="Spoken answers" items={voice} textKey="transcript" />
      <AnswerNotes title="Communication answers" items={communication} textKey="answer" />

      {viewerRole === "recruiter" ? (
        <details className="rounded-3xl border border-white/10 bg-[#141820] p-5">
          <summary className="cursor-pointer text-sm font-semibold">Skill question review</summary>
          <ul className="mt-4 space-y-4">
            {mcq.map((question, number) => (
              <li key={question.id}>
                <p className="font-medium">{number + 1}. {question.prompt}</p>
                <p className="mt-1 text-sm text-[#c9c4b8]">
                  {question.right ? "Correct" : `Marked ${labelOption(question)} · answer was ${question.options[question.answer]}`}
                </p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {viewerRole === "recruiter" ? (
        <DecisionPanel attemptId={attempt.id} decision={scorecard.decision} />
      ) : (
        <p className="text-sm text-[#9c9890]">Recruiter decision: {statusLabel[scorecard.decision] || "Not marked yet"}.</p>
      )}
    </div>
  );
}

function labelOption(question) {
  if (question.chosen === null || question.chosen === undefined) return "nothing";
  return question.options[question.chosen] || "an option";
}

function NoteList({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-6">
        {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li className="text-[#9c9890]">None noted.</li>}
      </ul>
    </div>
  );
}

function AnswerNotes({ title, items, textKey }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.map((item, number) => (
        <article key={item.id || number} className="rounded-3xl border border-white/10 bg-[#141820] p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">{item.prompt}</p>
            <p className="text-2xl font-semibold tabular-nums">{item.score}</p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item[textKey]}</p>
          {item.note ? <p className="mt-3 border-t border-white/10 pt-3 text-sm text-[#c9c4b8]">{item.note}</p> : null}
        </article>
      ))}
    </section>
  );
}

function DecisionPanel({ attemptId, decision }) {
  const router = useRouter();
  const [state, action] = useFormState(setDecision, { error: "" });
  useEffect(() => {
    if (state?.saved) router.refresh();
  }, [state?.saved, router]);

  return (
    <form action={action} className="rounded-3xl border border-white/10 bg-[#141820] p-5">
      <input type="hidden" name="attemptId" value={attemptId} />
      <h2 className="text-lg font-semibold">Your decision</h2>
      <p className="mt-1 text-sm text-[#9c9890]">The scorecard recommends. You decide if they move forward.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" name="decision" value="move_forward" className={decision === "move_forward" ? "rounded-full bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white" : quietClass}>
          Move forward
        </button>
        <button type="submit" name="decision" value="not_proceeding" className={decision === "not_proceeding" ? "rounded-full bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white" : quietClass}>
          Not this time
        </button>
      </div>
      <div className="mt-3">
        <FormError message={state?.error} />
      </div>
    </form>
  );
}
