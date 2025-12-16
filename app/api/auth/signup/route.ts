import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { hashPassword, generateVerificationCode } from "@/lib/auth"
import { Resend } from "resend"
import { ObjectId } from "mongodb" // Import ObjectId for use in updateOne

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

        // --- 1. Enhanced Check for Existing User ---
        const existingUser = await db.collection("users").findOne({
            $or: [{ email }, { username }],
        })

        const hashedPassword = await hashPassword(password)
        const verificationCode = generateVerificationCode()
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        let insertId: ObjectId | null = null; // Variable to store the resulting user ID

        if (existingUser) {
            if (existingUser.emailVerified) {
                // Case 1: User is already verified. This is a legitimate attempt to re-register.
                return NextResponse.json(
                    { error: existingUser.email === email ? "Email already registered" : "Username already taken" },
                    { status: 400 },
                )
            }

            // Case 2: User exists but is UNVERIFIED (the logical bug scenario).
            // We allow the user to resubmit, update their record with new credentials/code, and resend the email.

            // Optional: Block if they are trying to use an unverified email's username for a different email
            if (existingUser.username === username && existingUser.email !== email) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 400 }
                )
            }

            // Update the existing, unverified user's record
            await db.collection("users").updateOne(
                { _id: existingUser._id },
                {
                    $set: {
                        password: hashedPassword,
                        username: username, // allow updating username if the email is the same
                        verificationCode: verificationCode,
                        verificationCodeExpiry: verificationCodeExpiry,
                        updatedAt: new Date(),
                    }
                }
            )

            insertId = existingUser._id; // Use the existing user's ID
        } else {
            // Case 3: User is completely new. Insert them into the database.
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
            insertId = result.insertedId
        }

        // --- 2. Send Verification Email ---
        // This is done after either inserting or updating the user record.
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

        // --- 3. Return Success Response ---
        return NextResponse.json({
            success: true,
            userId: insertId!.toString(), // We are guaranteed to have an ID at this point
            message: "Verification code sent to your email",
        })
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}