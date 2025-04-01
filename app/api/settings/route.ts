import { type NextRequest, NextResponse } from "next/server"
import { getSetting, updateSetting } from "@/lib/settings"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const adminPassword = searchParams.get("adminPassword")

    // If adminPassword is provided, verify it
    if (adminPassword && adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Invalid admin password." }, { status: 403 })
    }

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Get the setting value
    const value = await getSetting(key as any)

    // For sensitive settings, require admin authentication
    const sensitiveSettings = ["ADMIN_SETTINGS", "API_KEYS"] // Add any sensitive settings here
    if (sensitiveSettings.includes(key) && (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Unauthorized. Admin access required for this setting." }, { status: 403 })
    }

    return NextResponse.json({ key, value })
  } catch (error) {
    console.error("Error getting setting:", error)
    return NextResponse.json({ error: "Failed to get setting" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin password
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get("adminPassword")

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Get the request body
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    if (value === undefined) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 })
    }

    // Update the setting
    const success = await updateSetting(key as any, value)

    if (!success) {
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Setting updated successfully",
      key,
      value,
    })
  } catch (error) {
    console.error("Error updating setting:", error)
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
  }
}

