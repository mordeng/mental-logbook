import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { connectionActionSchema } from '@/lib/validations/weekly-tracker'
import { getWeekStart } from '@/lib/date-utils'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validationResult = connectionActionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const weekStartDate = getWeekStart()

    // Get or create tracker for current week
    let tracker = await prisma.weeklyTracker.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate,
        },
      },
      include: {
        actions: true,
      },
    })

    if (!tracker) {
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

    // Check if already have 3 actions
    if (tracker.actions.length >= 3) {
      return NextResponse.json(
        { error: 'You have already completed 3 actions for this week!' },
        { status: 400 }
      )
    }

    // Create action
    const action = await prisma.connectionAction.create({
      data: {
        trackerId: tracker.id,
        ...validationResult.data,
      },
    })

    return NextResponse.json({ action }, { status: 201 })
  } catch (error) {
    console.error('Connection action creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
