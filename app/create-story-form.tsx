"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Wand2, AlertTriangle } from "lucide-react"
import { createStoryAction } from "./actions"
import { useFormStatus } from "react-dom"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Add submissionsHalted prop
interface CreateStoryFormProps {
  submissionsHalted?: boolean
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className="w-full text-lg py-6 rounded-xl relative overflow-hidden group"
    >
      {pending ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Creating your ABC story...
        </span>
      ) : (
        <>
          <span className="relative z-10 flex items-center justify-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Create My ABC Story
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </>
      )}
    </Button>
  )
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export default function CreateStoryForm({ submissionsHalted = false }: CreateStoryFormProps) {
  const [titleValue, setTitleValue] = useState("")
  const [promptValue, setPromptValue] = useState("")
  const [ageRange, setAgeRange] = useState([3, 8])
  const [errors, setErrors] = useState({
    title: "",
  })
  const [alphabetLettersCount, setAlphabetLettersCount] = useState(8)

  // Fetch the alphabet letters count from the API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings?key=ALPHABET_LETTERS_COUNT")
        if (response.ok) {
          const data = await response.json()
          if (data.value !== undefined) {
            setAlphabetLettersCount(data.value)
          }
        }
      } catch (error) {
        console.error("Error fetching alphabet letters count:", error)
      }
    }

    fetchSettings()
  }, [])

  const handleAgeRangeChange = (value: number[]) => {
    setAgeRange(value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't submit if submissions are halted
    if (submissionsHalted) {
      return
    }

    // Validate form
    const newErrors = {
      title: titleValue.trim() === "" ? "Title is required" : "",
    }

    setErrors(newErrors)

    // If no errors, submit the form
    if (Object.values(newErrors).every((error) => error === "")) {
      const formData = new FormData(e.currentTarget)
      createStoryAction(formData)
    }
  }

  // Show alert when submissions are halted
  if (submissionsHalted) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="border-2 border-destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Submissions Temporarily Halted</AlertTitle>
          <AlertDescription>
            Due to high demand, we've temporarily paused new story submissions. Please check back later!
          </AlertDescription>
        </Alert>

        <div className="p-6 border-2 border-muted rounded-xl bg-muted/30">
          <h3 className="text-lg font-medium mb-4">While you wait...</h3>
          <p className="mb-4">You can still browse and enjoy existing stories in our library!</p>
          <Button asChild className="w-full">
            <a href="/stories">Browse Stories</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg">
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Story Title
          </span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Max's Alphabet Adventure"
          required
          aria-required="true"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`border-2 ${errors.title ? "border-red-400" : "border-primary/20"} text-xl py-6 px-4 rounded-xl transition-all duration-200 focus-visible:ring-purple-400 focus-visible:border-purple-400 focus-visible:ring-offset-2`}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
        {errors.title && (
          <p id="title-error" className="text-red-500 text-sm mt-1">
            {errors.title}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-lg">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Story Theme <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
          </span>
        </Label>
        <Textarea
          id="prompt"
          name="prompt"
          placeholder="A child exploring a magical forest and making new friends..."
          className="min-h-20 border-2 border-primary/20 text-lg rounded-xl transition-all duration-200 focus-visible:ring-purple-400 focus-visible:border-purple-400 focus-visible:ring-offset-2"
          value={promptValue}
          onChange={(e) => setPromptValue(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Your story will include {alphabetLettersCount} letters of the alphabet (A-{ALPHABET[alphabetLettersCount - 1]}
          )
        </p>
      </div>

      {/* Simplified Age Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Age Range: {ageRange[0]}-{ageRange[1]} years
          </span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <Slider defaultValue={[3, 8]} min={2} max={12} step={1} value={ageRange} onValueChange={handleAgeRangeChange} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Younger (2)</span>
          <span>Older (12)</span>
        </div>
      </div>

      {/* Hidden age field with value from slider */}
      <input type="hidden" name="age" value={`${ageRange[0]}-${ageRange[1]}`} />

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="visibility" className="text-base">
            Unlisted Story
          </Label>
          <p className="text-xs text-muted-foreground">
            Unlisted stories won't appear in public listings but can be shared via direct link
          </p>
        </div>
        <Switch id="visibility" name="visibility" value="unlisted" aria-label="Make story unlisted" />
      </div>

      <SubmitButton disabled={submissionsHalted} />
    </form>
  )
}

