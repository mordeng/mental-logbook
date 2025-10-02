import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateMeaningGoalSchema = z.object({
  goalType: z.enum(['join_group', 'volunteer', 'share_creativity', 'other']).optional(),
  description: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

// PATCH - Update meaning goal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateMeaningGoalSchema.parse(body);

    // Verify goal belongs to user
    const existingGoal = await prisma.meaningGoal.findUnique({
      where: { id: params.id },
    });

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = await prisma.meaningGoal.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        reflections: {
          orderBy: { date: 'desc' },
        },
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating meaning goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete meaning goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify goal belongs to user
    const existingGoal = await prisma.meaningGoal.findUnique({
      where: { id: params.id },
    });

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await prisma.meaningGoal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meaning goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
