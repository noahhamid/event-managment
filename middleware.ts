import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    const userId = request.cookies.get("userId")

    if (!userId) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const isAdmin = request.cookies.get("isAdmin")

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
}
