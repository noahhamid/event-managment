import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ error: "Sign out failed" }, { status: 500 })
  }
}
