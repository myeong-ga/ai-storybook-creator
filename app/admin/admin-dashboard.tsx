"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminLogout, deleteStoryAction, deleteAllStoriesAction } from "./actions"
import { Trash2, LogOut, RefreshCw, BookOpen, Clock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SettingsPanel from "./settings-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Story {
  id: string
  title: string
  status: string
  createdAt: string
  previewImage?: string
  visibility: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deletingStory, setDeletingStory] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [settings, setSettings] = useState({ ALPHABET_LETTERS_COUNT: 8, SUBMISSIONS_HALTED: false })
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "unlisted">("all")

  const fetchStories = async () => {
    setLoading(true)
    try {
      // Check if still authenticated
      const response = await fetch("/api/admin/check-auth")
      if (!response.ok) {
        // If not authenticated, redirect to admin login
        router.push("/admin")
        return
      }

      const storiesResponse = await fetch("/api/stories?includeUnlisted=true")
      if (!storiesResponse.ok) throw new Error("Failed to fetch stories")

      const data = await storiesResponse.json()

      // Apply visibility filter
      let filteredStories = data.stories || []
      if (visibilityFilter !== "all") {
        filteredStories = filteredStories.filter((story: any) => story.visibility === visibilityFilter)
      }

      setStories(filteredStories)
    } catch (error) {
      console.error("Error fetching stories:", error)
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true)
      try {
        const response = await fetch("/api/settings/all")
        if (response.ok) {
          const data = await response.json()
          const settings = data.settings
          setSettings({
            ALPHABET_LETTERS_COUNT: settings.ALPHABET_LETTERS_COUNT,
            SUBMISSIONS_HALTED: settings.SUBMISSIONS_HALTED,
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchStories()
    fetchSettings()
  }, [refreshKey, toast, router])

  useEffect(() => {
    fetchStories()
  }, [visibilityFilter, refreshKey])

  const handleLogout = async () => {
    await adminLogout()
    router.refresh()
  }

  const confirmDeleteStory = (storyId: string) => {
    setStoryToDelete(storyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteStory = async () => {
    if (!storyToDelete) return

    setDeletingStory(storyToDelete)
    setDeleteDialogOpen(false)

    try {
      const formData = new FormData()
      formData.append("storyId", storyToDelete)

      const result = await deleteStoryAction(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Refresh the story list
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the story",
        variant: "destructive",
      })
    } finally {
      setDeletingStory(null)
      setStoryToDelete(null)
    }
  }

  const handleDeleteAllStories = async () => {
    setDeleteAllDialogOpen(false)

    try {
      setLoading(true)
      const result = await deleteAllStoriesAction()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Refresh the story list
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting all stories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleManualCleanup = async () => {
    try {
      setLoading(true)
      toast({
        title: "Cleanup Started",
        description: "Cleaning up timed out stories...",
      })

      const response = await fetch(`/api/cron/cleanup?cronSecret=${encodeURIComponent(process.env.CRON_SECRET || "")}`)

      if (!response.ok) {
        throw new Error("Failed to run cleanup")
      }

      const result = await response.json()

      toast({
        title: "Cleanup Complete",
        description: result.message || "Cleanup completed successfully",
      })

      console.log("Cleanup results:", result)

      // Refresh the story list
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run cleanup",
        variant: "destructive",
      })
      console.error("Cleanup error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCleanup}
            disabled={loading}
            title="Clean up timed out stories"
          >
            <Clock className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-muted-foreground">
                {loading ? "Loading stories..." : `${stories.length} stories found`}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Filter:</span>
                <Select
                  value={visibilityFilter}
                  onValueChange={(value) => setVisibilityFilter(value as "all" | "public" | "unlisted")}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading || stories.length === 0}
              onClick={() => setDeleteAllDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Stories
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stories.length === 0 ? (
            <Card className="border-2 border-primary/20 shadow-lg rounded-xl">
              <CardContent className="pt-6 text-center py-12">
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-primary/30" />
                </div>
                <h2 className="text-xl font-bold mb-4">No Stories Found</h2>
                <p className="text-muted-foreground mb-6">There are no stories in the database.</p>
                <Link href="/">
                  <Button>Go to Homepage</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stories.map((story) => (
                <Card key={story.id} className="border border-primary/10 shadow overflow-hidden rounded-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-32 md:w-48 bg-gray-100">
                      {story.previewImage ? (
                        <Image
                          src={story.previewImage || "/placeholder.svg"}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">ID: {story.id}</p>
                          <p className="text-sm text-muted-foreground">Created: {formatDate(story.createdAt)}</p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                story.status === "complete"
                                  ? "bg-green-100 text-green-800"
                                  : story.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {story.status}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                                story.visibility === "unlisted"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {story.visibility === "unlisted" ? (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Unlisted
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/story/${story.id}`} target="_blank">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingStory === story.id}
                            onClick={() => confirmDeleteStory(story.id)}
                          >
                            {deletingStory === story.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {loadingSettings ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SettingsPanel
              initialSettings={{
                ALPHABET_LETTERS_COUNT: settings.ALPHABET_LETTERS_COUNT,
                SUBMISSIONS_HALTED: settings.SUBMISSIONS_HALTED,
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Single Story Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStory} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Stories Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all {stories.length} stories from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllStories} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Delete All Stories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

