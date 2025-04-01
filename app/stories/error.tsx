"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="pl-0 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                Back to Home
              </span>
            </Button>
          </Link>
        </div>

        <Card className="border-2 border-red-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Something went wrong!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">We encountered an error while trying to load the stories.</p>
            <Button onClick={reset} className="mr-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">Go to homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

