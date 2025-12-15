import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { cookies } from "next/headers"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  return !!adminSession
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const events = await db.collection("events").find({}).sort({ createdAt: -1 }).toArray()

    const eventsWithStats = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      likesCount: event.likes?.length || 0,
      dislikesCount: event.dislikes?.length || 0,
      commentsCount: event.comments?.length || 0,
      reactionsCount: event.reactions?.length || 0,
    }))

    // Calculate totals
    const totals = {
      totalEvents: events.length,
      totalLikes: eventsWithStats.reduce((sum, e) => sum + e.likesCount, 0),
      totalDislikes: eventsWithStats.reduce((sum, e) => sum + e.dislikesCount, 0),
      totalComments: eventsWithStats.reduce((sum, e) => sum + e.commentsCount, 0),
    }

    return NextResponse.json({ events: eventsWithStats, totals })
  } catch (error) {
    console.error("Admin get events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, imageUrl, date, category } = await request.json()

    if (!title || !description || !date || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const eventDate = new Date(date)
    if (eventDate < new Date()) {
      return NextResponse.json({ error: "Cannot create events in the past" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("events").insertOne({
      title,
      description,
      imageUrl: imageUrl || "/vibrant-campus-event.png",
      date: eventDate,
      category,
      createdBy: "admin",
      likes: [],
      dislikes: [],
      comments: [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, eventId: result.insertedId.toString() })
  } catch (error) {
    console.error("Admin create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
