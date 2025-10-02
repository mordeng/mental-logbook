'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MeaningGoalForm from '@/components/meaning/MeaningGoalForm';
import ReflectionForm from '@/components/meaning/ReflectionForm';
import { Heart, Calendar, BookOpen, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';

interface MeaningReflection {
  id: string;
  prompt: string;
  content: string;
  date: Date;
}

interface MeaningGoal {
  id: string;
  goalType: string;
  description: string;
  completed: boolean;
  month: Date;
  reflections: MeaningReflection[];
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  join_group: 'Join a group/community',
  volunteer: 'Volunteer or help others',
  share_creativity: 'Share creativity or skills',
  other: 'Other meaningful activity',
};

export default function MeaningPage() {
  const [currentGoal, setCurrentGoal] = useState<MeaningGoal | null>(null);
  const [pastGoals, setPastGoals] = useState<MeaningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current month's goal
      const currentRes = await fetch('/api/meaning-goals?current=true');
      if (currentRes.ok) {
        const data = await currentRes.json();
        setCurrentGoal(data.goal);
      }

      // Fetch past goals
      const historyRes = await fetch('/api/meaning-goals?limit=6');
      if (historyRes.ok) {
        const data = await historyRes.json();
        // Filter out current month
        const thisMonth = startOfMonth(new Date()).getTime();
        setPastGoals(
          data.goals.filter((g: MeaningGoal) => new Date(g.month).getTime() !== thisMonth)
        );
      }
    } catch (error) {
      console.error('Error fetching meaning goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteReflection = async (reflectionId: string) => {
    if (!confirm('Are you sure you want to delete this reflection?')) return;

    try {
      const response = await fetch(`/api/meaning-reflections/${reflectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting reflection:', error);
    }
  };

  const thisMonth = startOfMonth(new Date());

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="h-8 w-8 text-purple-500" />
          Meaning & Belonging
        </h1>
        <p className="text-muted-foreground">
          Set monthly goals that connect you to purpose and community
        </p>
      </div>

      {/* Current Month Info */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-purple-900">Current Month</p>
              <p className="text-xl font-bold text-purple-700">
                {format(thisMonth, 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Form */}
      <MeaningGoalForm goal={currentGoal} onSuccess={fetchData} />

      {/* Reflections Section */}
      {currentGoal && (
        <>
          <ReflectionForm goalId={currentGoal.id} onSuccess={fetchData} />

          {/* Reflections Timeline */}
          {currentGoal.reflections && currentGoal.reflections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Your Reflections
                </CardTitle>
                <CardDescription>
                  Your journey with this month's goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentGoal.reflections.map((reflection) => (
                  <div key={reflection.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-700">
                          {reflection.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reflection.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReflection(reflection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm">{reflection.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Past Goals */}
      {pastGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Goals</CardTitle>
            <CardDescription>Your previous meaning and belonging goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {GOAL_TYPE_LABELS[goal.goalType] || goal.goalType}
                      </span>
                      {goal.completed && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Completed ✓
                        </span>
                      )}
                    </div>
                    <p className="font-semibold mb-1">{goal.description}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(goal.month), 'MMMM yyyy')}
                    </p>
                    {goal.reflections && goal.reflections.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {goal.reflections.length} reflection
                        {goal.reflections.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
