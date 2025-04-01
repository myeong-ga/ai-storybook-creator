import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getStory } from "@/lib/db"
import { notFound } from "next/navigation"
import StoryViewer from "./story-viewer"
import { FavoriteButton } from "./favorite-button"
import { generateOgImageUrl } from "@/lib/og-helpers"
import { VisibilityToggle } from "./visibility-toggle"
import { checkAdminAuth } from "@/app/admin/actions"

export async function generateMetadata({ params }: { params: { id: string } }) {
  
  //const storyData = await getStory(params.id)
  // Next.js 15 Dynamic APIs are Asynchronous. https://nextjs.org/docs/messages/sync-dynamic-apis
  const { id } = await params
  const storyData = await getStory(id)

  if (!storyData) {
    return {
      title: "Story Not Found",
      description: "The requested story could not be found.",
    }
  }

  let storyContent = null
  let images = []

  try {
    if (storyData.storyContent) {
      storyContent = JSON.parse(storyData.storyContent)
    }

    if (storyData.images) {
      images = JSON.parse(storyData.images)
    }
  } catch (error) {
    console.error("Error parsing story data:", error)
  }

  // Get the first image if available
  const previewImage = images && images.length > 0 ? images[0] : null

  // Create the OG image URL
  const title = storyContent?.title || storyData.title
  const subtitle = `An alphabet story for ages ${storyData.age}`

  // Base URL for OpenGraph image - always use production URL for OG images
  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://v0-story-maker.vercel.app"

  // Create the OG image URL with parameters
  // const ogImageUrl = new URL(`${baseUrl}/api/og`)
  // ogImageUrl.searchParams.append('title', title)
  // ogImageUrl.searchParams.append('subtitle', subtitle)
  // ogImageUrl.searchParams.append('type', 'story')

  // // Only add image if we have a valid URL (not a data URL)
  // if (previewImage && !previewImage.startsWith('data:')) {
  //   ogImageUrl.searchParams.append('image', previewImage)
  // }

  // Use the helper function
  const ogImageUrl = generateOgImageUrl({
    title: title,
    subtitle: `for ages ${storyData.age}`,
    imageUrl: previewImage,
    type: "story",
  })

  return {
    title: title,
    description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
    openGraph: {
      title: title,
      description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
      images: [ogImageUrl],
    },
  }
}

export default async function StoryPage({
  params: _params,
}: {
  params: Promise<{ id: string }>
}) {
  const params = await _params
  // Server-side data fetching
  const storyData = await getStory(params.id)

  if (!storyData) {
    notFound()
  }

  // Parse the story content and images with error handling
  let storyContent = null
  let images = []

  try {
    if (storyData.storyContent) {
      storyContent = JSON.parse(storyData.storyContent)
    }
  } catch (error) {
    console.error("Error parsing story content:", error)
  }

  try {
    if (storyData.images) {
      images = JSON.parse(storyData.images)
    }
  } catch (error) {
    console.error("Error parsing images:", error)
  }

  // If the story is still in initial generation phase (no content yet)
  if (storyData.status === "generating" || (storyData.status === "generating_story" && !storyContent)) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 p-2 md:p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  Back to Stories
                </span>
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-primary/20 shadow-lg rounded-xl">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2">Story is Still Generating</h2>
              <p className="mb-6">This story is still being created. Please check back soon!</p>
              <Link href={`/generating/${params.id}`}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  View Generation Progress
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // If the story failed to generate
  if (storyData.status === "failed") {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 p-4 md:p-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  Back to Stories
                </span>
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-red-200 shadow-lg rounded-xl">
            <div className="p-3 text-center text-red-500">
              <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
              <p>We couldn't generate this story. Please try creating a new one.</p>
              {storyData.error && <p className="mt-2 text-sm bg-red-50 p-2 rounded">Error: {storyData.error}</p>}
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // If storyContent is missing or invalid
  if (!storyContent || !storyContent.title || !storyContent.pages) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 p-4 md:p-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  Back to Stories
                </span>
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-red-200 shadow-lg rounded-xl">
            <div className="p-6 text-center text-red-500">
              <h2 className="text-xl font-bold mb-2">Story Data Error</h2>
              <p>There was a problem with this story's data. Please try creating a new one.</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Show a banner if the story is still generating
  const isGenerating = storyData.status === "generating_story" || storyData.status === "generating_images"

  // Add this after the story title and age display
  const isAdmin = await checkAdminAuth()

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 p-2 md:p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/stories">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                Back to Stories
              </span>
            </Button>
          </Link>
        </div>

        {isGenerating && (
          <Card className="border-2 border-yellow-200 shadow-lg rounded-xl mb-4 bg-yellow-50/50 dark:bg-yellow-900/20">
            <div className="p-4 text-center text-yellow-700 dark:text-yellow-500 flex items-center justify-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <p>
                This story is still being generated. Some images may be missing or incomplete.{" "}
                <Link href={`/generating/${params.id}`} className="underline font-medium">
                  View progress
                </Link>
              </p>
            </div>
          </Card>
        )}

        <div className="text-center mb-4 relative">
          <div className="absolute right-0 top-0">
            <FavoriteButton
              storyId={params.id}
              storyTitle={storyContent.title}
              createdAt={storyData.createdAt}
              previewImage={images[0]}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
            {storyContent.title}
          </h1>
          <p className="text-muted-foreground mt-2">A story for ages {storyData.age}</p>
          {isAdmin && (
            <div className="mt-2">
              <VisibilityToggle storyId={params.id} initialVisibility={storyData.visibility || "public"} />
            </div>
          )}
        </div>

        {/* Client component for interactive story viewing */}
        <StoryViewer storyId={params.id} storyContent={storyContent} images={images} isGenerating={isGenerating} />
      </div>
    </main>
  )
}

