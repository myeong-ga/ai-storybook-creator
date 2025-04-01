"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { deleteStory } from "@/lib/db"
import { kv } from "@vercel/kv"

// Admin authentication
export async function adminLogin(formData: FormData) {
  const password = formData.get("password") as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!password || password !== adminPassword) {
    return { success: false, message: "Invalid password" }
  }

  // Set an admin session cookie (expires in 24 hours)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  cookies().set("admin_session", "true", { expires, httpOnly: true })

  return { success: true }
}

// Check if admin is logged in
export async function checkAdminAuth() {
  const session = cookies().get("admin_session")
  return !!session?.value
}

// Admin logout
export async function adminLogout() {
  cookies().delete("admin_session")
  redirect("/admin")
}

// Delete a single story
export async function deleteStoryAction(formData: FormData) {
  // Check if admin is logged in
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return { success: false, message: "Unauthorized. Admin access required." }
  }

  const storyId = formData.get("storyId") as string

  if (!storyId) {
    return { success: false, message: "Story ID is required" }
  }

  try {
    await deleteStory(storyId)
    return { success: true, message: `Story ${storyId} deleted successfully` }
  } catch (error) {
    console.error("Error deleting story:", error)
    return { success: false, message: "Failed to delete story" }
  }
}

// Delete all stories
export async function deleteAllStoriesAction() {
  // Check if admin is logged in
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return { success: false, message: "Unauthorized. Admin access required." }
  }

  try {
    // Get all story keys
    const storyKeys = await kv.keys("story:*")

    if (storyKeys.length === 0) {
      return { success: true, message: "No stories to delete" }
    }

    // Delete all stories
    let deletedCount = 0
    for (const key of storyKeys) {
      await kv.del(key)
      deletedCount++
    }

    return { success: true, message: `Successfully deleted ${deletedCount} stories` }
  } catch (error) {
    console.error("Error deleting all stories:", error)
    return { success: false, message: "Failed to delete all stories" }
  }
}

