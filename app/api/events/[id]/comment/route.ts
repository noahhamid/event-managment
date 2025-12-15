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
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const comment = {
      _id: new ObjectId(),
      userId: user._id?.toString(),
      username: user.username,
      content: content.trim(),
      createdAt: new Date(),
    }

    await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $push: { comments: comment } })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
