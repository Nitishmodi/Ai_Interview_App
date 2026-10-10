"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { homeFor, splitSkills } from "@/lib/format";
import { checkPassword, hashPassword } from "@/lib/passwords";
import { sessionCookie, signSession } from "@/lib/session";

function cleanEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function duplicateEmail(error) {
  const message = `${error?.message || ""} ${error?.cause?.message || ""} ${error?.code || ""} ${error?.cause?.code || ""}`;
  return message.includes("duplicate") || message.includes("23505");
}

export async function signUp(prev, formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const role = String(formData.get("role") || "");

  if (fullName.length < 2) return { error: "Add your name." };
  if (!email) return { error: "That email does not look right." };
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  if (role !== "recruiter" && role !== "candidate") {
    return { error: "Choose a candidate or recruiter profile." };
  }

  let targetRole = null;
  let experienceYears = null;
  let skills = null;
  if (role === "candidate") {
    targetRole = String(formData.get("targetRole") || "").trim();
    experienceYears = String(formData.get("experienceYears") || "").trim();
    skills = String(formData.get("skills") || "").trim();
    if (targetRole.length < 2) return { error: "Add the kind of role you want." };
    if (!experienceYears) return { error: "Add your years of experience." };
    if (!splitSkills(skills).length) return { error: "Add the skills you want to be matched on." };
  }

  const db = await database();
  let created;
  try {
    [created] = await db
      .insert(users)
      .values({
        fullName,
        email,
        passwordHash: hashPassword(password),
        role,
        targetRole,
        experienceYears,
        skills,
        createdAt: new Date().toISOString(),
      })
      .returning({ id: users.id });
  } catch (error) {
    if (duplicateEmail(error)) return { error: "That email is already registered." };
    return { error: "The account could not be created. Try again." };
  }

  cookies().set(sessionCookie.name, signSession(created.id), sessionCookie.options);
  redirect(homeFor(role));
}

export async function signIn(prev, formData) {
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  const db = await database();
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash, role: users.role })
    .from(users)
    .where(eq(users.email, email));

  if (!user || !checkPassword(password, user.passwordHash)) {
    return { error: "Email or password is wrong." };
  }

  cookies().set(sessionCookie.name, signSession(user.id), sessionCookie.options);
  redirect(homeFor(user.role));
}

export async function signOut() {
  cookies().delete(sessionCookie.name);
  redirect("/");
}
