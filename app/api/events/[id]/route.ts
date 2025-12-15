import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      event: {
        ...event,
        _id: event._id.toString(),
        likesCount: event.likes?.length || 0,
        dislikesCount: event.dislikes?.length || 0,
        commentsCount: event.comments?.length || 0,
      },
    })
  } catch (error) {
    console.error("Get event error:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    await db.collection("events").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
