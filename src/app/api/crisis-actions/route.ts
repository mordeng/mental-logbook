import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const crisisActionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  enabled: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

// GET - Fetch all crisis actions for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = await prisma.crisisAction.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('Error fetching crisis actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    );
  }
}

// POST - Create new crisis action
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = crisisActionSchema.parse(body);

    const action = await prisma.crisisAction.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating crisis action:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}
