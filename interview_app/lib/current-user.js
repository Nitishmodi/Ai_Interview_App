import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { readSession, sessionCookie } from "@/lib/session";

export const getCurrentUser = cache(async function getCurrentUser() {
  const token = cookies().get(sessionCookie.name)?.value;
  const session = token ? readSession(token) : null;
  if (!session) return null;

  const db = await database();
  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      targetRole: users.targetRole,
      experienceYears: users.experienceYears,
      skills: users.skills,
    })
    .from(users)
    .where(eq(users.id, session.userId));

  return user || null;
});
