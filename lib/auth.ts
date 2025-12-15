import { cookies } from "next/headers"
import { connectToDatabase } from "./db"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"
import type { User } from "./types"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createSession(userId: string): Promise<string> {
  const { db } = await connectToDatabase()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.collection("sessions").insertOne({
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  })

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  const { db } = await connectToDatabase()
  const session = await db.collection("sessions").findOne({
    token: sessionToken,
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  const user = await db.collection<User>("users").findOne({
    _id: new ObjectId(session.userId),
  })

  return user
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (sessionToken) {
    const { db } = await connectToDatabase()
    await db.collection("sessions").deleteOne({ token: sessionToken })
  }

  cookieStore.delete("session")
}
