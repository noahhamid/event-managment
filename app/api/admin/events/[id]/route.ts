import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  return !!adminSession
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get usernames for likes and dislikes
    const userIds = [...(event.likes || []), ...(event.dislikes || [])].filter(Boolean)
    const users = await db
      .collection("users")
      .find({
        _id: { $in: userIds.map((id: string) => new ObjectId(id)) },
      })
      .toArray()

    const userMap = new Map(users.map((u) => [u._id.toString(), u.username]))

    return NextResponse.json({
      event: {
        ...event,
        _id: event._id.toString(),
        likesCount: event.likes?.length || 0,
        dislikesCount: event.dislikes?.length || 0,
        commentsCount: event.comments?.length || 0,
        likedBy: event.likes?.map((id: string) => userMap.get(id) || "Unknown") || [],
        dislikedBy: event.dislikes?.map((id: string) => userMap.get(id) || "Unknown") || [],
      },
    })
  } catch (error) {
    console.error("Admin get event error:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { title, description, imageUrl, date, category } = await request.json()

    if (date && new Date(date) < new Date()) {
      return NextResponse.json({ error: "Cannot set event date in the past" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (imageUrl) updateData.imageUrl = imageUrl
    if (date) updateData.date = new Date(date)
    if (category) updateData.category = category

    await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin update event error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    await db.collection("events").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete event error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
