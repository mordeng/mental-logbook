import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { boundaryCheckInSchema } from '@/lib/validations/boundary'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validationResult = boundaryCheckInSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const checkIn = await prisma.boundaryCheckIn.create({
      data: {
        userId: session.user.id,
        ...validationResult.data,
      },
    })

    return NextResponse.json({ checkIn }, { status: 201 })
  } catch (error) {
    console.error('Boundary check-in creation error:', error)
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const checkIns = await prisma.boundaryCheckIn.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.boundaryCheckIn.count({
      where: { userId: session.user.id },
    })

    // Calculate pattern insights
    const drainCount = checkIns.filter(c => c.nourishOrDrain === 'drain').length
    const nourishCount = checkIns.filter(c => c.nourishOrDrain === 'nourish').length

    return NextResponse.json({
      checkIns,
      total,
      insights: {
        drainCount,
        nourishCount,
        drainPercentage: total > 0 ? Math.round((drainCount / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Boundary check-ins fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
