import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function setUserSession(userId: string, username: string) {
  const cookieStore = await cookies()
  cookieStore.set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  cookieStore.set("username", username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getUserSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  const username = cookieStore.get("username")?.value

  if (!userId || !username) {
    return null
  }

  return { userId, username }
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  cookieStore.delete("username")
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set("isAdmin", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
  })
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get("isAdmin")?.value === "true"
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete("isAdmin")
}
