import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  targetRole: varchar("target_role", { length: 160 }),
  experienceYears: varchar("experience_years", { length: 20 }),
  skills: text("skills"),
  createdAt: varchar("created_at", { length: 40 }).notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  department: varchar("department", { length: 120 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  employmentType: varchar("employment_type", { length: 40 }).notNull(),
  experienceYears: varchar("experience_years", { length: 40 }).notNull(),
  skills: text("skills").notNull(),
  summary: text("summary"),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: varchar("created_at", { length: 40 }).notNull(),
  updatedAt: varchar("updated_at", { length: 40 }),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  paper: text("paper").notNull(),
  mcqAnswers: text("mcq_answers"),
  voiceAnswers: text("voice_answers"),
  communicationAnswers: text("communication_answers"),
  createdAt: varchar("created_at", { length: 40 }).notNull(),
  submittedAt: varchar("submitted_at", { length: 40 }),
});

export const scorecards = pgTable("scorecards", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  mcqScore: integer("mcq_score").notNull(),
  voiceScore: integer("voice_score").notNull(),
  communicationScore: integer("communication_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  recommendation: varchar("recommendation", { length: 40 }).notNull(),
  summary: text("summary").notNull(),
  strengths: text("strengths").notNull(),
  gaps: text("gaps").notNull(),
  breakdown: text("breakdown").notNull(),
  decision: varchar("decision", { length: 40 }).notNull(),
  createdAt: varchar("created_at", { length: 40 }).notNull(),
});
