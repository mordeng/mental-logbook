import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { z } from 'zod';

const therapistLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  passcode: z.string().regex(/^\d{6}$/, 'Passcode must be exactly 6 digits'),
});

// POST - Therapist login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = therapistLoginSchema.parse(body);

    // Find patient by email
    const patient = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { therapist: true },
    });

    if (!patient || !patient.therapist) {
      return NextResponse.json(
        { error: 'No therapist access found for this patient' },
        { status: 404 }
      );
    }

    // Verify passcode
    const isValid = await verifyPassword(
      validatedData.passcode,
      patient.therapist.passcodeHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid passcode' },
        { status: 401 }
      );
    }

    // Log therapist access
    await prisma.therapistAccessLog.create({
      data: {
        therapistId: patient.therapist.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Return patient info and therapist session data
    return NextResponse.json({
      success: true,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      therapistId: patient.therapist.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error in therapist login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
