import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Uploads a base64 image to Vercel Blob storage
 * @param base64Data The base64 data URL of the image
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @returns The URL of the uploaded image
 */
export async function uploadImageToBlob(base64Data: string, storyId: string, pageIndex: number): Promise<string> {
  try {
    // Skip if it's already a URL (not a base64 string)
    if (!base64Data.startsWith("data:")) {
      return base64Data
    }

    // Extract the mime type and base64 content
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 data")
    }

    const mimeType = matches[1]
    const base64Content = matches[2]

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64")

    // Generate a unique filename
    const extension = mimeType.split("/")[1] || "png"
    const filename = `${storyId}-page-${pageIndex}-${nanoid(6)}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      contentType: mimeType,
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("[BLOB-STORAGE] Error uploading image to Blob:", error)
    // Return the original base64 data if upload fails
    return base64Data
  }
}

/**
 * Converts an array of base64 images to Blob URLs
 * @param images Array of base64 images or URLs
 * @param storyId The ID of the story
 * @returns Array of Blob URLs
 */
export async function convertImagesToBlob(images: string[], storyId: string): Promise<string[]> {
  if (!images || !Array.isArray(images)) {
    return []
  }

  const blobUrls = []

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    if (!image) continue

    try {
      const blobUrl = await uploadImageToBlob(image, storyId, i)
      blobUrls.push(blobUrl)
    } catch (error) {
      console.error(`[BLOB-STORAGE] Error converting image ${i} to blob:`, error)
      blobUrls.push(image) // Keep the original in case of error
    }
  }

  return blobUrls
}

