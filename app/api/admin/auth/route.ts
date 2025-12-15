import { NextResponse } from "next/server";
import crypto from "crypto";

// POST: login with admin password
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const res = NextResponse.json({ success: true });

    // Set httpOnly cookie
    res.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

// GET: check if admin is authenticated
export async function GET(request: Request) {
  const token = request.cookies.get("admin_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

// DELETE: logout admin
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_session", { path: "/" });
  return res;
}
