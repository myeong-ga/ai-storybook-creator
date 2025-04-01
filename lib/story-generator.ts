import { updateStory } from "@/lib/db"
import type { StoryContent } from "@/lib/db"
import { getAlphabetSubset } from "./constants"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { generateImage } from "./image-generator"
import { getSetting } from "./settings"
import z from "zod"

const storySchema = z.object({
  pages: z.array(
    z
      .object({
        letter: z.string(),
        text: z.string(),
        imagePrompt: z.string(),
      })
      .required(),
  ),
  moral: z.string(),
})

/**
 * Generate a story in the background
 * This function is called after the response is sent to the client
 */
export async function generateStoryInBackground(storyId: string, title: string, prompt: string, ageRange: string) {
  try {
    // Get the alphabet letters count from settings
    const ALPHABET_LETTERS_COUNT = await getSetting("ALPHABET_LETTERS_COUNT")

    // Update status to indicate generation has started
    await updateStory(storyId, {
      status: "generating_story",
    })

    // Get the subset of alphabet letters we'll use
    const alphabetLetters = getAlphabetSubset(ALPHABET_LETTERS_COUNT)

    // Generate the story content using OpenAI
    let generatedStory: Awaited<ReturnType<typeof generateObject>>
    try {
      generatedStory = await generateObject({
        model: google("gemini-2.0-flash-lite"),
        schema: storySchema,
        prompt: `Create a children's ABC content titled "${title}" for ages ${ageRange} about: ${prompt}. 
  
  IMPORTANT: The content MUST be about the title "${title}" and incorporate this title as the central theme.
  
  The content should progress through the first ${ALPHABET_LETTERS_COUNT} letters of the alphabet (${alphabetLetters.join(
    ", ",
  )}).
  
  Each page should:
  1. Start with a sentence or phrase beginning with the corresponding letter (A, B, C, D, etc.)
  2. Relate to the overall theme of "${title}"
  3. Be engaging and educational for children in the ${ageRange} age range
  
  IMPORTANT: Choose the most appropriate format based on the title and theme:
  
  - If the title suggests a narrative (like an adventure or journey), create a flowing story where each page continues from the previous one with consistent characters and plot progression.
    Example narrative:
    - "A long time ago, Max was looking for friends in the magical forest..."
    - "Before too long, he spotted a small rabbit hiding behind a tree..."
  
  - If the title suggests a collection or concept (like "Animals of Africa" or "Colors"), create thematic content where each page explores a different aspect of the theme while still connecting to the overall concept.
    Example collection:
    - "Amazing elephants have the largest ears of any animal in Africa..."
    - "Beautiful zebras have black and white stripes that help them hide from predators..."
  
  Make the content engaging, age-appropriate, and include educational value or a moral lesson when appropriate.
  For each page, also create a detailed image prompt that captures the key moment or concept on that page.
  The image prompts should be detailed enough for an AI image generator to create a consistent illustration.`,
        system:
          "You are a children's ABC content creator. Create engaging, educational content that helps children learn the alphabet. This can be in the form of flowing narratives with consistent characters and plot, or thematic explorations that connect concepts to each letter. Always make the title the central theme of your content, adapting your format to best suit the title and theme.",
      })
    } catch (error) {
      console.error(`[STORY-GEN] Error generating story with OpenAI:`, error)
      throw new Error(`Error generating story with OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Format the story for our application
    const story: StoryContent = {
      title,
      // @ts-expect-error generatedStory is not typed strongly
      pages: generatedStory.object?.pages.map((page: any) => ({
        text: page.text,
        imagePrompt: page.imagePrompt,
      })),
      moral:
        // @ts-expect-error generatedStory is not typed strongly
        generatedStory.object?.moral || "Learning the alphabet is fun and helps us discover new words!",
    }

    // Stringify the story content before updating
    const storyContentString = JSON.stringify(story)

    // Update status to indicate image generation has started
    await updateStory(storyId, {
      status: "generating_images",
      storyContent: storyContentString,
    })

    // Generate images for each page using Gemini
    const images = []
    const generatedImages = []
    const imagePrompts = []

    for (let i = 0; i < story.pages.length; i++) {
      try {
        // Generate image based on the prompt
        const imagePrompt = story.pages[i].imagePrompt

        // Pass previous images and prompts to maintain consistency
        const image = await generateImage(imagePrompt, storyId, i, generatedImages, imagePrompts)

        // Check if we got a valid image or a placeholder
        const isPlaceholder = image.includes("/placeholder.svg")

        // Store the generated image
        images.push(image)

        // Only add to generatedImages if it's not a placeholder
        if (!isPlaceholder) {
          generatedImages.push(image)
          imagePrompts.push(imagePrompt)
        }

        // Update the story with the progress so far
        const imagesString = JSON.stringify(images)
        await updateStory(storyId, {
          images: imagesString,
        })
      } catch (error) {
        console.error(`[STORY-GEN] Error generating image ${i + 1}:`, error)
        // Use a placeholder if image generation fails
        const letter = alphabetLetters[i]
        const placeholderImage = `/placeholder.svg?height=400&width=600&text=Letter+${letter}`
        images.push(placeholderImage)
      }

      // Add a small delay between image generation requests to avoid overwhelming the API
    }

    // Update the story with the generated images and mark as complete
    const finalImagesString = JSON.stringify(images)

    await updateStory(storyId, {
      status: "complete",
      images: finalImagesString,
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[STORY-GEN] Error in overall story generation process:`, error)
    // Update status to indicate failure
    await updateStory(storyId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

