import { NextResponse } from "next/server"
import { checkAdminAuth } from "@/app/admin/actions"

export async function GET() {
  try {
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Error checking admin authentication:", error)
    return NextResponse.json({ error: "Failed to check authentication" }, { status: 500 })
  }
}

