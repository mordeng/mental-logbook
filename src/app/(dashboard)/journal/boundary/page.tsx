"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { boundaryCheckInSchema, type BoundaryCheckInInput } from "@/lib/validations/boundary"
import { format } from "date-fns"

export default function BoundaryCheckInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoundaryCheckInInput>({
    resolver: zodResolver(boundaryCheckInSchema),
  })

  const wantIt = watch('wantIt')
  const feelsMutual = watch('feelsMutual')
  const nourishOrDrain = watch('nourishOrDrain')

  useEffect(() => {
    loadRecentCheckIns()
  }, [])

  async function loadRecentCheckIns() {
    try {
      const response = await fetch('/api/boundary-checkins?limit=5')
      const data = await response.json()
      if (data.checkIns) {
        setRecentCheckIns(data.checkIns)
        setInsights(data.insights)
      }
    } catch (err) {
      console.error('Failed to load check-ins:', err)
    }
  }

  const onSubmit = async (data: BoundaryCheckInInput) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/boundary-checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || "Failed to save boundary check-in")
        return
      }

      // Success - reload and show success message
      await loadRecentCheckIns()
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendation = () => {
    if (wantIt === undefined || feelsMutual === undefined || !nourishOrDrain) return null

    if (!wantIt) {
      return { text: "💭 Consider saying no if you don't want this", color: "bg-yellow-50 text-yellow-800" }
    }

    if (wantIt && feelsMutual && nourishOrDrain === 'nourish') {
      return { text: "✅ This looks like a healthy boundary!", color: "bg-green-50 text-green-800" }
    }

    if (wantIt && !feelsMutual) {
      return { text: "⚠️ Be cautious - it might not feel mutual", color: "bg-orange-50 text-orange-800" }
    }

    if (nourishOrDrain === 'drain') {
      return { text: "🛑 Consider if this aligns with your energy", color: "bg-red-50 text-red-800" }
    }

    return { text: "🤔 Take time to reflect on this decision", color: "bg-blue-50 text-blue-800" }
  }

  const recommendation = getRecommendation()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Boundary Check-In</h1>
        <p className="text-muted-foreground">
          Pause and reflect before making commitments
        </p>
      </div>

      {insights && insights.drainCount > insights.nourishCount && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>Pattern noticed:</strong> {insights.drainPercentage}% of your recent decisions felt draining. Consider being more selective.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>New Boundary Assessment</CardTitle>
          <CardDescription>
            Answer these questions to help you decide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="situation">Situation / Decision</Label>
              <Textarea
                id="situation"
                placeholder="Describe the situation or commitment you're considering..."
                rows={4}
                {...register("situation")}
              />
              {errors.situation && (
                <p className="text-sm text-red-500">{errors.situation.message}</p>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Three Key Questions</h3>

              <div className="space-y-2">
                <Label>1. Do I want this?</Label>
                <Select onValueChange={(value) => setValue('wantIt', value === 'true')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✅ Yes</SelectItem>
                    <SelectItem value="false">❌ No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.wantIt && (
                  <p className="text-sm text-red-500">{errors.wantIt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>2. Does it feel mutual?</Label>
                <Select onValueChange={(value) => setValue('feelsMutual', value === 'true')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✅ Yes</SelectItem>
                    <SelectItem value="false">❌ No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.feelsMutual && (
                  <p className="text-sm text-red-500">{errors.feelsMutual.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>3. Will this nourish or drain me?</Label>
                <Select onValueChange={(value) => setValue('nourishOrDrain', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nourish">🌱 Nourish</SelectItem>
                    <SelectItem value="unsure">🤔 Unsure</SelectItem>
                    <SelectItem value="drain">⚡ Drain</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nourishOrDrain && (
                  <p className="text-sm text-red-500">{errors.nourishOrDrain.message}</p>
                )}
              </div>
            </div>

            {recommendation && (
              <div className={`rounded-lg p-4 ${recommendation.color}`}>
                <p className="font-medium">{recommendation.text}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Your Decision</Label>
              <Select onValueChange={(value) => setValue('decision', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="What did you decide?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">✅ Yes, I'll do it</SelectItem>
                  <SelectItem value="no">❌ No, I'll decline</SelectItem>
                  <SelectItem value="postpone">⏸️ I'll decide later</SelectItem>
                </SelectContent>
              </Select>
              {errors.decision && (
                <p className="text-sm text-red-500">{errors.decision.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection">Reflection (Optional)</Label>
              <Textarea
                id="reflection"
                placeholder="Any thoughts about this decision?"
                rows={3}
                {...register("reflection")}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Boundary Check"}
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

      {recentCheckIns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Boundaries</h2>
          {recentCheckIns.map((checkIn) => (
            <Card key={checkIn.id}>
              <CardContent className="py-4">
                <div className="mb-2 flex items-start justify-between">
                  <p className="font-medium">{checkIn.situation}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(checkIn.date), "MMM d")}
                  </span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span>Want: {checkIn.wantIt ? '✅' : '❌'}</span>
                  <span>Mutual: {checkIn.feelsMutual ? '✅' : '❌'}</span>
                  <span>
                    {checkIn.nourishOrDrain === 'nourish' ? '🌱 Nourish' :
                     checkIn.nourishOrDrain === 'drain' ? '⚡ Drain' : '🤔 Unsure'}
                  </span>
                  <span className="font-semibold">
                    → {checkIn.decision === 'yes' ? '✅ Yes' :
                        checkIn.decision === 'no' ? '❌ No' : '⏸️ Postponed'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
