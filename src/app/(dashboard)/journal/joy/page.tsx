'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JoyActivityForm from '@/components/joy/JoyActivityForm';
import { Sparkles, Flame, Calendar, TrendingUp } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import Link from 'next/link';

interface JoyActivity {
  id: string;
  plannedActivity: string;
  completed: boolean;
  rating?: number;
  notes?: string;
  photoUrl?: string;
  weekStartDate: Date;
}

const JOY_SUGGESTIONS = [
  'Take a peaceful walk in nature',
  'Bake or cook something you love',
  'Call a friend just to chat',
  'Read a book for pleasure',
  'Listen to your favorite music and dance',
  'Watch a movie that makes you laugh',
  'Take a relaxing bath',
  'Draw, paint, or do crafts',
  'Play with a pet',
  'Garden or tend to plants',
  'Do a puzzle or play a game',
  'Visit a park or natural space',
  'Practice a hobby you enjoy',
  'Have a picnic',
  'Try a new recipe',
  'Watch the sunrise or sunset',
];

export default function JoyPage() {
  const [currentActivity, setCurrentActivity] = useState<JoyActivity | null>(null);
  const [recentActivities, setRecentActivities] = useState<JoyActivity[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current week's activity
      const currentRes = await fetch('/api/joy-activities?current=true');
      if (currentRes.ok) {
        const data = await currentRes.json();
        setCurrentActivity(data.activity);
      }

      // Fetch recent activities and streak
      const historyRes = await fetch('/api/joy-activities?limit=5');
      if (historyRes.ok) {
        const data = await historyRes.json();
        setRecentActivities(data.activities || []);
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error('Error fetching joy activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          Joy Activity Tracker
        </h1>
        <p className="text-muted-foreground">
          Plan and track weekly activities that bring you pure joy
        </p>
      </div>

      {/* Streak Counter */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-3xl font-bold">{streak}</p>
                <p className="text-sm text-muted-foreground">Week Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-semibold">This Week</p>
                <p className="text-xs text-muted-foreground">
                  {format(thisWeek, 'MMM d')} - {format(new Date(thisWeek.getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-3xl font-bold">{recentActivities.filter(a => a.completed).length}</p>
                <p className="text-sm text-muted-foreground">Recent Completions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Week Activity */}
      <JoyActivityForm activity={currentActivity} onSuccess={fetchData} />

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Need Ideas?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Hide' : 'Show'} Suggestions
            </Button>
          </CardTitle>
          <CardDescription>
            Click any activity to use it as your weekly joy activity
          </CardDescription>
        </CardHeader>
        {showSuggestions && (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {JOY_SUGGESTIONS.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto py-2 text-left"
                  onClick={() => {
                    if (!currentActivity) {
                      // Auto-fill the form
                      const input = document.getElementById('plannedActivity') as HTMLInputElement;
                      if (input) {
                        input.value = suggestion;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your past joy activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{activity.plannedActivity}</p>
                      {activity.completed && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Completed ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Week of {format(new Date(activity.weekStartDate), 'MMM d, yyyy')}
                    </p>
                    {activity.completed && activity.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Joy Rating:</span>
                        <span className="font-semibold">{activity.rating}/10</span>
                      </div>
                    )}
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{activity.notes}"
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
