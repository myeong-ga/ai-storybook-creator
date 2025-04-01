"use client"

import type React from "react"

import { useEffect } from "react"
import { SearchStories } from "@/components/search-stories"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

type KeyboardHandlerProps = {}

export function KeyboardHandler({}: KeyboardHandlerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the event target is an input, textarea, or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Skip for modifier keys and navigation keys
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.key === "Tab" ||
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === "PageUp" ||
        e.key === "PageDown"
      ) {
        return
      }

      // If it's a printable character, focus the search input
      if (e.key.length === 1) {
        e.preventDefault()
        // Focus the search input using the global method
        if (typeof window !== "undefined" && (window as any).focusStorySearch) {
          ;(window as any).focusStorySearch()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}

export function SearchSection({
  className,
  searchTerm,
  storiesCount,
}: {
  className?: string
  searchTerm?: string
  storiesCount: number
}) {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-md ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <SearchStories className="w-full" />
          {searchTerm && (
            <p className="mt-2 text-sm text-muted-foreground">
              {storiesCount === 0
                ? `No stories found for "${searchTerm}"`
                : `Found ${storiesCount} ${storiesCount === 1 ? "story" : "stories"} for "${searchTerm}"`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  )
}

export function StoryTabs({
  defaultValue = "all",
  children,
}: {
  defaultValue?: string
  children: React.ReactNode
}) {
  return <div className="w-full">{children}</div>
}

