import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Check if it's an admin API route (except for check-auth)
  if (pathname.startsWith("/api/admin") && !pathname.includes("/check-auth")) {
    // Get the admin session cookie
    const adminSession = request.cookies.get("admin_session")

    // If no admin session, return 401 Unauthorized
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on admin API routes
export const config = {
  matcher: ["/api/admin/:path*"],
}

