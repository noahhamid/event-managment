import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getSession, hashPassword, verifyPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, currentPassword, newPassword, profilePicture } = await request.json()
    const { db } = await connectToDatabase()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    // Update username
    if (username && username !== user.username) {
      // Check if can change username (once every 3 weeks)
      if (user.lastUsernameChange) {
        const lastChange = new Date(user.lastUsernameChange)
        const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
        if (lastChange > threeWeeksAgo) {
          return NextResponse.json({ error: "You can only change your username once every 3 weeks" }, { status: 400 })
        }
      }

      // Check if username is taken
      const existingUser = await db.collection("users").findOne({ username, _id: { $ne: new ObjectId(user._id) } })
      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }

      updateData.username = username
      updateData.lastUsernameChange = new Date()
    }

    // Update password
    if (currentPassword && newPassword) {
      const isValid = await verifyPassword(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      updateData.password = await hashPassword(newPassword)
    }

    // Update profile picture
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture
    }

    await db.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
