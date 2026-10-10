import { createHmac, timingSafeEqual } from "crypto";

export const sessionCookie = {
  name: "ai_interview_session",
  options: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  },
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

export function signSession(userId) {
  const body = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let expected;
  try {
    expected = createHmac("sha256", secret()).update(body).digest("base64url");
  } catch {
    return null;
  }
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!payload?.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
