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
    const userId = user._id?.toString()
    const { db } = await connectToDatabase()

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const hasDisliked = event.dislikes?.includes(userId)
    const hasLiked = event.likes?.includes(userId)

    if (hasDisliked) {
      // Remove dislike
      await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $pull: { dislikes: userId } })
    } else {
      // Add dislike and remove like if exists
      const update: Record<string, unknown> = { $addToSet: { dislikes: userId } }
      if (hasLiked) {
        update.$pull = { likes: userId }
      }
      await db.collection("events").updateOne({ _id: new ObjectId(id) }, update)
    }

    return NextResponse.json({ success: true, disliked: !hasDisliked })
  } catch (error) {
    console.error("Dislike error:", error)
    return NextResponse.json({ error: "Failed to dislike event" }, { status: 500 })
  }
}
