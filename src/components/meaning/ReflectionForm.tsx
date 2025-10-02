'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb } from 'lucide-react';

interface ReflectionFormProps {
  goalId: string;
  onSuccess?: () => void;
}

const REFLECTION_PROMPTS = [
  'What steps did I take this week toward my goal?',
  'How did working on this goal make me feel?',
  'What challenges am I facing with this goal?',
  'How does this goal connect me to others or a greater purpose?',
  'What progress am I most proud of?',
  'What do I want to focus on next week?',
  'How is this goal adding meaning to my life?',
];

export default function ReflectionForm({ goalId, onSuccess }: ReflectionFormProps) {
  const [selectedPrompt, setSelectedPrompt] = useState(REFLECTION_PROMPTS[0]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/meaning-reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          prompt: selectedPrompt,
          content,
        }),
      });

      if (response.ok) {
        setContent('');
        onSuccess?.();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save reflection');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Add Reflection
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPrompts(!showPrompts)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {showPrompts ? 'Hide' : 'Show'} Prompts
          </Button>
        </CardTitle>
        <CardDescription>
          Reflect on your progress and experiences with your meaning goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showPrompts && (
            <div>
              <Label>Reflection Prompts</Label>
              <div className="mt-2 space-y-1">
                {REFLECTION_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant={selectedPrompt === prompt ? 'default' : 'ghost'}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="selectedPrompt">Prompt</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">{selectedPrompt}</p>
          </div>

          <div>
            <Label htmlFor="content">Your Reflection *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts and reflections..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Reflection'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
