import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Delete reflection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify reflection belongs to user's goal
    const reflection = await prisma.meaningReflection.findUnique({
      where: { id: params.id },
      include: { goal: true },
    });

    if (!reflection || reflection.goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    await prisma.meaningReflection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    return NextResponse.json(
      { error: 'Failed to delete reflection' },
      { status: 500 }
    );
  }
}
