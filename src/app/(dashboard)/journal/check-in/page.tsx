"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { dailyCheckInSchema, type DailyCheckInInput } from "@/lib/validations/check-in"

const emotionalNeedOptions = [
  { value: 'emotional_closeness', label: 'Emotional closeness' },
  { value: 'intellectual_stimulation', label: 'Intellectual stimulation' },
  { value: 'shared_purpose', label: 'Shared purpose/teamwork' },
  { value: 'physical_presence', label: 'Physical presence' },
  { value: 'rest_alone_time', label: 'Rest/alone time' },
  { value: 'other', label: 'Other' },
] as const

export default function DailyCheckInPage() {
  const router = useRouter()
  const [moodRating, setMoodRating] = useState([5])
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set())
  const [customNeed, setCustomNeed] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    // Removed resolver - we'll validate manually
  })

  // Log errors whenever they change
  useEffect(() => {
    console.log('Form errors:', errors)
  }, [errors])

  // Load today's check-in if it exists
  useEffect(() => {
    async function loadTodayCheckIn() {
      try {
        const response = await fetch('/api/check-ins/today')
        const data = await response.json()
        if (data.checkIn) {
          setExistingCheckIn(data.checkIn)
          setMoodRating([data.checkIn.moodRating])
          setValue('feelingText', data.checkIn.feelingText)
          setValue('needText', data.checkIn.needText)
          const needs = new Set<string>(data.checkIn.emotionalNeeds.map((n: any) => n.needType))
          setSelectedNeeds(needs)
          const other = data.checkIn.emotionalNeeds.find((n: any) => n.needType === 'other')
          if (other?.customNeed) {
            setCustomNeed(other.customNeed)
          }
        }
      } catch (err) {
        console.error('Failed to load today check-in:', err)
      }
    }
    loadTodayCheckIn()
  }, [setValue])

  const toggleNeed = (needType: string) => {
    const newNeeds = new Set(selectedNeeds)
    if (newNeeds.has(needType)) {
      newNeeds.delete(needType)
    } else {
      newNeeds.add(needType)
    }
    setSelectedNeeds(newNeeds)
  }

  const onSubmit = async (data: { feelingText: string; needText: string }) => {
    console.log('=== FORM SUBMIT CALLED ===')
    console.log('Form data:', data)
    console.log('Mood rating:', moodRating)
    console.log('Selected needs:', Array.from(selectedNeeds))
    console.log('Custom need:', customNeed)

    if (selectedNeeds.size === 0) {
      console.log('ERROR: No emotional needs selected')
      setError('Please select at least one emotional need')
      return
    }

    setIsLoading(true)
    setError("")
    console.log('Starting API call...')

    try {
      const emotionalNeeds = Array.from(selectedNeeds).map(needType => ({
        needType,
        customNeed: needType === 'other' ? customNeed : undefined,
      }))

      const payload = {
        moodRating: moodRating[0],
        feelingText: data.feelingText,
        needText: data.needText,
        emotionalNeeds,
      }
      console.log('API payload:', payload)

      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const result = await response.json()
        console.log('API error response:', result)
        setError(result.error || "Failed to save check-in")
        setIsLoading(false)
        return
      }

      const result = await response.json()
      console.log('API success response:', result)

      // Success - redirect to dashboard
      console.log('Redirecting to dashboard...')
      router.push("/dashboard?checkin=success")
      router.refresh()
    } catch (err) {
      console.error('Check-in error:', err)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Daily Check-In</h1>
        <p className="text-muted-foreground">
          {existingCheckIn ? "Update today's check-in" : "How are you feeling today?"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>5-Minute Emotional Check</CardTitle>
          <CardDescription>
            Take a moment to reflect on your current state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            console.log('FORM ONSUBMIT EVENT TRIGGERED')
            e.preventDefault()
            handleSubmit(onSubmit)(e)
          }} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">
                  Mood Rating: <span className="font-bold text-2xl">{moodRating[0]}</span>/10
                </Label>
                <Slider
                  value={moodRating}
                  onValueChange={setMoodRating}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feelingText">How do I feel right now?</Label>
                <Textarea
                  id="feelingText"
                  placeholder="Describe your feelings..."
                  rows={4}
                  {...register("feelingText")}
                />
                {errors.feelingText && (
                  <p className="text-sm text-red-500">{errors.feelingText.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="needText">What do I need today?</Label>
                <Textarea
                  id="needText"
                  placeholder="Describe what you need..."
                  rows={4}
                  {...register("needText")}
                />
                {errors.needText && (
                  <p className="text-sm text-red-500">{errors.needText.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base">Emotional Needs (select all that apply)</Label>
                {emotionalNeedOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedNeeds.has(option.value)}
                      onCheckedChange={() => toggleNeed(option.value)}
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}

                {selectedNeeds.has('other') && (
                  <div className="ml-6 mt-2">
                    <Input
                      placeholder="Specify other need..."
                      value={customNeed}
                      onChange={(e) => setCustomNeed(e.target.value)}
                    />
                  </div>
                )}

                {selectedNeeds.size === 0 && error.includes('emotional need') && (
                  <p className="text-sm text-red-500">Please select at least one emotional need</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
                onClick={() => console.log('BUTTON CLICKED - Type: submit')}
              >
                {isLoading ? "Saving..." : existingCheckIn ? "Update Check-In" : "Save Check-In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
