"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ffnLogSchema, type FFNLogInput } from "@/lib/validations/ffn"
import Link from "next/link"

export default function FFNLogPage() {
  const router = useRouter()
  const [afterMood, setAfterMood] = useState([5])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [contacts, setContacts] = useState<string[]>([])
  const [showContactInput, setShowContactInput] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FFNLogInput>({
    resolver: zodResolver(ffnLogSchema),
  })

  const selectedContact = watch('contactName')

  // Load recent contacts for autocomplete
  useEffect(() => {
    async function loadContacts() {
      try {
        const response = await fetch('/api/ffn-logs/contacts')
        const data = await response.json()
        if (data.contacts) {
          setContacts(data.contacts)
        }
      } catch (err) {
        console.error('Failed to load contacts:', err)
      }
    }
    loadContacts()
  }, [])

  const onSubmit = async (data: Omit<FFNLogInput, 'afterMood'>) => {
    setIsLoading(true)
    setError("")

    try {
      const payload = {
        ...data,
        afterMood: data.afterFeeling ? afterMood[0] : undefined,
      }

      const response = await fetch("/api/ffn-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || "Failed to save FFN log")
        return
      }

      // Success - redirect to history
      router.push("/journal/ffn/history?created=true")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FFN Communication Log</h1>
          <p className="text-muted-foreground">
            Track your communication using Fact → Feeling → Need
          </p>
        </div>
        <Link href="/journal/ffn/history">
          <Button variant="outline">View History</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Communication Entry</CardTitle>
          <CardDescription>
            Document a communication attempt and its outcome
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contactName">Who did you reach out to?</Label>
              {!showContactInput && contacts.length > 0 ? (
                <div className="space-y-2">
                  <Select
                    value={selectedContact}
                    onValueChange={(value) => {
                      if (value === '__new__') {
                        setShowContactInput(true)
                      } else {
                        setValue('contactName', value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact} value={contact}>
                          {contact}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">+ Add new contact</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContactInput(true)}
                  >
                    Or type new name
                  </Button>
                </div>
              ) : (
                <Input
                  id="contactName"
                  placeholder="Name or relationship (e.g., Mom, John, Friend)"
                  {...register("contactName")}
                />
              )}
              {errors.contactName && (
                <p className="text-sm text-red-500">{errors.contactName.message}</p>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Your FFN Statement</h3>

              <div className="space-y-2">
                <Label htmlFor="fact">Fact: What happened?</Label>
                <Textarea
                  id="fact"
                  placeholder='Example: "We haven\'t spoken in a while."'
                  rows={3}
                  {...register("fact")}
                />
                {errors.fact && (
                  <p className="text-sm text-red-500">{errors.fact.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeling">Feeling: How it made you feel</Label>
                <Textarea
                  id="feeling"
                  placeholder='Example: "I feel disconnected."'
                  rows={3}
                  {...register("feeling")}
                />
                {errors.feeling && (
                  <p className="text-sm text-red-500">{errors.feeling.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="need">Need: What you need</Label>
                <Textarea
                  id="need"
                  placeholder='Example: "I\'d like us to check in more often."'
                  rows={3}
                  {...register("need")}
                />
                {errors.need && (
                  <p className="text-sm text-red-500">{errors.need.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Response & Outcome (Optional)</h3>

              <div className="space-y-2">
                <Label htmlFor="response">Their response</Label>
                <Textarea
                  id="response"
                  placeholder="How did they respond?"
                  rows={3}
                  {...register("response")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterFeeling">How you felt afterward</Label>
                <Textarea
                  id="afterFeeling"
                  placeholder="Describe your feelings after the conversation"
                  rows={3}
                  {...register("afterFeeling")}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  After-conversation mood: <span className="font-bold text-2xl">{afterMood[0]}</span>/10
                </Label>
                <Slider
                  value={afterMood}
                  onValueChange={setAfterMood}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Worse</span>
                  <span>Better</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successRating">Overall rating</Label>
                <Select
                  onValueChange={(value) => setValue('successRating', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did it go?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">✅ Successful</SelectItem>
                    <SelectItem value="neutral">➖ Neutral</SelectItem>
                    <SelectItem value="difficult">⚠️ Difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Entry"}
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
