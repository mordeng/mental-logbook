'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Target } from 'lucide-react';

interface MeaningGoal {
  id: string;
  goalType: string;
  description: string;
  completed: boolean;
  month: Date;
}

interface MeaningGoalFormProps {
  goal?: MeaningGoal | null;
  onSuccess?: () => void;
}

const GOAL_TYPES = [
  { value: 'join_group', label: 'Join a group/community' },
  { value: 'volunteer', label: 'Volunteer or help others' },
  { value: 'share_creativity', label: 'Share creativity or skills' },
  { value: 'other', label: 'Other meaningful activity' },
];

export default function MeaningGoalForm({ goal, onSuccess }: MeaningGoalFormProps) {
  const [goalType, setGoalType] = useState(goal?.goalType || 'join_group');
  const [description, setDescription] = useState(goal?.description || '');
  const [completed, setCompleted] = useState(goal?.completed || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (goal) {
        // Update existing goal
        const response = await fetch(`/api/meaning-goals/${goal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalType,
            description,
            completed,
          }),
        });

        if (response.ok) {
          onSuccess?.();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to update goal');
        }
      } else {
        // Create new goal
        const response = await fetch('/api/meaning-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalType, description }),
        });

        if (response.ok) {
          setDescription('');
          onSuccess?.();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to create goal');
        }
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          {goal ? 'Update Monthly Goal' : 'Set Monthly Goal'}
        </CardTitle>
        <CardDescription>
          {goal
            ? 'Update your monthly meaning and belonging goal'
            : 'Set a meaningful goal for this month that connects you to others or a greater purpose'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Goal Type</Label>
            <div className="space-y-2 mt-2">
              {GOAL_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={type.value}
                    name="goalType"
                    value={type.value}
                    checked={goalType === type.value}
                    onChange={(e) => setGoalType(e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={type.value} className="cursor-pointer font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">What is your specific goal? *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Join a local book club, Volunteer at animal shelter"
              required
            />
          </div>

          {goal && (
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
                I completed this goal! 🎉
              </Label>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Set Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
