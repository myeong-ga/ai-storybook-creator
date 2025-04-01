"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchStoriesProps {
  className?: string
}

export function SearchStories({ className }: SearchStoriesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update URL when search term changes
  useEffect(() => {
    if (debouncedSearchTerm === "") {
      router.push("/stories")
    } else {
      router.push(`/stories?search=${encodeURIComponent(debouncedSearchTerm)}`)
    }
  }, [debouncedSearchTerm, router])

  // Expose focus method to parent components
  useEffect(() => {
    // Add to window for global access
    if (typeof window !== "undefined") {
      ;(window as any).focusStorySearch = () => {
        inputRef.current?.focus()
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).focusStorySearch
      }
    }
  }, [])

  return (
    <form className={`relative ${className}`} onSubmit={(e) => e.preventDefault()} role="search">
      <label htmlFor="story-search" className="sr-only">
        Search stories
      </label>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        id="story-search"
        type="search"
        placeholder="Search stories..."
        className="pl-10 pr-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search stories"
        ref={inputRef}
      />
    </form>
  )
}

