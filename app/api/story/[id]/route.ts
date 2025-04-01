import { type NextRequest, NextResponse } from "next/server"
import { getStory, deleteStory } from "@/lib/db"

export async function GET(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  const params = await _params
  try {
    const storyId = params.id

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 })
    }

    // Get story data from KV
    const storyData = await getStory(storyId)

    if (!storyData) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Remove the deletion token from the response
    const { deletionToken, ...safeStoryData } = storyData

    return NextResponse.json(safeStoryData)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storyId = params.id
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get("adminPassword")

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 })
    }

    // Verify admin password
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Get story data from KV
    const storyData = await getStory(storyId)

    if (!storyData) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Delete the story
    await deleteStory(storyId)

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}

