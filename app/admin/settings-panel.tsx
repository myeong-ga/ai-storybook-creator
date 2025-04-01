"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface SettingsPanelProps {
  initialSettings: {
    ALPHABET_LETTERS_COUNT: number
    SUBMISSIONS_HALTED: boolean
  }
}

export default function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const { toast } = useToast()
  const [alphabetLettersCount, setAlphabetLettersCount] = useState(initialSettings.ALPHABET_LETTERS_COUNT)
  const [submissionsHalted, setSubmissionsHalted] = useState(initialSettings.SUBMISSIONS_HALTED)
  const [isSaving, setIsSaving] = useState(false)

  // Update the handleSaveSettings function to handle auth errors
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // First check if still authenticated
      const authCheck = await fetch("/api/admin/check-auth")
      if (!authCheck.ok) {
        toast({
          title: "Authentication Error",
          description: "Your admin session has expired. Please log in again.",
          variant: "destructive",
        })
        // Redirect to admin login
        window.location.href = "/admin"
        return
      }

      // Save alphabet letters count
      const alphabetResponse = await fetch(`/api/settings?adminPassword=${process.env.ADMIN_PASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "ALPHABET_LETTERS_COUNT",
          value: alphabetLettersCount,
        }),
      })

      if (!alphabetResponse.ok) {
        const data = await alphabetResponse.json()
        throw new Error(data.error || "Failed to save alphabet settings")
      }

      // Save submissions halted setting
      const haltedResponse = await fetch(`/api/settings?adminPassword=${process.env.ADMIN_PASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "SUBMISSIONS_HALTED",
          value: submissionsHalted,
        }),
      })

      if (!haltedResponse.ok) {
        const data = await haltedResponse.json()
        throw new Error(data.error || "Failed to save submission settings")
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">Application Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="alphabet-letters-count">Alphabet Letters Count</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="alphabet-letters-count"
              type="number"
              min="1"
              max="26"
              value={alphabetLettersCount}
              onChange={(e) => setAlphabetLettersCount(Number.parseInt(e.target.value) || 8)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              Number of alphabet letters to include in each story (A-
              {alphabetLettersCount > 0 && alphabetLettersCount <= 26
                ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[alphabetLettersCount - 1]
                : "?"}
              )
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This setting affects newly created stories. Existing stories will not be changed.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="submissions-halted" className="text-base">
                Halt New Story Submissions
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, users will not be able to create new stories due to high demand
              </p>
            </div>
            <Switch
              id="submissions-halted"
              checked={submissionsHalted}
              onCheckedChange={setSubmissionsHalted}
              aria-label="Halt new story submissions"
            />
          </div>
          {submissionsHalted && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
              ⚠️ New story submissions are currently halted. Users will see a message explaining that submissions are
              temporarily unavailable.
            </div>
          )}
        </div>

        <Button onClick={handleSaveSettings} disabled={isSaving} className="mt-4">
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

