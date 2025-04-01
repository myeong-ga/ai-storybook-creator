import { Sparkles, GithubIcon, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer
      className="w-full py-12 mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="contentinfo"
    >
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">StoryMaker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Creating magical alphabet stories for children using AI. Designed to make learning fun and interactive.
            </p>
            <div className="flex items-center space-x-3">
              <Link
                href="https://v0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-sm text-white transition-transform hover:scale-105 hover:shadow-lg"
                aria-label="Made with v0"
              >
                <span className="mr-1">Made with</span>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="ml-1 font-bold">v0</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-base font-medium">Explore</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/stories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse Stories
            </Link>
            <Link
              href="/#create-story"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Create Story
            </Link>
            <Link href="/favorites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              My Favorites
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-base font-medium">Connect</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com/vercel" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="https://x.com/v0" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

