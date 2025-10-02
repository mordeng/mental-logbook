'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Check } from 'lucide-react';

interface JoyActivity {
  id: string;
  plannedActivity: string;
  completed: boolean;
  rating?: number;
  notes?: string;
  photoUrl?: string;
  weekStartDate: Date;
}

interface JoyActivityFormProps {
  activity?: JoyActivity | null;
  onSuccess?: () => void;
}

export default function JoyActivityForm({ activity, onSuccess }: JoyActivityFormProps) {
  const [plannedActivity, setPlannedActivity] = useState(activity?.plannedActivity || '');
  const [completed, setCompleted] = useState(activity?.completed || false);
  const [rating, setRating] = useState(activity?.rating || 5);
  const [notes, setNotes] = useState(activity?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activity) {
        // Update existing activity
        const response = await fetch(`/api/joy-activities/${activity.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plannedActivity,
            completed,
            rating: completed ? rating : null,
            notes: notes || null,
          }),
        });

        if (response.ok) {
          onSuccess?.();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to update activity');
        }
      } else {
        // Create new activity
        const response = await fetch('/api/joy-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plannedActivity }),
        });

        if (response.ok) {
          setPlannedActivity('');
          onSuccess?.();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to create activity');
        }
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          {activity ? 'Update Weekly Joy Activity' : 'Plan Weekly Joy Activity'}
        </CardTitle>
        <CardDescription>
          {activity
            ? 'Update your planned activity or mark it as completed'
            : 'Plan one joyful activity for this week'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="plannedActivity">What joyful activity will you do this week? *</Label>
            <Input
              id="plannedActivity"
              value={plannedActivity}
              onChange={(e) => setPlannedActivity(e.target.value)}
              placeholder="e.g., Take a nature walk, bake cookies, call a friend"
              required
            />
          </div>

          {activity && (
            <>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="completed"
                  checked={completed}
                  onCheckedChange={(checked) => setCompleted(checked as boolean)}
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I completed this activity! 🎉
                </Label>
              </div>

              {completed && (
                <>
                  <div>
                    <Label htmlFor="rating">
                      How much joy did it bring you? ({rating}/10)
                    </Label>
                    <Slider
                      id="rating"
                      min={1}
                      max={10}
                      step={1}
                      value={[rating]}
                      onValueChange={(value) => setRating(value[0])}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Not much joy</span>
                      <span>Pure joy!</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How did it feel? What did you enjoy most?"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : activity ? 'Update Activity' : 'Plan Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
