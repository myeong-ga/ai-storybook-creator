import { type NextRequest, NextResponse } from "next/server"
import { listStories } from "@/lib/db"
import { checkAdminAuth } from "@/app/admin/actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeUnlisted = searchParams.get("includeUnlisted") === "true"

    // Check if admin auth is required for unlisted stories
    if (includeUnlisted) {
      const isAdmin = await checkAdminAuth()
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized. Admin access required to view unlisted stories." },
          { status: 403 },
        )
      }
    }

    // Get all stories
    const allStories = await listStories()

    if (!allStories || allStories.length === 0) {
      return NextResponse.json({ stories: [] })
    }

    // Process stories for the response
    const processedStories = allStories.map((story) => {
      // Remove sensitive data
      const { deletionToken, storyContent, images, ...safeStoryData } = story

      // Parse images with error handling
      let previewImage = null
      try {
        if (images) {
          const parsedImages = JSON.parse(images)
          previewImage = parsedImages[0] || null
        }
      } catch (error) {
        console.error(`Error parsing images for story ${story.id}:`, error)
      }

      return {
        ...safeStoryData,
        previewImage,
      }
    })

    // Filter out failed stories and unlisted stories (unless includeUnlisted is true)
    // Then sort by creation date (newest first)
    const sortedStories = processedStories
      .filter((story) => story.status !== "failed")
      .filter((story) => includeUnlisted || story.visibility !== "unlisted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ stories: sortedStories })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

