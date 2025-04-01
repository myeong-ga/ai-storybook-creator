"use client"

import { BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-background focus:z-50"
      >
        Skip to main content
      </a>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">StoryMaker</span>
        </Link>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-4 mr-auto ml-8" aria-label="Main navigation">
          <Link
            href="/"
            className={`text-sm ${pathname === "/" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/stories"
            className={`text-sm ${pathname === "/stories" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/stories" ? "page" : undefined}
          >
            Stories
          </Link>
          <Link
            href="/favorites"
            className={`text-sm ${pathname === "/favorites" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/favorites" ? "page" : undefined}
          >
            Favorites
          </Link>
          <Link href="/#create-story" className="text-sm text-muted-foreground hover:text-foreground">
            Create Story
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

