import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get patient data for therapist view
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }

    // Get patient basic info
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get recent data from all modules (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      checkIns,
      ffnLogs,
      weeklyTrackers,
      boundaryCheckIns,
      meaningGoals,
      joyActivities,
      crisisLogs,
    ] = await Promise.all([
      prisma.dailyCheckIn.findMany({
        where: { userId: patientId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.fFNLog.findMany({
        where: { userId: patientId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.weeklyTracker.findMany({
        where: { userId: patientId, weekStartDate: { gte: thirtyDaysAgo } },
        include: { actions: true },
        orderBy: { weekStartDate: 'desc' },
      }),
      prisma.boundaryCheckIn.findMany({
        where: { userId: patientId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.meaningGoal.findMany({
        where: { userId: patientId },
        include: { reflections: { orderBy: { date: 'desc' }, take: 5 } },
        orderBy: { month: 'desc' },
        take: 3,
      }),
      prisma.joyActivity.findMany({
        where: { userId: patientId, weekStartDate: { gte: thirtyDaysAgo } },
        orderBy: { weekStartDate: 'desc' },
      }),
      prisma.crisisLog.findMany({
        where: { userId: patientId, timestamp: { gte: thirtyDaysAgo } },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    // Calculate summary statistics
    const avgMood = checkIns.length > 0
      ? checkIns.reduce((sum, ci) => sum + ci.moodRating, 0) / checkIns.length
      : null;

    const checkInStreak = calculateStreak(checkIns);

    return NextResponse.json({
      patient,
      summary: {
        avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        checkInStreak,
        totalCheckIns: checkIns.length,
        totalFFNLogs: ffnLogs.length,
        totalBoundaryCheckIns: boundaryCheckIns.length,
        crisisEvents: crisisLogs.length,
      },
      recentData: {
        checkIns,
        ffnLogs,
        weeklyTrackers,
        boundaryCheckIns,
        meaningGoals,
        joyActivities,
        crisisLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}

function calculateStreak(checkIns: any[]): number {
  if (checkIns.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort by date descending
  const sorted = [...checkIns].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let checkDate = new Date(today);

  for (const checkIn of sorted) {
    const ciDate = new Date(checkIn.date);
    ciDate.setHours(0, 0, 0, 0);

    if (ciDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
