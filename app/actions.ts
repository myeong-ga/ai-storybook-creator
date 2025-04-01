"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { createStory, updateStory } from "@/lib/db"
import { generateStoryInBackground } from "@/lib/story-generator"
import crypto from "crypto"
import { after } from "next/server"
import { getSetting } from "@/lib/settings"

export async function createStoryAction(formData: FormData) {
  try {
    // Check if submissions are halted
    const submissionsHalted = await getSetting("SUBMISSIONS_HALTED")

    if (submissionsHalted) {
      throw new Error("Story submissions are temporarily halted due to high demand. Please try again later.")
    }

    const title = formData.get("title") as string
    const prompt = (formData.get("prompt") as string) || "A fun alphabet adventure for children"
    const age = formData.get("age") as string
    const visibility = (formData.get("visibility") as string) || "public"

    if (!title) {
      throw new Error("Title is required")
    }

    // Default age range if not provided
    const ageRange = age || "3-8"

    // Generate a unique ID for the story
    const storyId = crypto.randomUUID() as string;

    // Generate a deletion token
    const deletionToken = crypto.randomBytes(16).toString("hex")

    // Create the story in KV
    await createStory({
      id: storyId,
      title,
      prompt,
      age: ageRange,
      visibility: visibility === "unlisted" ? "unlisted" : "public",
      status: "generating",
      createdAt: new Date().toISOString(),
      deletionToken,
    })

    // Use after() to run the story generation after the response is sent
    after(async () => {
      await generateStoryInBackground(storyId, title, prompt, ageRange)
    })

    // Redirect to the generating page
    redirect(`/generating/${storyId}`)
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error creating story:", error)
    throw error
  }
}

export async function updateStoryVisibilityAction(formData: FormData) {
  try {
    const storyId = formData.get("storyId") as string
    const visibility = formData.get("visibility") as string

    if (!storyId) {
      throw new Error("Story ID is required")
    }

    // Update the story visibility
    const updatedStory = await updateStory(storyId, {
      visibility: visibility === "unlisted" ? "unlisted" : "public",
    })

    return { success: true, story: updatedStory }
  } catch (error) {
    console.error("Error updating story visibility:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

