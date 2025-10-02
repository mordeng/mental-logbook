import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateJoyActivitySchema = z.object({
  plannedActivity: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

// PATCH - Update joy activity
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
    const validatedData = updateJoyActivitySchema.parse(body);

    // Verify activity belongs to user
    const existingActivity = await prisma.joyActivity.findUnique({
      where: { id: params.id },
    });

    if (!existingActivity || existingActivity.userId !== session.user.id) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const activity = await prisma.joyActivity.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ activity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating joy activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE - Delete joy activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify activity belongs to user
    const existingActivity = await prisma.joyActivity.findUnique({
      where: { id: params.id },
    });

    if (!existingActivity || existingActivity.userId !== session.user.id) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await prisma.joyActivity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting joy activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
