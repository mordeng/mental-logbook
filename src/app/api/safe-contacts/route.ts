import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const safeContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// GET - Fetch all safe contacts for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contacts = await prisma.safeContact.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching safe contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST - Create new safe contact
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = safeContactSchema.parse(body);

    // Check if user already has 3 contacts
    const existingCount = await prisma.safeContact.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 safe contacts allowed' },
        { status: 400 }
      );
    }

    const contact = await prisma.safeContact.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating safe contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
