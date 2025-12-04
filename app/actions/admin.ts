"use server"

import { getDatabase } from "@/lib/mongodb"
import { setAdminSession, getAdminSession } from "@/lib/auth-utils"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

export async function adminLogin(password: string) {
  try {
    if (password === process.env.ADMIN_PASSWORD) {
      await setAdminSession()
      return { success: true }
    }

    return { error: "Invalid password" }
  } catch (error) {
    console.error("Admin login error:", error)
    return { error: "Failed to login" }
  }
}

export async function createEvent(formData: FormData) {
  try {
    const isAdmin = await getAdminSession()
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    const event = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      location: (formData.get("location") as string) || undefined,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      createdBy: "Admin",
      createdAt: new Date(),
      likes: [],
      dislikes: [],
      comments: [],
      reactions: [],
    }

    await events.insertOne(event)
    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Create event error:", error)
    return { error: "Failed to create event" }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const isAdmin = await getAdminSession()
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      location: (formData.get("location") as string) || undefined,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
    }

    await events.updateOne({ _id: new ObjectId(eventId) }, { $set: updates })

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Update event error:", error)
    return { error: "Failed to update event" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const isAdmin = await getAdminSession()
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    await events.deleteOne({ _id: new ObjectId(eventId) })

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Delete event error:", error)
    return { error: "Failed to delete event" }
  }
}

export async function getEventDetails(eventId: string) {
  try {
    const isAdmin = await getAdminSession()
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    const db = await getDatabase()
    const events = db.collection("events")
    const users = db.collection("users")

    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) {
      return { error: "Event not found" }
    }

    // Batch fetch all users at once instead of separate queries
    const allUserIds = [
      ...(event.likes?.map((id: string) => new ObjectId(id)) || []),
      ...(event.dislikes?.map((id: string) => new ObjectId(id)) || []),
    ]

    const users_list = await users
      .find({ _id: { $in: allUserIds } })
      .project({ _id: 1, username: 1 })
      .toArray()

    const userMap = new Map(users_list.map((u) => [u._id.toString(), u.username]))

    return {
      success: true,
      event: {
        ...event,
        _id: event._id.toString(),
        likedBy: (event.likes || []).map((id: string) => ({ id, username: userMap.get(id) || "Unknown" })),
        dislikedBy: (event.dislikes || []).map((id: string) => ({ id, username: userMap.get(id) || "Unknown" })),
      },
    }
  } catch (error) {
    console.error("Get event details error:", error)
    return { error: "Failed to fetch event details" }
  }
}

export async function getAllEventsForAdmin() {
  try {
    const isAdmin = await getAdminSession()
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    const db = await getDatabase()
    const events = db.collection("events")

    const eventList = await events.find({}).sort({ createdAt: -1 }).toArray()

    return {
      success: true,
      events: eventList.map((event) => ({
        ...event,
        _id: event._id.toString(),
        likesCount: event.likes?.length || 0,
        dislikesCount: event.dislikes?.length || 0,
        commentsCount: event.comments?.length || 0,
        reactionsCount: event.reactions?.length || 0,
      })),
    }
  } catch (error) {
    console.error("Get all events error:", error)
    return { error: "Failed to fetch events" }
  }
}
