import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { emoji } = await request.json()
    const userId = user._id?.toString()

    const { db } = await connectToDatabase()

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const existingReaction = event.reactions?.find((r: { userId: string }) => r.userId === userId)

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Remove reaction
        await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $pull: { reactions: { userId } } })
      } else {
        // Update reaction
        await db
          .collection("events")
          .updateOne({ _id: new ObjectId(id), "reactions.userId": userId }, { $set: { "reactions.$.emoji": emoji } })
      }
    } else {
      // Add reaction
      await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $push: { reactions: { userId, emoji } } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("React error:", error)
    return NextResponse.json({ error: "Failed to react" }, { status: 500 })
  }
}
