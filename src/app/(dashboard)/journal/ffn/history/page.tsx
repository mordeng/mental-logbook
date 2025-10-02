"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

type FFNLog = {
  id: string
  date: string
  contactName: string
  fact: string
  feeling: string
  need: string
  response?: string
  afterFeeling?: string
  afterMood?: number
  successRating?: string
}

function HistoryContent() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<FFNLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState<string>("all")

  const created = searchParams.get("created")

  useEffect(() => {
    loadLogs()
  }, [filterRating])

  async function loadLogs() {
    try {
      const params = new URLSearchParams()
      if (filterRating !== "all") {
        params.append("successRating", filterRating)
      }

      const response = await fetch(`/api/ffn-logs?${params}`)
      const data = await response.json()
      if (data.logs) {
        setLogs(data.logs)
      }
    } catch (err) {
      console.error("Failed to load logs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.feeling.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.need.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRatingBadge = (rating?: string) => {
    if (!rating) return null
    const badges = {
      successful: <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">✅ Successful</span>,
      neutral: <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">➖ Neutral</span>,
      difficult: <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">⚠️ Difficult</span>,
    }
    return badges[rating as keyof typeof badges]
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FFN Communication History</h1>
          <p className="text-muted-foreground">Review your past communications</p>
        </div>
        <Link href="/journal/ffn">
          <Button>New Entry</Button>
        </Link>
      </div>

      {created && (
        <div className="mb-4 rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">
            ✓ FFN entry saved successfully!
          </p>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search by contact, fact, feeling, or need..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="successful">Successful</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="difficult">Difficult</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || filterRating !== "all"
                ? "No entries match your filters"
                : "No FFN entries yet. Create your first one!"}
            </p>
            {!searchTerm && filterRating === "all" && (
              <Link href="/journal/ffn">
                <Button className="mt-4">Create First Entry</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{log.contactName}</CardTitle>
                    <CardDescription>
                      {format(new Date(log.date), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  {getRatingBadge(log.successRating)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Fact</p>
                  <p className="text-sm">{log.fact}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Feeling</p>
                  <p className="text-sm">{log.feeling}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Need</p>
                  <p className="text-sm">{log.need}</p>
                </div>

                {log.response && (
                  <>
                    <hr className="my-3" />
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Their Response</p>
                      <p className="text-sm">{log.response}</p>
                    </div>
                  </>
                )}

                {log.afterFeeling && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">How You Felt Afterward</p>
                    <p className="text-sm">{log.afterFeeling}</p>
                    {log.afterMood && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Mood: {log.afterMood}/10
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FFNHistoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  )
}
