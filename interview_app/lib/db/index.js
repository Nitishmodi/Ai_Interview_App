import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached;
let schemaReady;

function connect() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  cached = { sql, db: drizzle(sql, { schema }) };
  return cached;
}

async function createTables(sql) {
  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      full_name varchar(120) NOT NULL,
      email varchar(180) NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role varchar(20) NOT NULL,
      target_role varchar(160),
      experience_years varchar(20),
      skills text,
      created_at varchar(40) NOT NULL
    )`,
    sql`CREATE TABLE IF NOT EXISTS jobs (
      id serial PRIMARY KEY,
      recruiter_id integer NOT NULL,
      title varchar(160) NOT NULL,
      department varchar(120) NOT NULL,
      location varchar(120) NOT NULL,
      employment_type varchar(40) NOT NULL,
      experience_years varchar(40) NOT NULL,
      skills text NOT NULL,
      summary text,
      responsibilities text,
      requirements text,
      description text NOT NULL,
      status varchar(20) NOT NULL,
      created_at varchar(40) NOT NULL,
      updated_at varchar(40)
    )`,
    sql`CREATE TABLE IF NOT EXISTS attempts (
      id serial PRIMARY KEY,
      job_id integer NOT NULL,
      candidate_id integer NOT NULL,
      status varchar(30) NOT NULL,
      paper text NOT NULL,
      mcq_answers text,
      voice_answers text,
      communication_answers text,
      created_at varchar(40) NOT NULL,
      submitted_at varchar(40),
      UNIQUE (job_id, candidate_id)
    )`,
    sql`CREATE TABLE IF NOT EXISTS scorecards (
      id serial PRIMARY KEY,
      attempt_id integer NOT NULL UNIQUE,
      mcq_score integer NOT NULL,
      voice_score integer NOT NULL,
      communication_score integer NOT NULL,
      overall_score integer NOT NULL,
      recommendation varchar(40) NOT NULL,
      summary text NOT NULL,
      strengths text NOT NULL,
      gaps text NOT NULL,
      breakdown text NOT NULL,
      decision varchar(40) NOT NULL,
      created_at varchar(40) NOT NULL
    )`,
  ]);

  await Promise.all([
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS target_role varchar(160)`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years varchar(20)`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text`,
    sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at varchar(40)`,
    sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS summary text`,
    sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities text`,
    sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements text`,
    sql`CREATE INDEX IF NOT EXISTS jobs_recruiter_idx ON jobs (recruiter_id)`,
    sql`CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status)`,
    sql`CREATE INDEX IF NOT EXISTS attempts_candidate_idx ON attempts (candidate_id)`,
  ]);

  await sql`UPDATE jobs SET status = 'visible' WHERE status = 'open'`;
}

export async function database() {
  const { sql, db } = connect();
  if (!schemaReady) schemaReady = createTables(sql);
  await schemaReady;
  return db;
}
