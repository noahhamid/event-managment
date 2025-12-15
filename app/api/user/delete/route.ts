import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getSession, destroySession, verifyPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Verify password before deletion
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const userId = user._id?.toString()

    // Remove user's interactions from events
    await db.collection("events").updateMany(
      {},
      {
        $pull: {
          likes: userId,
          dislikes: userId,
          comments: { userId },
          reactions: { userId },
        },
      },
    )

    // Delete user sessions
    await db.collection("sessions").deleteMany({ userId })

    // Delete user
    await db.collection("users").deleteOne({ _id: new ObjectId(user._id) })

    await destroySession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
