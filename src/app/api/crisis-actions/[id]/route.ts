import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const crisisActionUpdateSchema = z.object({
  description: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// PATCH - Update crisis action
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
    const validatedData = crisisActionUpdateSchema.parse(body);

    // Verify action belongs to user
    const existingAction = await prisma.crisisAction.findUnique({
      where: { id: params.id },
    });

    if (!existingAction || existingAction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    const action = await prisma.crisisAction.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating crisis action:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

// DELETE - Delete crisis action
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify action belongs to user
    const existingAction = await prisma.crisisAction.findUnique({
      where: { id: params.id },
    });

    if (!existingAction || existingAction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    await prisma.crisisAction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting crisis action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
