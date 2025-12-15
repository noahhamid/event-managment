import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (new Date() > new Date(user.verificationCodeExpiry)) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 })
    }

    // Update user as verified
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { emailVerified: true },
        $unset: { verificationCode: "", verificationCodeExpiry: "" },
      },
    )

    // Create session
    await createSession(userId)

    return NextResponse.json({ success: true, message: "Email verified successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
