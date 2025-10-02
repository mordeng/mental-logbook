import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ffnLogSchema } from '@/lib/validations/ffn'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validationResult = ffnLogSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const log = await prisma.fFNLog.create({
      data: {
        userId: session.user.id,
        ...validationResult.data,
      },
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('FFN log creation error:', error)
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
    const contactName = searchParams.get('contactName')
    const successRating = searchParams.get('successRating')

    const where: any = { userId: session.user.id }
    if (contactName) {
      where.contactName = { contains: contactName, mode: 'insensitive' }
    }
    if (successRating) {
      where.successRating = successRating
    }

    const logs = await prisma.fFNLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.fFNLog.count({ where })

    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('FFN logs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
