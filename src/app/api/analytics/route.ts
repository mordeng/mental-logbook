import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, startOfWeek, subWeeks, format } from "date-fns"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = req.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")

    // Calculate date range
    const endDate = startOfDay(new Date())
    const startDate = subDays(endDate, days)

    // Fetch daily check-ins
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
      include: { emotionalNeeds: true },
    })

    // Calculate mood timeline
    const moodTimeline = checkIns.map((checkIn) => ({
      date: format(checkIn.date, "MMM dd"),
      mood: checkIn.moodRating,
    }))

    // Calculate streak (consecutive days with check-ins)
    let currentStreak = 0
    let checkDate = new Date()
    const checkInDates = new Set(
      checkIns.map((c) => format(c.date, "yyyy-MM-dd"))
    )

    while (checkInDates.has(format(checkDate, "yyyy-MM-dd"))) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    }

    // Calculate mood statistics
    const moodValues = checkIns.map((c) => c.moodRating)
    const avgMood =
      moodValues.length > 0
        ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
        : 0

    // Emotional needs distribution
    const needsCount: Record<string, number> = {}
    checkIns.forEach((checkIn) => {
      checkIn.emotionalNeeds.forEach((need) => {
        const needType = need.customNeed || need.needType
        needsCount[needType] = (needsCount[needType] || 0) + 1
      })
    })

    const emotionalNeedsDistribution = Object.entries(needsCount).map(
      ([name, value]) => ({ name, value })
    )

    // Activity heatmap (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = format(date, "yyyy-MM-dd")
      return {
        date: format(date, "EEE"),
        checkIn: checkInDates.has(dateStr) ? 1 : 0,
      }
    })

    return NextResponse.json({
      overview: {
        totalCheckIns: checkIns.length,
        currentStreak,
        avgMood: Math.round(avgMood * 10) / 10,
        totalFFNLogs: 0,
        totalBoundaries: 0,
      },
      moodTimeline,
      emotionalNeedsDistribution,
      weeklyConnection: {
        completionRate: 0,
        completedWeeks: 0,
        totalWeeks: 0,
        avgMoodImprovement: 0,
      },
      ffnStats: {
        successRate: 0,
        successful: 0,
        total: 0,
      },
      boundaryStats: {
        decisions: { yes: 0, no: 0, postpone: 0 },
        drainPercentage: 0,
        draining: 0,
        nourishing: 0,
      },
      joyStats: {
        completionRate: 0,
        completed: 0,
        total: 0,
        avgRating: 0,
      },
      activityHeatmap: last7Days.map(day => ({
        ...day,
        ffn: 0,
        boundary: 0,
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
