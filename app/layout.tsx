import type { Metadata } from "next"
import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

// Base URL for OpenGraph image
const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://v0-story-maker.vercel.app"

// Create the OG image URL with parameters
const ogImageUrl = new URL(`${baseUrl}/api/og`)
ogImageUrl.searchParams.append("title", "StoryMaker")
ogImageUrl.searchParams.append("subtitle", "Create magical alphabet stories for children with AI")
ogImageUrl.searchParams.append("type", "home")

export const metadata: Metadata = {
  title: {
    default: "StoryMaker - AI-Generated Alphabet Stories",
    template: "%s | StoryMaker",
  },
  description:
    "Create magical alphabet storybooks for children with AI. Perfect for learning the alphabet in a fun, interactive way.",
  keywords: ["alphabet", "children's stories", "ABC", "learning", "AI stories", "educational"],
  authors: [{ name: "StoryMaker Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://v0-story-maker.vercel.app",
    title: "StoryMaker - AI-Generated Alphabet Stories",
    description: "Create magical alphabet storybooks for children with AI",
    siteName: "StoryMaker",
    images: [
      {
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
        alt: "StoryMaker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StoryMaker - AI-Generated Alphabet Stories",
    description: "Create magical alphabet storybooks for children with AI",
    images: [ogImageUrl.toString()],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          "dark:bg-gradient-to-b dark:from-black dark:to-black/95", // Updated from dark:from-background dark:to-[#0a0a18]
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <MobileNav />
          <main id="main-content" className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

