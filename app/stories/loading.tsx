import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90">
      <div className="max-w-6xl mx-auto px-4 py-12 md:px-8">
        {/* Header Section Skeleton */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Title Section Skeleton */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <Skeleton className="h-16 w-16 rounded-full mb-6" />
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>

        {/* Search Section Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-md mx-auto mb-4" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>

        {/* Stories Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30"
              >
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

