import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { hashPassword, generateVerificationCode } from "@/lib/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email ? "Email already registered" : "Username already taken" },
        { status: 400 },
      )
    }

    const hashedPassword = await hashPassword(password)
    const verificationCode = generateVerificationCode()
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      username,
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send verification email
    await resend.emails.send({
      from: "CampusHub <onboarding@resend.dev>",
      to: email,
      subject: "Verify your CampusHub account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">Welcome to CampusHub!</h1>
          <p>Your verification code is:</p>
          <div style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 20px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 4px;">
            ${verificationCode}
          </div>
          <p style="color: #666; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
      message: "Verification code sent to your email",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
