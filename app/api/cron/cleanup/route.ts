import { NextResponse } from "next/server"
import { listStories, deleteStory } from "@/lib/db"

// Function to check if a story is stale/timed out
function isStoryTimedOut(story: any): boolean {
  // Consider a story timed out if:
  // 1. It's in a generating state (not complete or failed)
  // 2. It was created more than 24 hours ago
  const TIMEOUT_HOURS = 24

  if (story.status === "complete" || story.status === "failed") {
    return false
  }

  const createdAt = new Date(story.createdAt)
  const now = new Date()
  const hoursDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  return hoursDifference > TIMEOUT_HOURS
}

export async function GET(request: Request) {
  try {
    // Verify the cron secret to ensure this is a legitimate cron job
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get("cronSecret")

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.error("[CRON] Unauthorized access attempt to cleanup cron job")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON] Starting cleanup of timed out stories")

    // Get all stories
    const stories = await listStories()

    if (!stories || stories.length === 0) {
      console.log("[CRON] No stories found to clean up")
      return NextResponse.json({ message: "No stories to clean up" })
    }

    // Filter out timed out stories
    const timedOutStories = stories.filter(isStoryTimedOut)

    if (timedOutStories.length === 0) {
      console.log("[CRON] No timed out stories found")
      return NextResponse.json({ message: "No timed out stories found" })
    }

    console.log(`[CRON] Found ${timedOutStories.length} timed out stories to clean up`)

    // Delete each timed out story
    const results = []
    for (const story of timedOutStories) {
      try {
        await deleteStory(story.id)
        results.push({
          id: story.id,
          title: story.title,
          status: story.status,
          createdAt: story.createdAt,
          result: "deleted",
        })
        console.log(`[CRON] Deleted timed out story: ${story.id} - ${story.title}`)
      } catch (error) {
        console.error(`[CRON] Error deleting story ${story.id}:`, error)
        results.push({
          id: story.id,
          title: story.title,
          status: story.status,
          createdAt: story.createdAt,
          result: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Cleaned up ${results.filter((r) => r.result === "deleted").length} timed out stories`,
      totalProcessed: timedOutStories.length,
      results,
    })
  } catch (error) {
    console.error("[CRON] Error in cleanup cron job:", error)
    return NextResponse.json(
      {
        error: "Failed to clean up timed out stories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

