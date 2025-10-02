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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { connectionActionSchema, type ConnectionActionInput, actionTypeLabels } from "@/lib/validations/weekly-tracker"
import { format } from "date-fns"
import { getWeekStart, getWeekEnd } from "@/lib/date-utils"

type WeeklyTracker = {
  id: string
  weekStartDate: string
  actions: {
    id: string
    actionType: string
    description: string
    beforeMood?: number
    afterMood?: number
    wouldRepeat?: string
    notes?: string
    createdAt: string
  }[]
}

export default function WeeklyTrackerPage() {
  const router = useRouter()
  const [tracker, setTracker] = useState<WeeklyTracker | null>(null)
  const [completion, setCompletion] = useState(0)
  const [beforeMood, setBeforeMood] = useState([5])
  const [afterMood, setAfterMood] = useState([5])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConnectionActionInput>({
    resolver: zodResolver(connectionActionSchema),
  })

  useEffect(() => {
    loadTracker()
  }, [])

  async function loadTracker() {
    try {
      const response = await fetch('/api/weekly-tracker')
      const data = await response.json()
      if (data.tracker) {
        setTracker(data.tracker)
        setCompletion(data.completion)
      }
    } catch (err) {
      console.error('Failed to load tracker:', err)
    }
  }

  const onSubmit = async (data: Omit<ConnectionActionInput, 'beforeMood' | 'afterMood'>) => {
    setIsLoading(true)
    setError("")

    try {
      const payload = {
        ...data,
        beforeMood: beforeMood[0],
        afterMood: afterMood[0],
      }

      const response = await fetch("/api/weekly-tracker/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || "Failed to save action")
        return
      }

      // Success - reload tracker and reset form
      await loadTracker()
      reset()
      setBeforeMood([5])
      setAfterMood([5])
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getActionTypeIcon = (type: string) => {
    const icons = {
      safe_contact: '👥',
      new_context: '🌟',
      vulnerability_step: '💪',
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  const getProgressColor = () => {
    if (completion >= 3) return 'bg-green-500'
    if (completion >= 2) return 'bg-blue-500'
    if (completion >= 1) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Weekly Connection Tracker</h1>
        <p className="text-muted-foreground">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>
      </div>

      {/* Progress Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>This Week's Progress</CardTitle>
          <CardDescription>Goal: 3 social actions per week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-bold">{completion}/3</span>
                <span className="text-sm text-muted-foreground">
                  {completion >= 3 ? '🎉 Complete!' : `${3 - completion} more to go`}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressColor()}`}
                  style={{ width: `${(completion / 3) * 100}%` }}
                />
              </div>
            </div>

            {completion < 3 && !showForm && (
              <Button onClick={() => setShowForm(true)} className="w-full">
                Add Connection Action
              </Button>
            )}

            {completion >= 3 && (
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="font-semibold text-green-800">
                  🎉 Congratulations! You've completed your weekly goal!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Form */}
      {showForm && completion < 3 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Connection Action</CardTitle>
            <CardDescription>
              Document a social interaction you had this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="actionType">Action Type</Label>
                <Select onValueChange={(value) => setValue('actionType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of connection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe_contact">
                      👥 Safe Contact (trusted friend/family)
                    </SelectItem>
                    <SelectItem value="new_context">
                      🌟 New Context (group, class, event)
                    </SelectItem>
                    <SelectItem value="vulnerability_step">
                      💪 Vulnerability Step (share something personal)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.actionType && (
                  <p className="text-sm text-red-500">{errors.actionType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">What did you do?</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your action..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Mood Before: <span className="font-bold text-xl">{beforeMood[0]}</span>/10
                  </Label>
                  <Slider
                    value={beforeMood}
                    onValueChange={setBeforeMood}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Mood After: <span className="font-bold text-xl">{afterMood[0]}</span>/10
                  </Label>
                  <Slider
                    value={afterMood}
                    onValueChange={setAfterMood}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wouldRepeat">Would you do it again?</Label>
                <Select onValueChange={(value) => setValue('wouldRepeat', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">✅ Yes</SelectItem>
                    <SelectItem value="maybe">🤔 Maybe</SelectItem>
                    <SelectItem value="no">❌ No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other thoughts?"
                  rows={3}
                  {...register("notes")}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Action"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions List */}
      {tracker && tracker.actions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">This Week's Actions</h2>
          {tracker.actions.map((action, index) => (
            <Card key={action.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{getActionTypeIcon(action.actionType)}</span>
                      {actionTypeLabels[action.actionType as keyof typeof actionTypeLabels]}
                    </CardTitle>
                    <CardDescription>
                      Action #{index + 1} • {format(new Date(action.createdAt), "MMM d 'at' h:mm a")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{action.description}</p>

                {(action.beforeMood || action.afterMood) && (
                  <div className="flex gap-6 text-sm">
                    {action.beforeMood && (
                      <div>
                        <span className="text-muted-foreground">Before: </span>
                        <span className="font-semibold">{action.beforeMood}/10</span>
                      </div>
                    )}
                    {action.afterMood && (
                      <div>
                        <span className="text-muted-foreground">After: </span>
                        <span className="font-semibold">{action.afterMood}/10</span>
                      </div>
                    )}
                    {action.beforeMood && action.afterMood && (
                      <div>
                        <span className="text-muted-foreground">Change: </span>
                        <span className={action.afterMood > action.beforeMood ? 'text-green-600' : action.afterMood < action.beforeMood ? 'text-red-600' : ''}>
                          {action.afterMood > action.beforeMood ? '↑' : action.afterMood < action.beforeMood ? '↓' : '→'}
                          {Math.abs(action.afterMood - action.beforeMood)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {action.wouldRepeat && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Would repeat: </span>
                    <span className="font-semibold capitalize">{action.wouldRepeat}</span>
                  </div>
                )}

                {action.notes && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="text-muted-foreground">Notes:</p>
                    <p>{action.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tracker && tracker.actions.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No actions logged for this week yet. Get started!
            </p>
            <Button onClick={() => setShowForm(true)}>
              Add First Action
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
