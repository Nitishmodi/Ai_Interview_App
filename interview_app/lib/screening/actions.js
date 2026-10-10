"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { attempts, jobs, scorecards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/current-user";
import { asId } from "@/lib/format";
import { editableAttempt, findAttempt, loadAttempt } from "@/lib/jobs/queries";
import { buildQuestionPaper, explainScorecard, gradeRecording, gradeWrittenAnswers } from "@/lib/screening/gemini";
import { overallScore, recommendationFor, scoreCommunication, scoreMcq, scoreVoice, skillBreakdown } from "@/lib/screening/score";

export async function startAttempt(prev, formData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "candidate") return { error: "Sign in as a candidate to apply." };
  if (!user.targetRole || !user.skills) return { error: "Add your role, experience, and skills on your profile first." };

  const jobId = asId(formData.get("jobId"));
  if (!jobId) return { error: "That role could not be found." };
  const db = await database();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if (!job || job.status !== "visible") return { error: "This role is not open." };

  const existing = await findAttempt(job.id, user.id);
  if (existing?.status === "reported") redirect(`/candidate/reports/${existing.id}`);
  if (existing) redirect(`/candidate/screen/${existing.id}`);

  let paper;
  try {
    paper = await buildQuestionPaper({ job, candidate: user });
  } catch (error) {
    return { error: error.message || "The screen could not be prepared." };
  }

  const [attempt] = await db
    .insert(attempts)
    .values({
      jobId: job.id,
      candidateId: user.id,
      status: "in_progress",
      paper: JSON.stringify(paper),
      mcqAnswers: "{}",
      voiceAnswers: "{}",
      communicationAnswers: "{}",
      createdAt: new Date().toISOString(),
    })
    .returning({ id: attempts.id });

  revalidatePath("/candidate");
  redirect(`/candidate/screen/${attempt.id}`);
}

export async function saveMcqAnswers(attemptId, answers) {
  const user = await getCurrentUser();
  const attempt = user?.role === "candidate" ? await editableAttempt(attemptId, user.id) : null;
  if (!attempt) return { error: "This screen can no longer be edited." };
  const db = await database();
  await db.update(attempts).set({ mcqAnswers: JSON.stringify(answers || {}) }).where(eq(attempts.id, attempt.id));
  return { error: "" };
}

export async function saveVoiceAnswer(attemptId, questionId, audioBase64, mimeType, liveTranscript) {
  const user = await getCurrentUser();
  const bundle = await loadAttempt(attemptId, user);
  if (!bundle || user.role !== "candidate" || bundle.attempt.status === "reported") {
    return { error: "This screen can no longer be edited." };
  }
  const question = bundle.paper.voice.find((item) => item.id === questionId);
  if (!question) return { error: "That question is not on this paper." };

  const mime = String(mimeType || "audio/webm").split(";")[0];
  if (audioBase64 && !mime.startsWith("audio/")) return { error: "Send an audio recording." };

  let graded;
  try {
    graded = await gradeRecording({
      prompt: question.prompt,
      listensFor: question.listensFor,
      audioBase64,
      mimeType: mime,
      transcript: String(liveTranscript || "").trim(),
    });
  } catch (error) {
    return { error: error.message || "The recording could not be graded." };
  }

  const voiceAnswers = { ...bundle.voiceAnswers, [question.id]: graded };
  const db = await database();
  await db.update(attempts).set({ voiceAnswers: JSON.stringify(voiceAnswers) }).where(eq(attempts.id, bundle.attempt.id));
  return { error: "", saved: true };
}

export async function saveCommunicationAnswers(attemptId, answers) {
  const user = await getCurrentUser();
  const attempt = user?.role === "candidate" ? await editableAttempt(attemptId, user.id) : null;
  if (!attempt) return { error: "This screen can no longer be edited." };
  const db = await database();
  await db
    .update(attempts)
    .set({ communicationAnswers: JSON.stringify(answers || {}) })
    .where(eq(attempts.id, attempt.id));
  return { error: "" };
}

export async function finishAttempt(attemptId, communicationAnswers) {
  const user = await getCurrentUser();
  const bundle = await loadAttempt(attemptId, user);
  if (!bundle || user.role !== "candidate") return { error: "Sign in as the candidate who took this screen." };
  if (bundle.scorecard) redirect(`/candidate/reports/${bundle.attempt.id}`);

  const mcq = scoreMcq(bundle.paper, bundle.mcqAnswers);
  if (mcq.review.some((item) => item.chosen === null)) return { error: "Answer every skill question before submitting." };
  const voice = scoreVoice(bundle.paper, bundle.voiceAnswers);
  if (voice.review.some((item) => !item.transcript && !item.score)) return { error: "Record every spoken answer before submitting." };

  const written = bundle.paper.communication.map((question) => ({
    ...question,
    answer: String(communicationAnswers?.[question.id] || bundle.communicationAnswers?.[question.id] || "").trim(),
  }));
  if (written.some((question) => question.answer.length < 30)) {
    return { error: "Write a fuller answer for each communication question." };
  }

  const db = await database();
  await db
    .update(attempts)
    .set({
      communicationAnswers: JSON.stringify(Object.fromEntries(written.map((question) => [question.id, question.answer]))),
      status: "submitted",
      submittedAt: new Date().toISOString(),
    })
    .where(eq(attempts.id, bundle.attempt.id));

  let grades;
  let narrative;
  try {
    grades = await gradeWrittenAnswers({ job: bundle.job, questions: written });
    const communication = scoreCommunication(bundle.paper, communicationAnswers, grades);
    const scores = {
      mcq: mcq.score,
      voice: voice.score,
      communication: communication.score,
      overall: overallScore(mcq.score, voice.score, communication.score),
    };
    const recommendation = recommendationFor(scores);
    narrative = await explainScorecard({
      job: bundle.job,
      candidate: bundle.candidate,
      scores,
      recommendation,
    });
    await db.insert(scorecards).values({
      attemptId: bundle.attempt.id,
      mcqScore: scores.mcq,
      voiceScore: scores.voice,
      communicationScore: scores.communication,
      overallScore: scores.overall,
      recommendation,
      summary: narrative.summary,
      strengths: JSON.stringify(narrative.strengths),
      gaps: JSON.stringify(narrative.gaps),
      breakdown: JSON.stringify({
        skills: skillBreakdown(mcq.review),
        mcq: mcq.review,
        voice: voice.review,
        communication: communication.review,
      }),
      decision: "pending",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (!message.includes("duplicate") && !message.includes("23505")) {
      return { error: error.message || "The answers are saved, but the report could not be written." };
    }
  }

  await db.update(attempts).set({ status: "reported" }).where(eq(attempts.id, bundle.attempt.id));
  revalidatePath("/candidate");
  revalidatePath("/recruiter");
  revalidatePath(`/recruiter/jobs/${bundle.job.id}`);
  redirect(`/candidate/reports/${bundle.attempt.id}`);
}

export async function setDecision(prev, formData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "recruiter") return { error: "Only the hiring recruiter can decide." };
  const attemptId = asId(formData.get("attemptId"));
  const decision = String(formData.get("decision") || "");
  if (!["move_forward", "not_proceeding"].includes(decision)) return { error: "Choose whether they move forward." };

  const bundle = await loadAttempt(attemptId, user);
  if (!bundle?.scorecard) return { error: "The report is not ready." };
  const db = await database();
  await db.update(scorecards).set({ decision }).where(eq(scorecards.attemptId, bundle.attempt.id));
  revalidatePath(`/recruiter/reports/${bundle.attempt.id}`);
  revalidatePath(`/candidate/reports/${bundle.attempt.id}`);
  revalidatePath(`/recruiter/jobs/${bundle.job.id}`);
  return { error: "", saved: decision };
}

