"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Heart } from "lucide-react"
import Image from "next/image"
import { useFavorites, type FavoriteStory } from "@/lib/favorites"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const { favorites, removeFavorite, loaded } = useFavorites()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemoveFavorite = (story: FavoriteStory) => {
    removeFavorite(story.id)
    toast({
      title: "Removed from favorites",
      description: `"${story.title}" has been removed from your favorites`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8 dark:from-black dark:via-black dark:to-black/90">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  Back to Home
                </span>
              </Button>
            </Link>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-primary/10 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1 max-w-sm">
                <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-primary/10 rounded"></div>
                  <div className="h-4 bg-primary/10 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8 dark:from-black dark:via-black dark:to-black/90">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                Back to Home
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="bg-background p-4 rounded-full shadow-md mb-6 relative z-10">
              <Heart size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            My Favorite Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Stories you've saved for easy access</p>
        </div>

        {favorites.length === 0 ? (
          <Card className="border border-primary/20 shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:border-primary/10">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Heart className="h-12 w-12 text-primary/30" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't added any stories to your favorites yet.</p>
              <Link href="/stories">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  Browse Stories
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((story, index) => (
              <Card
                key={story.id}
                className="border border-primary/20 shadow-lg overflow-hidden rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800 dark:border-primary/10"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animation: "fadeIn 0.5s ease-out forwards",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
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
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Added on {formatDate(story.createdAt)}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/story/${story.id}`} className="flex-1 mr-2">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                      Read Story
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveFavorite(story)}
                    className="flex-shrink-0"
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

