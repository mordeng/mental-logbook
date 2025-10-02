import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekStart } from '@/lib/date-utils'

// Get current week's tracker (or create if doesn't exist)
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekParam = searchParams.get('week')
    const weekStartDate = weekParam ? new Date(weekParam) : getWeekStart()

    let tracker = await prisma.weeklyTracker.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate,
        },
      },
      include: {
        actions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Auto-create tracker for current week if it doesn't exist
    if (!tracker && !weekParam) {
      tracker = await prisma.weeklyTracker.create({
        data: {
          userId: session.user.id,
          weekStartDate,
        },
        include: {
          actions: true,
        },
      })
    }

    const completion = tracker ? tracker.actions.length : 0

    return NextResponse.json({ tracker, completion })
  } catch (error) {
    console.error('Weekly tracker fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
