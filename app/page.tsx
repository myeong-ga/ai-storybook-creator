import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Sparkles, Wand2, ChevronRight } from "lucide-react"
import CreateStoryForm from "./create-story-form"
import { unstable_cache } from "next/cache"
import { listStories } from "@/lib/db"
import { getHomeSettings } from "./home-settings-provider"
import Image from "next/image"
import { ShimmerButton } from "@/components/magicui/shimmer-button"

export const maxDuration = 120

// Cache the stories for 30 seconds
const getStoriesWithCache = unstable_cache(
  async () => {
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
    return processedStories
      .filter((story) => story.status !== "failed")
      .filter((story) => story.visibility !== "unlisted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
  ["stories-list"],
  { revalidate: 30 }, // Revalidate every 30 seconds
)

export default async function Home() {
  const stories = await getStoriesWithCache()
  const settings = await getHomeSettings()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-bottom"
            style={{ backgroundImage: 'url("/images/hero-background.png")' }}
          ></div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12 relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-full shadow-lg relative z-10 animate-bounce-slow">
                <BookOpen size={60} className="text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">StoryMaker</h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mb-8 drop-shadow-lg">
              Create magical alphabet storybooks with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a href="#create-story" className="inline-block">
                <ShimmerButton
                  background="linear-gradient(to right, #9333ea, #ec4899)"
                  shimmerColor="rgba(255, 255, 255, 0.4)"
                  className="text-lg px-4 py-3 font-medium shadow-lg dark:text-foreground"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create a Story
                </ShimmerButton>
              </a>
              <Link href="/stories">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  Browse Stories
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create personalized alphabet stories in just a few simple steps
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Enter Your Idea</h3>
                  <p className="text-muted-foreground text-center">Provide a title and theme for your alphabet story</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">AI Creates Story</h3>
                  <p className="text-muted-foreground text-center">
                    Our AI generates a unique story with {settings.ALPHABET_LETTERS_COUNT} alphabet letters
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Read & Share</h3>
                  <p className="text-muted-foreground text-center">
                    Enjoy your personalized story with beautiful illustrations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create Story Section */}
      <section id="create-story" className="py-16 px-4 md:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              Create Your Own Story
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us your story idea and we'll create a magical alphabet adventure
            </p>
          </div>

          <Card className="relative border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 max-w-2xl mx-auto border-2 border-primary/20 shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-1 -right-2 transform rotate-[24deg] bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-800 px-4 py-1 rounded-lg text-sm font-bold shadow-md">
              A-Z
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Create Your ABC Story
              </CardTitle>
              <CardDescription className="text-lg">
                Tell us your story idea and we'll create an alphabet story with the first{" "}
                {settings.ALPHABET_LETTERS_COUNT} letters!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateStoryForm submissionsHalted={settings.SUBMISSIONS_HALTED} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Stories Section */}
      <section className="py-16 px-4 md:px-8 relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              Recent Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore magical alphabet adventures created by our community
            </p>
          </div>

          <Card className="relative overflow-hidden border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 border-2 border-primary/20 shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl">
            <CardContent className="pt-6">
              {stories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Sparkles className="h-12 w-12 text-primary/30" />
                      <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-4">No Stories Yet</h2>
                  <p className="text-muted-foreground mb-6">Create your first magical story!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stories.slice(0, 8).map((story, index) => (
                    <Link
                      href={story.status === "complete" ? `/story/${story.id}` : `/generating/${story.id}`}
                      className="block"
                      key={story.id}
                    >
                      <Card
                        className="relative overflow-hidden border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 border border-primary/10 shadow overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          opacity: 0,
                          animation: "fadeIn 0.5s ease-out forwards",
                        }}
                      >
                        <div className="relative h-36 w-full bg-gray-100 dark:bg-gray-700">
                          {story.previewImage ? (
                            <Image
                              src={story.previewImage || "/placeholder.svg"}
                              alt={story.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                          {story.status !== "complete" && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">
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
                        <div className="p-4">
                          <h3 className="font-medium text-lg truncate">{story.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{formatDate(story.createdAt)}</p>
                          <div>
                            <Button
                              size="sm"
                              className={`w-full ${
                                story.status === "complete"
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                                  : "variant-outline"
                              }`}
                            >
                              {story.status === "complete" ? "Read Story" : "View Progress"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {stories.length > 8 && (
                <div className="mt-8 text-center">
                  <Link href="/stories">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                      View All Stories ({stories.length})
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

