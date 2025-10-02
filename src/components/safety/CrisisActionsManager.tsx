'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

interface CrisisAction {
  id: string;
  description: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_ACTIONS = [
  'Call a safe contact',
  'Practice deep breathing (4-7-8 technique)',
  'Use 5-4-3-2-1 grounding exercise',
  'Take a short walk outside',
  'Listen to calming music',
  'Write down my thoughts and feelings',
];

export default function CrisisActionsManager() {
  const [actions, setActions] = useState<CrisisAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ description: '', enabled: true });

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/crisis-actions');
      if (response.ok) {
        const data = await response.json();
        setActions(data.actions);
      }
    } catch (error) {
      console.error('Error fetching crisis actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/crisis-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, order: actions.length }),
      });

      if (response.ok) {
        await fetchActions();
        setAdding(false);
        setFormData({ description: '', enabled: true });
      }
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<CrisisAction>) => {
    try {
      const response = await fetch(`/api/crisis-actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchActions();
        setEditing(null);
      }
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return;

    try {
      const response = await fetch(`/api/crisis-actions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchActions();
      }
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    await handleUpdate(id, { enabled });
  };

  const handleQuickAdd = async (description: string) => {
    try {
      const response = await fetch('/api/crisis-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, enabled: true, order: actions.length }),
      });

      if (response.ok) {
        await fetchActions();
      }
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  const startEdit = (action: CrisisAction) => {
    setEditing(action.id);
    setFormData({ description: action.description, enabled: action.enabled });
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    setFormData({ description: '', enabled: true });
  };

  const saveEdit = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdate(id, formData);
    setFormData({ description: '', enabled: true });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Crisis Action Plan</h3>
          <p className="text-sm text-muted-foreground">
            Build your personalized list of actions to take during a crisis
          </p>
        </div>
        <Button onClick={() => setAdding(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {actions.length === 0 && !adding && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Add some common crisis coping actions to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEFAULT_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickAdd(action)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {action}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Crisis Action</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="description">Action Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Call my therapist"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Action</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {actions.map((action, index) => (
          <Card key={action.id}>
            <CardContent className="pt-6">
              {editing === action.id ? (
                <form onSubmit={(e) => saveEdit(action.id, e)} className="space-y-4">
                  <div>
                    <Label htmlFor={`edit-description-${action.id}`}>Action Description *</Label>
                    <Input
                      id={`edit-description-${action.id}`}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-muted-foreground font-mono text-sm">{index + 1}.</span>
                    <Checkbox
                      checked={action.enabled}
                      onCheckedChange={(checked) =>
                        handleToggleEnabled(action.id, checked as boolean)
                      }
                    />
                    <span className={action.enabled ? '' : 'text-muted-foreground line-through'}>
                      {action.description}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(action)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(action.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
