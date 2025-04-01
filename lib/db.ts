import "server-only"
import { kv } from "@vercel/kv"
import { z } from "zod"

// Story page schema
export const StoryPageSchema = z.object({
  text: z.string(),
  imagePrompt: z.string(),
})

// Story content schema
export const StoryContentSchema = z.object({
  title: z.string(),
  pages: z.array(StoryPageSchema),
  moral: z.string().optional(),
})

// Story schema
export const StorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  prompt: z.string(),
  age: z.string(),
  status: z.enum(["generating", "generating_story", "generating_images", "complete", "failed"]),
  visibility: z.enum(["public", "unlisted"]).default("public"),
  storyContent: z.string().optional(), // This is a JSON string
  images: z.string().optional(), // This is a JSON string
  createdAt: z.string(),
  completedAt: z.string().optional(),
  deletionToken: z.string(),
  error: z.string().optional(),
})

export type Story = z.infer<typeof StorySchema>
export type StoryContent = z.infer<typeof StoryContentSchema>
export type StoryPage = z.infer<typeof StoryPageSchema>

// CRUD operations for stories

/**
 * Create a new story
 */
export async function createStory(storyData: Partial<Story>): Promise<Story> {
  if (!storyData.id) {
    console.error(`[DB] Error: Story ID is required`)
    throw new Error("Story ID is required")
  }

  // Ensure storyContent is a string if provided
  if (storyData.storyContent !== undefined) {
    if (typeof storyData.storyContent !== "string") {
      try {
        storyData.storyContent = JSON.stringify(storyData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        storyData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (storyData.images !== undefined) {
    if (typeof storyData.images !== "string") {
      try {
        storyData.images = JSON.stringify(storyData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        storyData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${storyData.id}`, storyData)

  return storyData as Story
}

/**
 * Get a story by ID
 */
export async function getStory(id: string): Promise<Story | null> {
  const storyData = await kv.hgetall(`story:${id}`)

  if (!storyData) {
    return null
  }

  // Clone the data to avoid modifying the original
  const processedData = { ...storyData }

  // Ensure data consistency before validation
  if (processedData.storyContent !== undefined && typeof processedData.storyContent !== "string") {
    try {
      processedData.storyContent = JSON.stringify(processedData.storyContent)
    } catch (e) {
      console.error(`[DB] Error stringifying storyContent:`, e)
      processedData.storyContent = "{}"
    }
  }

  if (processedData.images !== undefined && typeof processedData.images !== "string") {
    try {
      processedData.images = JSON.stringify(processedData.images)
    } catch (e) {
      console.error(`[DB] Error stringifying images:`, e)
      processedData.images = "[]"
    }
  }

  // Use safeParse instead of parse to avoid exceptions
  const result = StorySchema.safeParse(processedData)

  if (result.success) {
    // Return the validated data
    return result.data
  } else {
    // Log validation errors
    console.error(`[DB] Story validation failed:`, result.error)
    // Return the processed data as a fallback
    return processedData as Story
  }
}

/**
 * Update a story
 */
export async function updateStory(id: string, data: Partial<Story>): Promise<Story | null> {
  const storyExists = await kv.exists(`story:${id}`)

  if (!storyExists) {
    return null
  }

  // Create a copy of the data to avoid modifying the original
  const updatedData = { ...data }

  // Ensure storyContent is a string if provided
  if (updatedData.storyContent !== undefined) {
    if (typeof updatedData.storyContent !== "string") {
      try {
        updatedData.storyContent = JSON.stringify(updatedData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        // If stringification fails, set to empty object string
        updatedData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (updatedData.images !== undefined) {
    if (typeof updatedData.images !== "string") {
      try {
        updatedData.images = JSON.stringify(updatedData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        // If stringification fails, set to empty array string
        updatedData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${id}`, updatedData)

  return getStory(id)
}

/**
 * Delete a story
 */
export async function deleteStory(id: string): Promise<boolean> {
  const deleted = await kv.del(`story:${id}`)

  return deleted === 1
}

/**
 * List all stories
 */
export async function listStories(limit = 100): Promise<Story[]> {
  const storyKeys = await kv.keys("story:*")

  if (!storyKeys || storyKeys.length === 0) {
    return []
  }

  const stories = await Promise.all(
    storyKeys.slice(0, limit).map(async (key) => {
      const storyData = await kv.hgetall(key)

      if (!storyData) return null

      // Clone the data to avoid modifying the original
      const processedData = { ...storyData }

      // Ensure data consistency before validation
      if (processedData.storyContent !== undefined && typeof processedData.storyContent !== "string") {
        try {
          processedData.storyContent = JSON.stringify(processedData.storyContent)
        } catch (e) {
          console.error(`[DB] Error stringifying storyContent:`, e)
          processedData.storyContent = "{}"
        }
      }

      if (processedData.images !== undefined && typeof processedData.images !== "string") {
        try {
          processedData.images = JSON.stringify(processedData.images)
        } catch (e) {
          console.error(`[DB] Error stringifying images:`, e)
          processedData.images = "[]"
        }
      }

      // Use safeParse instead of assuming the data is valid
      const result = StorySchema.safeParse(processedData)

      if (result.success) {
        return result.data
      } else {
        console.error(`[DB] Story validation failed for ${key}:`, result.error)
        return processedData as Story
      }
    }),
  )

  //return stories.filter(Boolean)

  // 방법 1: 타입 서술어 사용
  //return stories.filter((story): story is Story => story !== null);

  // 방법 2: 더 간결한 방식으로 null 체크
  return stories.filter((story): story is Story => Boolean(story));

}

