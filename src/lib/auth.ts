import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

const COOKIE_NAME = "adu99_admin_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-development-must-be-changed-in-production-random-key-32"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

import { redirect } from "next/navigation";

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email) return null;

    // Verify user still exists in database and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, email: true, name: true, role: true },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireAdminApi(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
    throw new Error("UNAUTHORIZED_ADMIN_ACCESS");
  }
  return user;
}
