export function generateOgImageUrl({
  title,
  subtitle,
  imageUrl,
  type = "story",
}: {
  title: string
  subtitle?: string
  imageUrl?: string
  type?: "story" | "home" | "stories" | "favorites"
}): string {
  // Base URL for OpenGraph image - always use production URL for OG images
  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://v0-story-maker.vercel.app"

  // Create the OG image URL with parameters
  const ogImageUrl = new URL(`${baseUrl}/api/og`)
  ogImageUrl.searchParams.append("title", title)

  if (subtitle) {
    // For story type, we'll add the "AI-generated alphabet story" prefix in the OG route
    ogImageUrl.searchParams.append("subtitle", subtitle)
  }

  ogImageUrl.searchParams.append("type", type)

  // Only add image if we have a valid URL (not a data URL)
  if (imageUrl && !imageUrl.startsWith("data:")) {
    ogImageUrl.searchParams.append("image", imageUrl)
  }

  return ogImageUrl.toString()
}

