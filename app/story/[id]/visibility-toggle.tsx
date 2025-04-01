"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateStoryVisibilityAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

interface VisibilityToggleProps {
  storyId: string
  initialVisibility: "public" | "unlisted"
}

export function VisibilityToggle({ storyId, initialVisibility }: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState<"public" | "unlisted">(initialVisibility)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleToggle = async (checked: boolean) => {
    const newVisibility = checked ? "unlisted" : "public"
    setIsUpdating(true)

    try {
      const formData = new FormData()
      formData.append("storyId", storyId)
      formData.append("visibility", newVisibility)

      const result = await updateStoryVisibilityAction(formData)

      if (result.success) {
        setVisibility(newVisibility)
        toast({
          title: "Visibility updated",
          description: `Story is now ${newVisibility === "public" ? "public" : "unlisted"}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update visibility",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating visibility",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {isUpdating ? (
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : visibility === "public" ? (
        <Eye className="h-4 w-4 text-muted-foreground" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
      <div className="flex items-center space-x-2">
        <Switch
          id="visibility-toggle"
          checked={visibility === "unlisted"}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          aria-label={visibility === "public" ? "Make story unlisted" : "Make story public"}
        />
        <Label htmlFor="visibility-toggle" className="text-sm cursor-pointer">
          {visibility === "public" ? "Public" : "Unlisted"}
        </Label>
      </div>
    </div>
  )
}

