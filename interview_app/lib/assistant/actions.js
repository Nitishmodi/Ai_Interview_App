"use server";

import { getCurrentUser } from "@/lib/current-user";
import { talk } from "@/lib/screening/gemini";
import { brand } from "@/lib/brand";

export async function askAssistant(message) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to use the assistant." };
  const text = String(message || "").trim();
  if (text.length < 2) return { error: "Ask something first." };
  if (text.length > 1200) return { error: "Keep the question shorter than 1200 characters." };

  const desk = user.role === "recruiter"
    ? `They hire. A role brief has a summary, the work, the requirements, skills, and years of experience. Visibility is draft, visible, or closed. A scorecard has skill, voice, and written sections, and the recruiter decides move forward or not proceeding. Do not invent scores, names, or features this product does not have.`
    : `They apply. Their profile is the role they want, their years, and their skills. Open roles are ordered from skill overlap, whether their years fit the range, and how close the title is. Applying starts the interview. Do not mention locations, availability, or a resume rank. Do not write answers to interview questions.`;

  try {
    const reply = await talk(`You are the assistant inside ${brand}, a hiring product.
${desk}
The person is ${user.fullName}, role ${user.role}.
Answer in plain sentences, under 120 words. No markdown headings.
Question: ${text}`);
    return { error: "", reply };
  } catch (error) {
    return { error: error.message || "The assistant could not reply." };
  }
}
