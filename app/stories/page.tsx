import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Loader2, Sparkles, ChevronRight } from "lucide-react"
import Image from "next/image"
import { unstable_cache } from "next/cache"
import { listStories } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyboardHandler, SearchSection } from "./client-components"
import type { Metadata } from "next"

// Base URL for OpenGraph image - always use production URL for OG images
const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://v0-story-maker.vercel.app"

// Create the OG image URL with parameters
const ogImageUrl = new URL(`${baseUrl}/api/og`)
ogImageUrl.searchParams.append("title", "Browse ABC Stories")
ogImageUrl.searchParams.append("subtitle", "Explore our collection of magical alphabet stories")
ogImageUrl.searchParams.append("type", "stories")

export const metadata: Metadata = {
  title: "Browse Stories | ABC StoryMaker",
  description: "Browse and read our collection of magical alphabet stories for children.",
  openGraph: {
    title: "Browse Stories | ABC StoryMaker",
    description: "Browse and read our collection of magical alphabet stories for children.",
    images: [
      {
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
        alt: "ABC StoryMaker Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Stories | ABC StoryMaker",
    description: "Browse and read our collection of magical alphabet stories for children.",
    images: [ogImageUrl.toString()],
  },
}

// Update the getStoriesWithCache function
const getStoriesWithCache = unstable_cache(
  async (searchTerm?: string) => {
    const allStories = await listStories()

    if (!allStories || allStories.length === 0) {
      return []
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

    // Filter out failed stories and unlisted stories
    // Then sort by creation date (newest first)
    let filteredStories = processedStories
      .filter((story) => story.status !== "failed")
      .filter((story) => story.visibility !== "unlisted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredStories = filteredStories.filter(
        (story) =>
          story.title.toLowerCase().includes(term) || (story.prompt && story.prompt.toLowerCase().includes(term)),
      )
    }

    return filteredStories
  },
  ["stories-list"],
  { revalidate: 30 }, // Revalidate every 30 seconds
)

// Update the page component to accept search params
export default async function StoriesPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
  // Next.js 15 Dynamic APIs are Asynchronous. https://nextjs.org/docs/messages/sync-dynamic-apis
  const searchParamsResolved = await searchParams;
  // const searchTerm = searchParams?.search || ""
  const searchTerm = searchParamsResolved?.search || "";
  const stories = await getStoriesWithCache(searchTerm);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90">
      <KeyboardHandler />

      <div className="max-w-6xl mx-auto px-4 py-12 md:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  Back to Home
                </span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/#create-story">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                <Sparkles className="mr-2 h-4 w-4" />
                Create New Story
              </Button>
            </Link>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md mb-6 relative z-10">
              <BookOpen size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            All Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Browse all the magical StoryMaker stories</p>
        </div>

        {/* Search and Filter Section */}
        <SearchSection searchTerm={searchTerm} storiesCount={stories.length} />

        {/* Stories Display Section */}
        {stories.length === 0 ? (
          <Card className="relative overflow-hidden border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-primary/30" />
                  <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">
                {searchTerm ? `No Stories Found for "${searchTerm}"` : "No Stories Yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try a different search term or browse all stories."
                  : "No stories have been created yet. Let's make the first magical story!"}
              </p>
              {searchTerm ? (
                <Link href="/stories">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                    View All Stories
                  </Button>
                </Link>
              ) : (
                <Link href="/#create-story">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                    Create Your First Story
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <TabsTrigger value="all">All Stories</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <div
                    className="block"
                    key={story.id}
                  >
                    <Card className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30  animate-in fade-in duration-500">
                      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                        {story.previewImage ? (
                          <Image
                            src={story.previewImage || "/placeholder.svg"}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {story.status !== "complete" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                              {story.status === "failed" ? "Failed" : "Generating..."}
                            </div>
                          </div>
                        )}

                        {/* Age badge */}
                        {story.age && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            Ages {story.age}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{story.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Created on {formatDate(story.createdAt)}</p>
                        {story.prompt && (
                          <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">{story.prompt}</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        {story.status === "complete" ? (
                          <Link href={`/story/${story.id}`} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                              Read Story
                              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        ) : story.status === "failed" ? (
                          <Button disabled className="w-full bg-red-500">
                            Generation Failed
                          </Button>
                        ) : (
                          <Link href={`/generating/${story.id}`} className="w-full">
                            <Button variant="outline" className="w-full group">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              View Progress
                              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.slice(0, 6).map((story, index) => (
                  <Link
                    href={story.status === "complete" ? `/story/${story.id}` : `/generating/${story.id}`}
                    className="block"
                    key={story.id}
                  >
                    <Card className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 cursor-pointer animate-in fade-in duration-500">
                      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                        {story.previewImage ? (
                          <Image
                            src={story.previewImage || "/placeholder.svg"}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {story.status !== "complete" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                              {story.status === "failed" ? "Failed" : "Generating..."}
                            </div>
                          </div>
                        )}

                        {/* Age badge */}
                        {story.age && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            Ages {story.age}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{story.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Created on {formatDate(story.createdAt)}</p>
                      </CardContent>
                      <CardFooter>
                        {story.status === "complete" ? (
                          <Link href={`/story/${story.id}`} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                              Read Story
                              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/generating/${story.id}`} className="w-full">
                            <Button variant="outline" className="w-full group">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              View Progress
                              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* For now, we'll just show the same stories but could be sorted by popularity metrics in the future */}
                {stories
                  .slice()
                  .sort(() => Math.random() - 0.5)
                  .map((story, index) => (
                    <Link
                      href={story.status === "complete" ? `/story/${story.id}` : `/generating/${story.id}`}
                      className="block"
                      key={story.id}
                    >
                      <Card className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 cursor-pointer animate-in fade-in duration-500">
                        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                          {story.previewImage ? (
                            <Image
                              src={story.previewImage || "/placeholder.svg"}
                              alt={story.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                          {story.status !== "complete" && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                                {story.status === "failed" ? "Failed" : "Generating..."}
                              </div>
                            </div>
                          )}

                          {/* Age badge */}
                          {story.age && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              Ages {story.age}
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="text-xl">{story.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Created on {formatDate(story.createdAt)}</p>
                        </CardContent>
                        <CardFooter>
                          {story.status === "complete" ? (
                            <Link href={`/story/${story.id}`} className="w-full">
                              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                                Read Story
                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/generating/${story.id}`} className="w-full">
                              <Button variant="outline" className="w-full group">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                View Progress
                                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                              </Button>
                            </Link>
                          )}
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <KeyboardHandler />
    </div>
  )
}

