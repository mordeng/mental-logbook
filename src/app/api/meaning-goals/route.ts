import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { startOfMonth } from 'date-fns';

const meaningGoalSchema = z.object({
  goalType: z.enum(['join_group', 'volunteer', 'share_creativity', 'other']),
  description: z.string().min(1, 'Goal description is required'),
  month: z.string().optional(), // ISO date string
});

const updateMeaningGoalSchema = z.object({
  goalType: z.enum(['join_group', 'volunteer', 'share_creativity', 'other']).optional(),
  description: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

// GET - Fetch meaning goals for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current') === 'true';
    const limit = parseInt(searchParams.get('limit') || '12');

    if (current) {
      // Get current month's goal
      const thisMonth = startOfMonth(new Date());

      const goal = await prisma.meaningGoal.findUnique({
        where: {
          userId_month: {
            userId: session.user.id,
            month: thisMonth,
          },
        },
        include: {
          reflections: {
            orderBy: { date: 'desc' },
            take: 10,
          },
        },
      });

      return NextResponse.json({ goal });
    }

    // Get all goals
    const goals = await prisma.meaningGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { month: 'desc' },
      take: limit,
      include: {
        reflections: {
          orderBy: { date: 'desc' },
        },
      },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching meaning goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST - Create new meaning goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = meaningGoalSchema.parse(body);

    const monthStart = validatedData.month
      ? new Date(validatedData.month)
      : startOfMonth(new Date());

    // Check if goal already exists for this month
    const existing = await prisma.meaningGoal.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: monthStart,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Goal already exists for this month' },
        { status: 400 }
      );
    }

    const goal = await prisma.meaningGoal.create({
      data: {
        userId: session.user.id,
        month: monthStart,
        goalType: validatedData.goalType,
        description: validatedData.description,
      },
      include: {
        reflections: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating meaning goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
