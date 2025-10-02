import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reflectionSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  content: z.string().min(1, 'Reflection content is required'),
});

// POST - Create new reflection
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reflectionSchema.parse(body);

    // Verify goal belongs to user
    const goal = await prisma.meaningGoal.findUnique({
      where: { id: validatedData.goalId },
    });

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const reflection = await prisma.meaningReflection.create({
      data: validatedData,
    });

    return NextResponse.json({ reflection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating reflection:', error);
    return NextResponse.json(
      { error: 'Failed to create reflection' },
      { status: 500 }
    );
  }
}
