"use server"

import { getDatabase } from "@/lib/mongodb"
import { getUserSession } from "@/lib/auth-utils"
import { ObjectId } from "mongodb"
import { revalidatePath, revalidateTag } from "next/cache"
import { unstable_cache } from "next/cache"

const getCachedEvents = unstable_cache(
  async (filter?: string, sort = "latest") => {
    const db = await getDatabase()
    const events = db.collection("events")

    let query = {}
    if (filter && filter !== "all") {
      query = { category: filter }
    }

    let sortOption: any = { createdAt: -1 }

    if (sort === "oldest") {
      sortOption = { createdAt: 1 }
    } else if (sort === "popular") {
      sortOption = { likesCount: -1, createdAt: -1 }
    }

    const eventList = await events.find(query).sort(sortOption).toArray()

    return eventList.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }))
  },
  ["events-list"],
  { revalidate: 60, tags: ["events"] },
)

export async function getEvents(filter?: string, sort = "latest") {
  try {
    const eventList = await getCachedEvents(filter, sort)
    return {
      success: true,
      events: eventList,
    }
  } catch (error) {
    console.error("Get events error:", error)
    return { error: "Failed to fetch events" }
  }
}

export async function trackEventView(eventId: string) {
  try {
    const db = await getDatabase()
    const events = db.collection("events")

    await events.updateOne({ _id: new ObjectId(eventId) }, { $inc: { views: 1 } })
  } catch (error) {
    console.error("Track view error:", error)
  }
}

export async function likeEvent(eventId: string) {
  try {
    const session = await getUserSession()
    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const events = db.collection("events")
    const users = db.collection("users")

    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) {
      return { error: "Event not found" }
    }

    const hasLiked = event.likes?.includes(session.userId)
    const hasDisliked = event.dislikes?.includes(session.userId)

    if (hasLiked) {
      await Promise.all([
        events.updateOne(
          { _id: new ObjectId(eventId) },
          { $pull: { likes: session.userId }, $inc: { likesCount: -1 } },
        ),
        users.updateOne({ _id: new ObjectId(session.userId) }, { $pull: { likedPosts: eventId } }),
      ])
    } else {
      await Promise.all([
        events.updateOne(
          { _id: new ObjectId(eventId) },
          {
            $addToSet: { likes: session.userId },
            $pull: { dislikes: session.userId },
            $inc: { likesCount: 1, dislikesCount: -1 },
          },
        ),
        users.updateOne(
          { _id: new ObjectId(session.userId) },
          {
            $addToSet: { likedPosts: eventId },
            $pull: { dislikedPosts: eventId },
          },
        ),
      ])
    }

    revalidateTag("events")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Like event error:", error)
    return { error: "Failed to like event" }
  }
}

export async function dislikeEvent(eventId: string) {
  try {
    const session = await getUserSession()
    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const events = db.collection("events")
    const users = db.collection("users")

    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) {
      return { error: "Event not found" }
    }

    const hasDisliked = event.dislikes?.includes(session.userId)
    const hasLiked = event.likes?.includes(session.userId)

    if (hasDisliked) {
      await Promise.all([
        events.updateOne(
          { _id: new ObjectId(eventId) },
          { $pull: { dislikes: session.userId }, $inc: { dislikesCount: -1 } },
        ),
        users.updateOne({ _id: new ObjectId(session.userId) }, { $pull: { dislikedPosts: eventId } }),
      ])
    } else {
      await Promise.all([
        events.updateOne(
          { _id: new ObjectId(eventId) },
          {
            $addToSet: { dislikes: session.userId },
            $pull: { likes: session.userId },
            $inc: { dislikesCount: 1, likesCount: -1 },
          },
        ),
        users.updateOne(
          { _id: new ObjectId(session.userId) },
          {
            $addToSet: { dislikedPosts: eventId },
            $pull: { likedPosts: eventId },
          },
        ),
      ])
    }

    revalidateTag("events")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Dislike event error:", error)
    return { error: "Failed to dislike event" }
  }
}

export async function addComment(eventId: string, text: string) {
  try {
    const session = await getUserSession()
    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    const comment = {
      _id: new ObjectId().toString(),
      userId: session.userId,
      username: session.username,
      text,
      createdAt: new Date(),
    }

    await events.updateOne({ _id: new ObjectId(eventId) }, { $push: { comments: comment }, $inc: { commentsCount: 1 } })

    revalidateTag("events")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Add comment error:", error)
    return { error: "Failed to add comment" }
  }
}

export async function addReaction(eventId: string, emoji: string) {
  try {
    const session = await getUserSession()
    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    await events.updateOne(
      { _id: new ObjectId(eventId) },
      {
        $pull: { reactions: { userId: session.userId } },
        $push: { reactions: { userId: session.userId, emoji } },
      },
    )

    revalidateTag("events")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Add reaction error:", error)
    return { error: "Failed to add reaction" }
  }
}
