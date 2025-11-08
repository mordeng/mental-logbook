"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, TrendingUp, Heart, Users, Shield, Smile, Download, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"

interface DailyCheckIn {
  id: string
  date: string
  moodRating: number
  feelingText: string
  needText: string
  emotionalNeeds: Array<{
    needType: string
    customNeed: string | null
  }>
}

interface AnalyticsData {
  overview: {
    totalCheckIns: number
    currentStreak: number
    avgMood: number
    totalFFNLogs: number
    totalBoundaries: number
  }
  moodTimeline: Array<{ date: string; mood: number }>
  emotionalNeedsDistribution: Array<{ name: string; value: number }>
  weeklyConnection: {
    completionRate: number
    completedWeeks: number
    totalWeeks: number
    avgMoodImprovement: number
  }
  ffnStats: {
    successRate: number
    successful: number
    total: number
  }
  boundaryStats: {
    decisions: { yes: number; no: number; postpone: number }
    drainPercentage: number
    draining: number
    nourishing: number
  }
  joyStats: {
    completionRate: number
    completed: number
    total: number
    avgRating: number
  }
  activityHeatmap: Array<{
    date: string
    checkIn: number
    ffn: number
    boundary: number
  }>
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"]

export default function StatsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [showAllCheckIns, setShowAllCheckIns] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    fetchCheckIns()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/analytics?days=${days}`)
      if (res.ok) {
        const analytics = await res.json()
        setData(analytics)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckIns = async () => {
    try {
      setCheckInsLoading(true)
      const res = await fetch(`/api/check-ins?limit=100`)
      if (res.ok) {
        const data = await res.json()
        setCheckIns(data.checkIns || [])
      }
    } catch (error) {
      console.error("Failed to fetch check-ins:", error)
    } finally {
      setCheckInsLoading(false)
    }
  }

  const exportData = async () => {
    if (!data) return

    const exportContent = {
      generatedAt: new Date().toISOString(),
      period: `Last ${days} days`,
      ...data,
    }

    const blob = new Blob([JSON.stringify(exportContent, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mental-logbook-stats-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
          <p className="text-muted-foreground">Loading your insights...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
          <p className="text-muted-foreground">No data available yet. Start logging to see insights!</p>
        </div>
      </div>
    )
  }

  const boundaryDecisionData = [
    { name: "Yes", value: data.boundaryStats?.decisions?.yes || 0, color: "#10b981" },
    { name: "No", value: data.boundaryStats?.decisions?.no || 0, color: "#ef4444" },
    { name: "Postpone", value: data.boundaryStats?.decisions?.postpone || 0, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your mental health journey
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-Ins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalCheckIns}</div>
            <p className="text-xs text-muted-foreground">entries logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.currentStreak}</div>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mood</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgMood}/10</div>
            <p className="text-xs text-muted-foreground">overall rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalFFNLogs || 0}</div>
            <p className="text-xs text-muted-foreground">FFN logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boundaries</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalBoundaries || 0}</div>
            <p className="text-xs text-muted-foreground">decisions made</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Timeline */}
      {data.moodTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mood Timeline</CardTitle>
            <CardDescription>Your daily mood over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.moodTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Emotional Needs Distribution */}
        {data.emotionalNeedsDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Emotional Needs</CardTitle>
              <CardDescription>What you need most</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.emotionalNeedsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.emotionalNeedsDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Weekly Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity This Week</CardTitle>
            <CardDescription>Daily tracking overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.activityHeatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkIn" fill="#8b5cf6" name="Check-ins" />
                <Bar dataKey="ffn" fill="#ec4899" name="FFN Logs" />
                <Bar dataKey="boundary" fill="#10b981" name="Boundaries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Connection Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Weekly Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">
                {data.weeklyConnection?.completionRate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">completion rate</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{data.weeklyConnection?.completedWeeks || 0}</span> of{" "}
                <span className="font-medium">{data.weeklyConnection?.totalWeeks || 0}</span> weeks
                completed
              </p>
              <p className="text-sm">
                Avg mood change:{" "}
                <span
                  className={`font-medium ${
                    (data.weeklyConnection?.avgMoodImprovement || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(data.weeklyConnection?.avgMoodImprovement || 0) > 0 ? "+" : ""}
                  {data.weeklyConnection?.avgMoodImprovement || 0}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FFN Communication Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              FFN Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{data.ffnStats?.successRate || 0}%</div>
              <p className="text-sm text-muted-foreground">success rate</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium text-green-600">
                  {data.ffnStats?.successful || 0}
                </span>{" "}
                successful communications
              </p>
              <p className="text-sm text-muted-foreground">
                out of {data.ffnStats?.total || 0} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Boundary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Boundary Decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{data.boundaryStats?.drainPercentage || 0}%</div>
              <p className="text-sm text-muted-foreground">situations drain you</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium text-green-600">
                  {data.boundaryStats?.decisions?.yes || 0}
                </span>{" "}
                yes,{" "}
                <span className="font-medium text-red-600">
                  {data.boundaryStats?.decisions?.no || 0}
                </span>{" "}
                no,{" "}
                <span className="font-medium text-amber-600">
                  {data.boundaryStats?.decisions?.postpone || 0}
                </span>{" "}
                postponed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Joy Activity Stats */}
        {(data.joyStats?.total || 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5" />
                Joy Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl font-bold">
                  {data.joyStats?.completionRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">completion rate</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{data.joyStats?.completed || 0}</span> of{" "}
                  <span className="font-medium">{data.joyStats?.total || 0}</span> completed
                </p>
                {(data.joyStats?.avgRating || 0) > 0 && (
                  <p className="text-sm">
                    Avg rating:{" "}
                    <span className="font-medium">{data.joyStats?.avgRating || 0}/10</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boundary Decision Breakdown */}
        {boundaryDecisionData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Boundary Decision Breakdown</CardTitle>
              <CardDescription>How you respond to situations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={boundaryDecisionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {boundaryDecisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Check-Ins History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In History
          </CardTitle>
          <CardDescription>Your past daily mood and emotional check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          {checkInsLoading ? (
            <p className="text-sm text-muted-foreground">Loading check-ins...</p>
          ) : checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-ins yet. Start tracking your mood!</p>
          ) : (
            <div className="space-y-4">
              {(showAllCheckIns ? checkIns : checkIns.slice(0, 10)).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {format(new Date(checkIn.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Mood:</span>
                      <span
                        className={`text-2xl font-bold ${
                          checkIn.moodRating >= 8
                            ? "text-green-600"
                            : checkIn.moodRating >= 5
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {checkIn.moodRating}/10
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        How I felt:
                      </p>
                      <p className="text-sm">{checkIn.feelingText}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        What I needed:
                      </p>
                      <p className="text-sm">{checkIn.needText}</p>
                    </div>

                    {checkIn.emotionalNeeds.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Emotional needs:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {checkIn.emotionalNeeds.map((need, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {need.customNeed || need.needType.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {checkIns.length > 10 && (
                <Button
                  onClick={() => setShowAllCheckIns(!showAllCheckIns)}
                  variant="outline"
                  className="w-full"
                >
                  {showAllCheckIns ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Show All ({checkIns.length} total)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
