import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get unique contact names for autocomplete
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contacts = await prisma.fFNLog.findMany({
      where: { userId: session.user.id },
      select: { contactName: true },
      distinct: ['contactName'],
      orderBy: { contactName: 'asc' },
      take: 50,
    })

    const contactNames = contacts.map(c => c.contactName)

    return NextResponse.json({ contacts: contactNames })
  } catch (error) {
    console.error('Contacts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
