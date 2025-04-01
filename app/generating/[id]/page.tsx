"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, BookOpen, ImageIcon, Sparkles, Eye } from "lucide-react"
import { ALPHABET } from "@/lib/constants"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GeneratingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [status, setStatus] = useState<string>("generating")
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [currentLetter, setCurrentLetter] = useState<string>("A")
  const [imagesGenerated, setImagesGenerated] = useState<number>(0)
  const [notificationPermission, setNotificationPermission] = useState<string>("default")
  const [storyData, setStoryData] = useState<any>(null)
  const [notificationSent, setNotificationSent] = useState<boolean>(false)
  const [alphabetLettersCount, setAlphabetLettersCount] = useState<number>(8)

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      }
    }
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/story/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch story status")
        }

        const data = await response.json()
        setStatus(data.status)
        setStoryData(data)

        // Get the alphabet letters count from the story content
        if (data.storyContent) {
          try {
            const content = JSON.parse(data.storyContent)
            if (content && content.pages) {
              setAlphabetLettersCount(content.pages.length)
            }
          } catch (e) {
            console.error("Error parsing story content:", e)
          }
        }

        // Calculate progress based on status
        if (data.status === "generating") {
          setProgress(10)
          setCurrentLetter("A")
        } else if (data.status === "generating_story") {
          setProgress(40)
          setCurrentLetter("B")
        } else if (data.status === "generating_images") {
          // Check how many images have been generated so far
          let imageCount = 0
          if (data.images) {
            try {
              const images = JSON.parse(data.images)
              imageCount = images.length
              setImagesGenerated(imageCount)
            } catch (e) {
              console.error("Error parsing images:", e)
            }
          }

          // Calculate progress based on image generation
          const baseProgress = 40 // Story generation complete
          const imageProgress = 60 // Remaining progress for images
          const letterCount = alphabetLettersCount

          // Calculate progress percentage
          const imageProgressPercentage = imageCount / letterCount
          const totalProgress = baseProgress + imageProgress * imageProgressPercentage

          setProgress(totalProgress)

          // Set current letter based on image generation progress
          if (imageCount < letterCount) {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            setCurrentLetter(alphabet[imageCount])
          }
        } else if (data.status === "complete") {
          setProgress(100)
          setCurrentLetter("✓")

          // Send browser notification if permission granted and not already sent
          if (notificationPermission === "granted" && !notificationSent) {
            const notification = new Notification("Your ABC Story is Ready!", {
              body: `"${data.title}" is now ready to read!`,
              icon: "/favicon.ico",
            })

            notification.onclick = () => {
              window.focus()
              router.push(`/story/${params.id}`)
            }

            setNotificationSent(true)
          }

          // Redirect to the story page after a short delay
          setTimeout(() => {
            router.push(`/story/${params.id}`)
          }, 1500)
        } else if (data.status === "failed") {
          setError(data.error || "Story generation failed")
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      }
    }

    // Check status immediately
    checkStatus()

    // Then check every 3 seconds
    const interval = setInterval(checkStatus, 3000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [params.id, router, notificationPermission, notificationSent, alphabetLettersCount])

  const getStatusMessage = () => {
    switch (status) {
      case "generating":
        return "Preparing to create your ABC story..."
      case "generating_story":
        return `Writing your magical ABC story (${alphabetLettersCount} letters)...`
      case "generating_images":
        return `Drawing illustrations (${imagesGenerated}/${alphabetLettersCount} complete)...`
      case "complete":
        return "Your ABC story is ready!"
      case "failed":
        return "Oops! Something went wrong."
      default:
        return "Creating your ABC story..."
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "generating":
        return <Sparkles className="w-8 h-8 text-yellow-500" />
      case "generating_story":
        return <BookOpen className="w-8 h-8 text-blue-500" />
      case "generating_images":
        return <ImageIcon className="w-8 h-8 text-green-500" />
      case "complete":
        return <Sparkles className="w-8 h-8 text-primary" />
      default:
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />
    }
  }

  // Check if we can show a preview (story content exists but images might still be generating)
  const canShowPreview = () => {
    return status === "generating_images" && storyData?.storyContent && imagesGenerated > 0
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg rounded-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {error ? (
              <div className="text-red-500">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-primary/30 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">{getStatusIcon()}</div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                    <span className="text-xl font-bold text-primary">{currentLetter}</span>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <h2 className="text-xl font-bold">{getStatusMessage()}</h2>
                  <Progress value={progress} className="h-2" />
                  <p className="text-muted-foreground text-sm">
                    This may take a minute or two. Our AI is hard at work creating a special ABC story just for you!
                  </p>
                </div>

                <div className="w-full pt-4">
                  <div className="flex items-center justify-center space-x-2">
                    {Array.from(ALPHABET.slice(0, Math.min(8, alphabetLettersCount))).map((letter, i) => (
                      <div
                        key={letter}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          letter === currentLetter
                            ? "bg-primary text-white"
                            : i < ALPHABET.indexOf(currentLetter)
                              ? "bg-primary/70 text-white"
                              : "bg-primary/30 text-primary/70"
                        }`}
                      >
                        {letter}
                      </div>
                    ))}
                    {alphabetLettersCount > 8 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-primary/30 text-primary/70">
                        ...
                      </div>
                    )}
                  </div>
                </div>

                {canShowPreview() && (
                  <div className="w-full pt-4">
                    <Link href={`/story/${params.id}`}>
                      <Button className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Story in Progress
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can view the story while images are still being generated
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

