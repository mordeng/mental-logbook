import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const safeContactUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// PATCH - Update safe contact
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
    const validatedData = safeContactUpdateSchema.parse(body);

    // Verify contact belongs to user
    const existingContact = await prisma.safeContact.findUnique({
      where: { id: params.id },
    });

    if (!existingContact || existingContact.userId !== session.user.id) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = await prisma.safeContact.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating safe contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE - Delete safe contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify contact belongs to user
    const existingContact = await prisma.safeContact.findUnique({
      where: { id: params.id },
    });

    if (!existingContact || existingContact.userId !== session.user.id) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await prisma.safeContact.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting safe contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
