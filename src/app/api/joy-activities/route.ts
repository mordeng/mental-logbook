import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { startOfWeek } from 'date-fns';

const joyActivitySchema = z.object({
  plannedActivity: z.string().min(1, 'Activity description is required'),
  weekStartDate: z.string().optional(), // ISO date string
});

const updateJoyActivitySchema = z.object({
  plannedActivity: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

// GET - Fetch joy activities for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (current) {
      // Get current week's activity
      const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

      const activity = await prisma.joyActivity.findUnique({
        where: {
          userId_weekStartDate: {
            userId: session.user.id,
            weekStartDate: thisWeek,
          },
        },
      });

      return NextResponse.json({ activity });
    }

    // Get all activities
    const activities = await prisma.joyActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { weekStartDate: 'desc' },
      take: limit,
    });

    // Calculate streak
    const allActivities = await prisma.joyActivity.findMany({
      where: {
        userId: session.user.id,
        completed: true,
      },
      orderBy: { weekStartDate: 'desc' },
    });

    let streak = 0;
    const now = new Date();
    let checkDate = startOfWeek(now, { weekStartsOn: 1 });

    for (const activity of allActivities) {
      if (activity.weekStartDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Previous week
      } else {
        break;
      }
    }

    return NextResponse.json({ activities, streak });
  } catch (error) {
    console.error('Error fetching joy activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Create new joy activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joyActivitySchema.parse(body);

    const weekStart = validatedData.weekStartDate
      ? new Date(validatedData.weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 });

    // Check if activity already exists for this week
    const existing = await prisma.joyActivity.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: weekStart,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Activity already exists for this week' },
        { status: 400 }
      );
    }

    const activity = await prisma.joyActivity.create({
      data: {
        userId: session.user.id,
        weekStartDate: weekStart,
        plannedActivity: validatedData.plannedActivity,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating joy activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
