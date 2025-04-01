"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Heart, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Stories",
      href: "/stories",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "Create",
      href: "/#create-story",
      icon: <Plus className="h-5 w-5" />,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
            aria-current={pathname === item.href ? "page" : undefined}
            aria-label={item.name}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

