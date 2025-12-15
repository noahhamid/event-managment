import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "latest"
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const { db } = await connectToDatabase()

    const query: Record<string, unknown> = {
      date: { $gte: new Date() },
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 }

    if (sort === "earliest") {
      sortOption = { date: 1 }
    } else if (sort === "latest") {
      sortOption = { date: -1 }
    } else if (sort === "popular") {
      sortOption = { likes: -1 }
    }

    const events = await db.collection("events").find(query).sort(sortOption).toArray()

    // Add likes count for sorting
    const eventsWithCounts = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      likesCount: event.likes?.length || 0,
      dislikesCount: event.dislikes?.length || 0,
      commentsCount: event.comments?.length || 0,
    }))

    // Sort by popularity if needed
    if (sort === "popular") {
      eventsWithCounts.sort((a, b) => b.likesCount - a.likesCount)
    }

    return NextResponse.json({ events: eventsWithCounts })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
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
      createdBy: user._id?.toString(),
      likes: [],
      dislikes: [],
      comments: [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, eventId: result.insertedId.toString() })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
