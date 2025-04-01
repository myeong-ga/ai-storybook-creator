"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/favorites"
import { useToast } from "@/hooks/use-toast"

interface FavoriteButtonProps {
  storyId: string
  storyTitle: string
  createdAt: string
  previewImage?: string
}

export function FavoriteButton({ storyId, storyTitle, createdAt, previewImage }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite, loaded } = useFavorites()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      setIsFav(isFavorite(storyId))
    }
  }, [loaded, storyId, isFavorite])

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(storyId)
      toast({
        title: "Removed from favorites",
        description: `"${storyTitle}" has been removed from your favorites`,
      })
    } else {
      addFavorite({
        id: storyId,
        title: storyTitle,
        createdAt,
        previewImage,
      })
      toast({
        title: "Added to favorites",
        description: `"${storyTitle}" has been added to your favorites`,
      })
    }
    setIsFav(!isFav)
  }

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      className="rounded-full hover:bg-primary/10 transition-colors"
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFav}
    >
      <Heart
        className={`h-6 w-6 transition-all ${isFav ? "fill-primary text-primary scale-110" : "text-muted-foreground"}`}
      />
    </Button>
  )
}

