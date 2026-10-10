import { cache } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
import { database } from "@/lib/db";
import { attempts, jobs, scorecards, users } from "@/lib/db/schema";
import { asId, parseJson } from "@/lib/format";
import { matchJob } from "@/lib/jobs/match";

const jobListColumns = {
  id: jobs.id,
  title: jobs.title,
  department: jobs.department,
  location: jobs.location,
  employmentType: jobs.employmentType,
  experienceYears: jobs.experienceYears,
  skills: jobs.skills,
  summary: jobs.summary,
  status: jobs.status,
  preview: sql`left(coalesce(${jobs.summary}, ${jobs.description}, ''), 180)`.as("preview"),
};

export async function listRecruiterJobs(recruiterId) {
  const db = await database();
  const posts = await db.select(jobListColumns).from(jobs).where(eq(jobs.recruiterId, recruiterId)).orderBy(desc(jobs.id));
  const screens = await db
    .select({
      jobId: attempts.jobId,
      attemptCount: sql`count(*)::int`,
      reportCount: sql`count(*) filter (where ${attempts.status} = 'reported')::int`,
    })
    .from(attempts)
    .innerJoin(jobs, eq(jobs.id, attempts.jobId))
    .where(eq(jobs.recruiterId, recruiterId))
    .groupBy(attempts.jobId);
  const counts = new Map(screens.map((screen) => [screen.jobId, {
    attemptCount: Number(screen.attemptCount),
    reportCount: Number(screen.reportCount),
  }]));
  return posts.map((job) => ({ ...job, ...(counts.get(job.id) || { attemptCount: 0, reportCount: 0 }) }));
}

export async function countVisibleJobs(recruiterId) {
  const db = await database();
  const [row] = await db
    .select({ total: sql`count(*)::int` })
    .from(jobs)
    .where(and(eq(jobs.recruiterId, recruiterId), eq(jobs.status, "visible")));
  return Number(row?.total || 0);
}

export const getRecruiterJob = cache(async function getRecruiterJob(jobId, recruiterId) {
  const id = asId(jobId);
  if (!id) return null;
  const db = await database();
  const [job] = await db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.recruiterId, recruiterId)));
  return job || null;
});

export async function listJobAttempts(jobId) {
  const db = await database();
  const rows = await db
    .select({
      id: attempts.id,
      status: attempts.status,
      createdAt: attempts.createdAt,
      submittedAt: attempts.submittedAt,
      candidateName: users.fullName,
      candidateEmail: users.email,
      overallScore: scorecards.overallScore,
      recommendation: scorecards.recommendation,
      decision: scorecards.decision,
    })
    .from(attempts)
    .innerJoin(users, eq(users.id, attempts.candidateId))
    .leftJoin(scorecards, eq(scorecards.attemptId, attempts.id))
    .where(eq(attempts.jobId, jobId))
    .orderBy(desc(attempts.id));
  return rows;
}

export async function listVisibleJobs() {
  const db = await database();
  return db.select(jobListColumns).from(jobs).where(eq(jobs.status, "visible")).orderBy(desc(jobs.id));
}

export async function jobsForCandidate(candidate) {
  const openJobs = await listVisibleJobs();
  return openJobs
    .map((job) => ({ job, match: matchJob(candidate, job) }))
    .sort((left, right) => right.match.score - left.match.score);
}

export const getJob = cache(async function getJob(jobId) {
  const id = asId(jobId);
  if (!id) return null;
  const db = await database();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  return job || null;
});

export async function findAttempt(jobId, candidateId) {
  const db = await database();
  const [row] = await db
    .select({ id: attempts.id, status: attempts.status })
    .from(attempts)
    .where(and(eq(attempts.jobId, jobId), eq(attempts.candidateId, candidateId)));
  return row || null;
}

export async function candidateAttempts(candidateId) {
  const db = await database();
  return db
    .select({
      id: attempts.id,
      status: attempts.status,
      createdAt: attempts.createdAt,
      jobId: jobs.id,
      title: jobs.title,
      location: jobs.location,
      overallScore: scorecards.overallScore,
      recommendation: scorecards.recommendation,
      decision: scorecards.decision,
    })
    .from(attempts)
    .innerJoin(jobs, eq(jobs.id, attempts.jobId))
    .leftJoin(scorecards, eq(scorecards.attemptId, attempts.id))
    .where(eq(attempts.candidateId, candidateId))
    .orderBy(desc(attempts.id));
}

export async function recruiterInbox(recruiterId) {
  const db = await database();
  return db
    .select({
      id: attempts.id,
      status: attempts.status,
      createdAt: attempts.createdAt,
      title: jobs.title,
      candidateName: users.fullName,
      overallScore: scorecards.overallScore,
      recommendation: scorecards.recommendation,
      decision: scorecards.decision,
    })
    .from(attempts)
    .innerJoin(jobs, eq(jobs.id, attempts.jobId))
    .innerJoin(users, eq(users.id, attempts.candidateId))
    .leftJoin(scorecards, eq(scorecards.attemptId, attempts.id))
    .where(eq(jobs.recruiterId, recruiterId))
    .orderBy(desc(attempts.id));
}

export async function editableAttempt(attemptId, userId) {
  const id = asId(attemptId);
  if (!id || !userId) return null;
  const db = await database();
  const [row] = await db
    .select({ id: attempts.id, status: attempts.status, candidateId: attempts.candidateId })
    .from(attempts)
    .where(eq(attempts.id, id));
  if (!row || row.candidateId !== userId || row.status === "reported") return null;
  return row;
}

export async function loadAttempt(attemptId, user) {
  const id = asId(attemptId);
  if (!id || !user) return null;
  const db = await database();
  const [row] = await db
    .select({
      attempt: attempts,
      job: jobs,
      candidateId: users.id,
      fullName: users.fullName,
      email: users.email,
      targetRole: users.targetRole,
      candidateExperience: users.experienceYears,
      candidateSkills: users.skills,
      scorecard: scorecards,
    })
    .from(attempts)
    .innerJoin(jobs, eq(jobs.id, attempts.jobId))
    .innerJoin(users, eq(users.id, attempts.candidateId))
    .leftJoin(scorecards, eq(scorecards.attemptId, attempts.id))
    .where(eq(attempts.id, id));
  if (!row) return null;
  const { attempt, job } = row;
  const allowed = user.role === "candidate" ? attempt.candidateId === user.id : job.recruiterId === user.id;
  if (!allowed) return null;
  const scorecard = row.scorecard?.id ? row.scorecard : null;
  return {
    attempt,
    job,
    candidate: {
      id: row.candidateId,
      fullName: row.fullName,
      email: row.email,
      targetRole: row.targetRole,
      experienceYears: row.candidateExperience,
      skills: row.candidateSkills,
    },
    paper: parseJson(attempt.paper, { mcq: [], voice: [], communication: [] }),
    mcqAnswers: parseJson(attempt.mcqAnswers, {}),
    voiceAnswers: parseJson(attempt.voiceAnswers, {}),
    communicationAnswers: parseJson(attempt.communicationAnswers, {}),
    scorecard: scorecard
      ? { ...scorecard, strengths: parseJson(scorecard.strengths, []), gaps: parseJson(scorecard.gaps, []), breakdown: parseJson(scorecard.breakdown, {}) }
      : null,
  };
}
