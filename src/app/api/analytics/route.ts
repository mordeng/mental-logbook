import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, startOfWeek, subWeeks, format } from "date-fns"

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

    // Fetch all relevant data in parallel
    const [
      checkIns,
      ffnLogs,
      weeklyTrackers,
      boundaryCheckIns,
      joyActivities,
      meaningGoals,
    ] = await Promise.all([
      // Daily check-ins
      prisma.dailyCheckIn.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
        include: { emotionalNeeds: true },
      }),

      // FFN logs
      prisma.fFNLog.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      }),

      // Weekly trackers
      prisma.weeklyTracker.findMany({
        where: {
          userId,
          weekStartDate: { gte: subWeeks(startDate, 1) },
        },
        include: {
          actions: true,
        },
      }),

      // Boundary check-ins
      prisma.boundaryCheckIn.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      }),

      // Joy activities
      prisma.joyActivity.findMany({
        where: {
          userId,
          weekStartDate: { gte: subWeeks(startDate, 1) },
        },
      }),

      // Meaning goals
      prisma.meaningGoal.findMany({
        where: { userId },
        include: { reflections: true },
      }),
    ])

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

    // Weekly connection stats
    const totalWeeks = weeklyTrackers.length
    const completedWeeks = weeklyTrackers.filter(
      (w) => w.actions.length >= 3
    ).length
    const weeklyCompletionRate =
      totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0

    // Connection mood improvements
    const connectionMoodChanges = weeklyTrackers.flatMap((tracker) =>
      tracker.actions
        .filter((a) => a.beforeMood && a.afterMood)
        .map((a) => ({
          type: a.actionType,
          change: a.afterMood! - a.beforeMood!,
        }))
    )

    const avgMoodImprovement =
      connectionMoodChanges.length > 0
        ? connectionMoodChanges.reduce((sum, c) => sum + c.change, 0) /
          connectionMoodChanges.length
        : 0

    // FFN communication stats
    const ffnSuccessful = ffnLogs.filter(
      (l) => l.successRating === "successful"
    ).length
    const ffnTotal = ffnLogs.length
    const ffnSuccessRate = ffnTotal > 0 ? (ffnSuccessful / ffnTotal) * 100 : 0

    // Boundary stats
    const boundaryDecisions = {
      yes: boundaryCheckIns.filter((b) => b.decision === "yes").length,
      no: boundaryCheckIns.filter((b) => b.decision === "no").length,
      postpone: boundaryCheckIns.filter((b) => b.decision === "postpone").length,
    }

    const drainingSituations = boundaryCheckIns.filter(
      (b) => b.nourishOrDrain === "drain"
    ).length
    const nourishingSituations = boundaryCheckIns.filter(
      (b) => b.nourishOrDrain === "nourish"
    ).length
    const drainPercentage =
      boundaryCheckIns.length > 0
        ? (drainingSituations / boundaryCheckIns.length) * 100
        : 0

    // Joy activity stats
    const joyCompleted = joyActivities.filter((j) => j.completed).length
    const joyTotal = joyActivities.length
    const joyCompletionRate = joyTotal > 0 ? (joyCompleted / joyTotal) * 100 : 0
    const avgJoyRating =
      joyActivities.filter((j) => j.rating).length > 0
        ? joyActivities
            .filter((j) => j.rating)
            .reduce((sum, j) => sum + j.rating!, 0) /
          joyActivities.filter((j) => j.rating).length
        : 0

    // Activity heatmap (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = format(date, "yyyy-MM-dd")
      return {
        date: format(date, "EEE"),
        checkIn: checkInDates.has(dateStr) ? 1 : 0,
        ffn: ffnLogs.filter((l) => format(l.date, "yyyy-MM-dd") === dateStr)
          .length,
        boundary: boundaryCheckIns.filter(
          (b) => format(b.date, "yyyy-MM-dd") === dateStr
        ).length,
      }
    })

    return NextResponse.json({
      overview: {
        totalCheckIns: checkIns.length,
        currentStreak,
        avgMood: Math.round(avgMood * 10) / 10,
        totalFFNLogs: ffnLogs.length,
        totalBoundaries: boundaryCheckIns.length,
      },
      moodTimeline,
      emotionalNeedsDistribution,
      weeklyConnection: {
        completionRate: Math.round(weeklyCompletionRate),
        completedWeeks,
        totalWeeks,
        avgMoodImprovement: Math.round(avgMoodImprovement * 10) / 10,
      },
      ffnStats: {
        successRate: Math.round(ffnSuccessRate),
        successful: ffnSuccessful,
        total: ffnTotal,
      },
      boundaryStats: {
        decisions: boundaryDecisions,
        drainPercentage: Math.round(drainPercentage),
        draining: drainingSituations,
        nourishing: nourishingSituations,
      },
      joyStats: {
        completionRate: Math.round(joyCompletionRate),
        completed: joyCompleted,
        total: joyTotal,
        avgRating: Math.round(avgJoyRating * 10) / 10,
      },
      activityHeatmap: last7Days,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
