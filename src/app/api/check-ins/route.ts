import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dailyCheckInSchema } from '@/lib/validations/check-in'
import { startOfDay } from 'date-fns'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validationResult = dailyCheckInSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { moodRating, feelingText, needText, emotionalNeeds } = validationResult.data
    const today = startOfDay(new Date())

    // Check if check-in already exists for today
    const existing = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    })

    if (existing) {
      // Update existing check-in
      const updated = await prisma.dailyCheckIn.update({
        where: { id: existing.id },
        data: {
          moodRating,
          feelingText,
          needText,
          emotionalNeeds: {
            deleteMany: {},
            create: emotionalNeeds,
          },
        },
        include: {
          emotionalNeeds: true,
        },
      })

      return NextResponse.json({ checkIn: updated })
    }

    // Create new check-in
    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId: session.user.id,
        date: today,
        moodRating,
        feelingText,
        needText,
        emotionalNeeds: {
          create: emotionalNeeds,
        },
      },
      include: {
        emotionalNeeds: true,
      },
    })

    return NextResponse.json({ checkIn }, { status: 201 })
  } catch (error) {
    console.error('Check-in creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { userId: session.user.id },
      include: { emotionalNeeds: true },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.dailyCheckIn.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ checkIns, total })
  } catch (error) {
    console.error('Check-in fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
