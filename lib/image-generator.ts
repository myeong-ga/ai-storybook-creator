import { google } from "@ai-sdk/google"
import { type CoreMessage, generateText } from "ai"
import { uploadImageToBlob } from "./blob-storage"

/**
 * Generate an image based on a prompt using Google's Gemini model
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @param previousImages Optional array of previous images to maintain consistency
 * @param previousPrompts Optional array of previous prompts corresponding to the images
 * @returns The generated image URL
 */
export async function generateImage(
  prompt: string,
  storyId: string,
  pageIndex: number,
  previousImages: string[] = [],
  previousPrompts: string[] = [],
): Promise<string> {
  try {
    // Create messages array with previous images if available
    const messages: CoreMessage[] = []

    // Add previous images to the messages if available
    if (previousImages.length > 0 && Array.isArray(previousImages)) {
      // Filter out any non-string values or data URLs that might be invalid
      const validImages = previousImages.filter((img, index) => {
        const isValid =
          typeof img === "string" && (img.startsWith("data:") || img.startsWith("http") || img.startsWith("/"))
        return isValid
      })

      if (validImages.length > 0) {
        // Include up to 3 most recent images for context and consistency
        const recentImagesCount = Math.min(3, validImages.length)
        const recentImages = validImages.slice(-recentImagesCount)
        const recentPrompts = previousPrompts.slice(-recentImagesCount)

        // Add each image with its corresponding prompt as context
        for (let i = 0; i < recentImages.length; i++) {
          const imagePrompt = recentPrompts[i] || "Previous illustration"
          const messageContent = [
            {
              type: "text" as const,
              text: `Previous page prompt: ${imagePrompt}`,
            },
            {
              type: "image" as const,
              image: recentImages[i],
            },
          ]

          messages.push({
            role: "user",
            content: messageContent,
          })

          // Add assistant acknowledgment to maintain conversation flow
          messages.push({
            role: "assistant",
            content: "I've received this image and will maintain visual consistency with it.",
          })
        }

        // Add a summary message about maintaining consistency
        messages.push({
          role: "user",
          content:
            "Please maintain character appearance, art style, and color palette consistency with these previous illustrations when creating the next image.",
        })

        messages.push({
          role: "assistant",
          content:
            "I'll ensure the characters, art style, and colors remain consistent with the previous illustrations.",
        })
      }
    }

    // Add the current prompt
    messages.push({
      role: "user",
      content: `Generate an illustration for a children's ABC story: ${prompt}. Make it colorful, child-friendly, and in a consistent style with any previous images. Include diverse characters with different ethnicities, genders, and abilities. Ensure representation is natural and authentic.`,
    })

    // Generate the image
    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
      messages: messages.length > 0 ? messages : undefined,
      prompt:
        messages.length === 0
          ? `Generate an illustration for a children's ABC story: ${prompt}. Make it colorful, child-friendly, and include diverse characters with different ethnicities, genders, and abilities. Ensure representation is natural and authentic.`
          : undefined,
    })

    // Extract the image from the response
    if (result.files && Array.isArray(result.files) && result.files.length > 0) {
      for (const file of result.files) {
        if (file.mimeType?.startsWith("image/") && file.base64) {
          const dataUrl = `data:${file.mimeType};base64,${file.base64}`

          // Upload the image to Vercel Blob
          const blobUrl = await uploadImageToBlob(dataUrl, storyId, pageIndex)

          // After processing the image and before returning the blobUrl, add this check
          if (!blobUrl.startsWith("https://")) {
            return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
          }

          return blobUrl
        }
      }
    }

    // At the end of the generateImage function, add this check to ensure we're always returning a Blob URL
    if (!result.files || !Array.isArray(result.files) || result.files.length === 0) {
      const placeholderUrl = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
      return placeholderUrl
    }

    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  } catch (error) {
    console.error(`[IMAGE-GEN] Error generating image:`, error)
    // Return a placeholder image if generation fails
    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  }
}

