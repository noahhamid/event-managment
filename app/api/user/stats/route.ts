import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user._id?.toString()
    const { db } = await connectToDatabase()

    // Get all events where user has interacted
    const events = await db
      .collection("events")
      .find({
        $or: [{ likes: userId }, { dislikes: userId }, { "comments.userId": userId }],
      })
      .toArray()

    let likesGiven = 0
    let dislikesGiven = 0
    let commentsCount = 0
    const recentActivity: { id: string; type: string; eventTitle: string; createdAt: Date }[] = []

    events.forEach((event) => {
      if (event.likes?.includes(userId)) {
        likesGiven++
        recentActivity.push({
          id: event._id.toString(),
          type: "like",
          eventTitle: event.title,
          createdAt: event.updatedAt,
        })
      }
      if (event.dislikes?.includes(userId)) {
        dislikesGiven++
        recentActivity.push({
          id: event._id.toString(),
          type: "dislike",
          eventTitle: event.title,
          createdAt: event.updatedAt,
        })
      }
      const userComments = event.comments?.filter((c: { userId: string }) => c.userId === userId) || []
      commentsCount += userComments.length
      userComments.forEach((comment: { createdAt: Date }) => {
        recentActivity.push({
          id: event._id.toString(),
          type: "comment",
          eventTitle: event.title,
          createdAt: comment.createdAt,
        })
      })
    })

    // Sort by date and take latest 10
    recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      stats: {
        likesGiven,
        dislikesGiven,
        commentsCount,
        eventsInteracted: events.length,
        recentActivity: recentActivity.slice(0, 10),
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
