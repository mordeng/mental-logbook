import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';

export const dynamic = 'force-dynamic'

const therapistPasscodeSchema = z.object({
  passcode: z.string().regex(/^\d{6}$/, 'Passcode must be exactly 6 digits'),
});

// POST - Setup or update therapist passcode
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = therapistPasscodeSchema.parse(body);

    // Hash the passcode
    const passcodeHash = await hashPassword(validatedData.passcode);

    // Check if therapist record already exists
    const existingTherapist = await prisma.therapist.findUnique({
      where: { patientId: session.user.id },
    });

    if (existingTherapist) {
      // Update existing passcode
      await prisma.therapist.update({
        where: { id: existingTherapist.id },
        data: { passcodeHash },
      });
    } else {
      // Create new therapist access
      await prisma.therapist.create({
        data: {
          patientId: session.user.id,
          passcodeHash,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error setting up therapist passcode:', error);
    return NextResponse.json(
      { error: 'Failed to setup passcode' },
      { status: 500 }
    );
  }
}

// GET - Check if therapist access is configured
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { patientId: session.user.id },
      select: { id: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({
      configured: !!therapist,
      therapist: therapist || null,
    });
  } catch (error) {
    console.error('Error checking therapist setup:', error);
    return NextResponse.json(
      { error: 'Failed to check setup' },
      { status: 500 }
    );
  }
}
