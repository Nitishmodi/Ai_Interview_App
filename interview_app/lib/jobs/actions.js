"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/current-user";
import { asId } from "@/lib/format";
import { composeDescription, linesOf } from "@/lib/jobs/brief";

const employmentTypes = ["Full-time", "Contract", "Intern"];

function readJob(formData) {
  const title = String(formData.get("title") || "").trim();
  const department = String(formData.get("department") || "").trim() || "General";
  const location = String(formData.get("location") || "").trim() || "Remote";
  const picked = String(formData.get("employmentType") || "");
  const employmentType = employmentTypes.includes(picked) ? picked : "Full-time";
  const experienceYears = String(formData.get("experienceYears") || "").trim();
  const skills = String(formData.get("skills") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const responsibilities = linesOf(formData.get("responsibilities"));
  const requirements = linesOf(formData.get("requirements"));
  const visibility = formData.get("visibility") === "visible" ? "visible" : "draft";

  if (title.length < 2) return { error: "Add a role title." };
  if (!experienceYears) return { error: "Add the experience level, such as 2-4 years." };
  if (skills.length < 2) return { error: "List the skills this role needs." };
  if (summary.length < 40) return { error: "Write a short brief for the role. A sentence or two is enough." };
  if (responsibilities.length < 2) return { error: "Add at least two things this person will do, one per line." };
  if (requirements.length < 2) return { error: "Add at least two things they should bring, one per line." };

  return {
    title,
    department,
    location,
    employmentType,
    experienceYears,
    skills,
    summary,
    responsibilities: responsibilities.join("\n"),
    requirements: requirements.join("\n"),
    description: composeDescription({ summary, responsibilities, requirements }),
    visibility,
  };
}

export async function saveJob(prev, formData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "recruiter") return { error: "Sign in as a recruiter to post a role." };
  const fields = readJob(formData);
  if (fields.error) return fields;

  const db = await database();
  const jobId = asId(formData.get("jobId"));
  const now = new Date().toISOString();

  if (jobId) {
    const [existing] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.recruiterId, user.id)));
    if (!existing) return { error: "That role is not yours." };
    await db
      .update(jobs)
      .set({
        title: fields.title,
        department: fields.department,
        location: fields.location,
        employmentType: fields.employmentType,
        experienceYears: fields.experienceYears,
        skills: fields.skills,
        summary: fields.summary,
        responsibilities: fields.responsibilities,
        requirements: fields.requirements,
        description: fields.description,
        status: fields.visibility,
        updatedAt: now,
      })
      .where(eq(jobs.id, jobId));
    revalidatePath("/recruiter/jobs");
    revalidatePath(`/recruiter/jobs/${jobId}`);
    redirect(`/recruiter/jobs/${jobId}`);
  }

  const [created] = await db
    .insert(jobs)
    .values({
      recruiterId: user.id,
      title: fields.title,
      department: fields.department,
      location: fields.location,
      employmentType: fields.employmentType,
      experienceYears: fields.experienceYears,
      skills: fields.skills,
      summary: fields.summary,
      responsibilities: fields.responsibilities,
      requirements: fields.requirements,
      description: fields.description,
      status: fields.visibility,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: jobs.id });

  revalidatePath("/recruiter");
  revalidatePath("/recruiter/jobs");
  redirect(`/recruiter/jobs/${created.id}`);
}

export async function setJobVisibility(prev, formData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "recruiter") return { error: "Only a recruiter can change visibility." };
  const jobId = asId(formData.get("jobId"));
  const status = String(formData.get("status") || "");
  if (!["draft", "visible", "closed"].includes(status)) return { error: "Choose draft, visible, or closed." };

  const db = await database();
  const [job] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.recruiterId, user.id)));
  if (!job) return { error: "That role is not yours." };
  await db.update(jobs).set({ status, updatedAt: new Date().toISOString() }).where(eq(jobs.id, jobId));
  revalidatePath("/recruiter/jobs");
  revalidatePath(`/recruiter/jobs/${jobId}`);
  revalidatePath("/candidate/jobs");
  return { error: "", saved: status };
}
