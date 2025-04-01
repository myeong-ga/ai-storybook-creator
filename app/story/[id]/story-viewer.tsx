"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Share2, RefreshCw, Sparkles, Download, Facebook, Twitter, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ALPHABET } from "@/lib/constants"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface StoryPage {
  text: string
  imagePrompt: string
}

interface StoryContent {
  title: string
  pages: StoryPage[]
  moral?: string
}

interface StoryViewerProps {
  storyId: string
  storyContent: StoryContent
  images: string[]
  isGenerating?: boolean
}

export default function StoryViewer({ storyId, storyContent, images, isGenerating = false }: StoryViewerProps) {
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [imageError, setImageError] = useState<boolean>(false)
  const [currentImages, setCurrentImages] = useState<string[]>(images)
  const [pageTransition, setPageTransition] = useState<"none" | "fade-out" | "fade-in">("none")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const storyUrl = typeof window !== "undefined" ? `${window.location.origin}/story/${storyId}` : ""
  const [showMoral, setShowMoral] = useState(false)

  // Refs for the story container to enable print functionality
  const storyContainerRef = useRef<HTMLDivElement>(null)

  // If the story is still generating, periodically check for new images
  useEffect(() => {
    if (!isGenerating) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/story/${storyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.images) {
            const newImages = JSON.parse(data.images)
            setCurrentImages(newImages)
          }
        }
      } catch (error) {
        console.error("Error refreshing images:", error)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isGenerating, storyId])

  // Update images when props change
  useEffect(() => {
    setCurrentImages(images)
  }, [images])

  const handleNextPage = () => {
    if (storyContent && currentPage < storyContent.pages.length - 1) {
      setPageTransition("fade-out")
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setImageError(false)
        setPageTransition("fade-in")
        setTimeout(() => {
          setPageTransition("none")
        }, 300)
      }, 300)
    } else if (currentPage === storyContent.pages.length - 1 && storyContent.moral) {
      // Show moral when reaching the last page
      setShowMoral(true)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setPageTransition("fade-out")
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setImageError(false)
        setPageTransition("fade-in")
        setTimeout(() => {
          setPageTransition("none")
        }, 300)
      }, 300)
    }
  }

  const handleShare = () => {
    // Use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: storyContent.title,
          text: `Check out this ABC story: ${storyContent.title}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error)
          // Fallback to copying the link
          copyLinkToClipboard()
        })
    } else {
      // Fallback for browsers that don't support Web Share API
      setShareDialogOpen(true)
    }
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied!",
      description: "Share this link with friends to show them your story",
    })
    setShareDialogOpen(false)
  }

  const refreshImages = async () => {
    try {
      const response = await fetch(`/api/story/${storyId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.images) {
          const newImages = JSON.parse(data.images)
          setCurrentImages(newImages)
          toast({
            title: "Images refreshed",
            description: "The latest images have been loaded",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh images",
        variant: "destructive",
      })
    }
  }

  // Print the story
  const printStory = () => {
    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${storyContent.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { text-align: center; color: #9333ea; }
            .page { page-break-after: always; margin-bottom: 30px; }
            .page-content { margin-top: 20px; font-size: 18px; line-height: 1.6; }
            .letter { font-size: 36px; font-weight: bold; color: #9333ea; }
            .moral { border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; text-align: center; }
            .image-container { width: 100%; height: 400px; margin-bottom: 20px; text-align: center; }
            .image-container img { max-width: 100%; max-height: 400px; object-fit: contain; }
            @media print {
              .page { page-break-after: always; }
              .image-container img { max-width: 100%; max-height: 350px; }
            }
          </style>
        </head>
        <body>
          <h1>${storyContent.title}</h1>
          ${storyContent.pages
            .map(
              (page, index) => `
            <div class="page">
              <div class="image-container">
                <img src="${currentImages[index] || ""}" alt="Illustration for page ${index + 1}">
              </div>
              <div class="page-content">
                <span class="letter">${page.text.charAt(0)}</span>${page.text.substring(1)}
              </div>
            </div>
          `,
            )
            .join("")}
          ${
            storyContent.moral
              ? `
            <div class="moral">
              <h3>The Moral of the Story</h3>
              <p>${storyContent.moral}</p>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `

        printWindow.document.open()
        printWindow.document.write(content)
        printWindow.document.close()

        // Wait for content to load then print
        printWindow.onload = () => {
          // Wait for images to load
          setTimeout(() => {
            printWindow.print()
          }, 1000)
        }
      }
    }
  }

  // Get the current letter (first character of the page text)
  const getCurrentLetter = () => {
    const text = storyContent.pages[currentPage].text
    if (text.length > 0 && ALPHABET.includes(text[0])) {
      return text[0]
    }
    return ALPHABET[currentPage % ALPHABET.length]
  }

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the event target is an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === "ArrowRight" || e.key === " " || e.code === "Space") {
        e.preventDefault() // Prevent page scroll on space
        handleNextPage()
      } else if (e.key === "ArrowLeft") {
        handlePrevPage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage])

  // Handle URL hash for page navigation
  useEffect(() => {
    // Update URL hash when page changes
    window.location.hash = `page-${currentPage + 1}`

    // Listen for hash changes (browser back/forward)
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith("#page-")) {
        const pageNumber = Number.parseInt(hash.replace("#page-", ""), 10)
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= storyContent.pages.length) {
          setCurrentPage(pageNumber - 1)
        }
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [currentPage, storyContent.pages.length])

  // Check for hash on initial load
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith("#page-")) {
      const pageNumber = Number.parseInt(hash.replace("#page-", ""), 10)
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= storyContent.pages.length) {
        setCurrentPage(pageNumber - 1)
        setImageError(false)
      }
    }
  }, [storyContent.pages.length])

  const isLastPage = currentPage === storyContent.pages.length - 1

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={printStory}
          title="Print or save as PDF"
          className="relative overflow-hidden group"
        >
          <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>

        {isGenerating && (
          <Button
            variant="outline"
            size="icon"
            onClick={refreshImages}
            title="Refresh images"
            className="relative overflow-hidden group"
          >
            <RefreshCw className="h-4 w-4 group-hover:animate-spin" />
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
          </Button>
        )}

        <Button variant="outline" size="icon" onClick={handleShare} className="relative overflow-hidden group">
          <Share2 className="h-4 w-4" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>
      </div>

      <div
        ref={storyContainerRef}
        className="relative w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden"
      >
        <Card className="shadow-lg overflow-hidden rounded-xl transform transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
          <div
            className={`relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-700 transition-all duration-300 ${
              pageTransition === "fade-out" ? "opacity-0" : pageTransition === "fade-in" ? "opacity-100" : ""
            }`}
          >
            {currentImages[currentPage] && !imageError ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentImages[currentPage] || "/placeholder.svg"}
                  alt={`Illustration for "${storyContent.pages[currentPage].text.substring(0, 50)}..."`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  unoptimized={currentImages[currentPage].startsWith("data:")}
                />

                {/* Decorative sparkles */}
                <div className="absolute top-2 right-2 animate-float-slow opacity-70">
                  <Sparkles className="h-6 w-6 text-yellow-400 filter drop-shadow" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {imageError
                    ? "Image could not be loaded"
                    : isGenerating
                      ? "Image is still being generated..."
                      : "No image available"}
                </p>
              </div>
            )}

            <div className="absolute top-4 left-4 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="relative z-10 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {getCurrentLetter()}
              </span>
            </div>

            {/* Page number badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              Page {currentPage + 1} of {storyContent.pages.length}
            </div>
          </div>

          <div
            className={`p-6 md:p-8 transition-all duration-300 ${
              pageTransition === "fade-out" ? "opacity-0" : pageTransition === "fade-in" ? "opacity-100" : ""
            }`}
          >
            <p className="text-lg md:text-xl leading-relaxed dark:text-gray-100">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {storyContent.pages[currentPage].text.charAt(0)}
              </span>
              {storyContent.pages[currentPage].text.substring(1)}
            </p>
          </div>

          <div className="p-4 bg-primary/5 dark:bg-gray-700/50 border-t border-primary/10 dark:border-gray-600 flex justify-between items-center">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              variant="outline"
              className="group relative overflow-hidden"
              aria-label="Previous page"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Previous Page
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
            </Button>

            <Button
              onClick={handleNextPage}
              disabled={isLastPage && !storyContent.moral}
              variant={isLastPage ? "outline" : "default"}
              className={`group relative overflow-hidden ${
                isLastPage ? "" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
              aria-label={isLastPage ? "End of story" : "Next page"}
            >
              {isLastPage ? (
                <>
                  {storyContent.moral ? "See Moral" : "The End"}
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                </>
              ) : (
                <>
                  Next Page
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Moral Dialog */}
        {storyContent.moral && (
          <Dialog open={showMoral} onOpenChange={setShowMoral}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  The Moral of the Story
                </DialogTitle>
                <DialogDescription className="text-center">
                  What we can learn from "{storyContent.title}"
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 p-px rounded-full mb-4">
                  <div className="bg-background dark:bg-gray-800 p-3 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-lg italic text-center">{storyContent.moral}</p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowMoral(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Back to Story
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        Page {currentPage + 1} of {storyContent.pages.length}, {storyContent.pages[currentPage].text}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this story</DialogTitle>
            <DialogDescription>Share this magical ABC story with friends and family</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4 justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`, "_blank")
                }
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this ABC story: ${storyContent.title}`)}&url=${encodeURIComponent(storyUrl)}`,
                    "_blank",
                  )
                }
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="grid w-full gap-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2 dark:border-gray-700 overflow-hidden">
                  <span className="text-sm text-muted-foreground truncate max-w-full">{storyUrl}</span>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3 flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={copyLinkToClipboard}
              >
                <span className="sr-only">Copy</span>
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

