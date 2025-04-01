import { NextResponse } from "next/server"
import { getAllSettings } from "@/lib/settings"

export async function GET() {
  try {
    const settings = await getAllSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error getting all settings:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}

