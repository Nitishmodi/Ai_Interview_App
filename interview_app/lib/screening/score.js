import { PASS_MARK } from "@/lib/format";

export function scoreMcq(paper, answers) {
  const questions = paper?.mcq || [];
  let correct = 0;
  const review = questions.map((question) => {
    const chosen = Number(answers?.[question.id]);
    const right = chosen === question.answer;
    if (right) correct += 1;
    return {
      id: question.id,
      skill: question.skill,
      prompt: question.prompt,
      options: question.options,
      chosen: Number.isInteger(chosen) ? chosen : null,
      answer: question.answer,
      right,
    };
  });
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return { score, correct, total: questions.length, review };
}

export function scoreVoice(paper, answers) {
  const questions = paper?.voice || [];
  const review = questions.map((question) => {
    const saved = answers?.[question.id] || {};
    return {
      id: question.id,
      prompt: question.prompt,
      transcript: saved.transcript || "",
      score: clamp(saved.score),
      note: saved.note || "",
    };
  });
  const score = average(review.map((item) => item.score));
  return { score, review };
}

export function scoreCommunication(paper, answers, grades) {
  const questions = paper?.communication || [];
  const review = questions.map((question, index) => {
    const grade = grades?.[index] || {};
    return {
      id: question.id,
      prompt: question.prompt,
      answer: String(answers?.[question.id] || ""),
      score: clamp(grade.score),
      note: String(grade.note || "").trim(),
    };
  });
  return { score: average(review.map((item) => item.score)), review };
}

export function overallScore(mcq, voice, communication) {
  return Math.round((mcq + voice + communication) / 3);
}

export function recommendationFor(scores) {
  const cleared =
    scores.mcq > PASS_MARK &&
    scores.voice > PASS_MARK &&
    scores.communication > PASS_MARK &&
    scores.overall > PASS_MARK;
  return cleared ? "proceed" : "not_this_time";
}

export function skillBreakdown(review) {
  const groups = new Map();
  for (const item of review) {
    const name = item.skill || "General";
    const group = groups.get(name) || { name, correct: 0, total: 0 };
    group.total += 1;
    if (item.right) group.correct += 1;
    groups.set(name, group);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    score: group.total ? Math.round((group.correct / group.total) * 100) : 0,
  }));
}

function clamp(value) {
  const number = Math.round(Number(value));
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(100, number));
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
