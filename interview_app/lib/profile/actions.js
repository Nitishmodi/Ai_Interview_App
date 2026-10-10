"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/current-user";
import { splitSkills } from "@/lib/format";
import { checkPassword, hashPassword } from "@/lib/passwords";

function cleanEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

export async function saveAccount(prev, formData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." };

  const fullName = String(formData.get("fullName") || "").trim();
  const email = cleanEmail(formData.get("email"));
  if (fullName.length < 2) return { error: "Add your name." };
  if (!email) return { error: "That email does not look right." };

  const db = await database();
  const [existing] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id));
  if (!existing) return { error: "Sign in again." };

  const nextPassword = String(formData.get("nextPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const patch = { fullName, email };

  if (nextPassword || confirmPassword) {
    if (nextPassword.length < 8) return { error: "Use at least 8 characters for the new password." };
    if (nextPassword !== confirmPassword) return { error: "The new passwords do not match." };
    const currentPassword = String(formData.get("currentPassword") || "");
    if (!checkPassword(currentPassword, existing.passwordHash)) return { error: "The current password is wrong." };
    patch.passwordHash = hashPassword(nextPassword);
  }

  if (user.role === "candidate") {
    const targetRole = String(formData.get("targetRole") || "").trim();
    const experienceYears = String(formData.get("experienceYears") || "").trim();
    const skills = String(formData.get("skills") || "").trim();
    if (targetRole.length < 2) return { error: "Add the kind of role you want." };
    if (!experienceYears) return { error: "Add your years of experience." };
    if (!splitSkills(skills).length) return { error: "Add at least one skill." };
    patch.targetRole = targetRole;
    patch.experienceYears = experienceYears;
    patch.skills = skills;
  }

  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (taken && taken.id !== user.id) return { error: "That email is already registered." };

  try {
    await db.update(users).set(patch).where(eq(users.id, user.id));
  } catch (error) {
    const message = `${error?.message || ""} ${error?.code || ""}`;
    if (message.includes("duplicate") || message.includes("23505")) return { error: "That email is already registered." };
    return { error: "The profile could not be saved. Try again." };
  }

  const root = user.role === "recruiter" ? "/recruiter" : "/candidate";
  revalidatePath(root, "layout");
  return { error: "", saved: true };
}
