'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Heart, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SafeContact {
  id: string;
  name: string;
  phone?: string;
  relationship?: string;
}

interface CrisisAction {
  id: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface CrisisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CrisisModal({ open, onOpenChange }: CrisisModalProps) {
  const [contacts, setContacts] = useState<SafeContact[]>([]);
  const [actions, setActions] = useState<CrisisAction[]>([]);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
      logCrisisAccess();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [contactsRes, actionsRes] = await Promise.all([
        fetch('/api/safe-contacts'),
        fetch('/api/crisis-actions'),
      ]);

      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.contacts);
      }

      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setActions(data.actions.filter((a: CrisisAction) => a.enabled));
      }
    } catch (error) {
      console.error('Error fetching crisis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logCrisisAccess = async () => {
    try {
      await fetch('/api/crisis-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionsTaken: 'Opened crisis support modal',
          notes: 'User accessed crisis resources',
        }),
      });
    } catch (error) {
      console.error('Error logging crisis access:', error);
    }
  };

  const toggleAction = (actionId: string) => {
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-6 w-6 text-red-500" />
            Crisis Support
          </DialogTitle>
          <DialogDescription>
            You're not alone. Here are your personalized crisis resources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Emergency Hotlines */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-700 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 mb-2">24/7 Crisis Hotlines</h3>
                  <div className="space-y-2 text-sm text-red-800">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href="tel:988" className="font-mono font-bold hover:underline">
                        988
                      </a>
                      <span>- Suicide & Crisis Lifeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-mono">Text HOME to 741741</span>
                      <span>- Crisis Text Line</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href="tel:911" className="font-mono font-bold hover:underline">
                        911
                      </a>
                      <span>- Emergency Services</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safe Contacts */}
          {contacts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Your Safe Contacts
              </h3>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          {contact.relationship && (
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          )}
                        </div>
                        {contact.phone && (
                          <Button asChild size="sm">
                            <a href={`tel:${contact.phone}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Crisis Actions */}
          {actions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Your Crisis Action Plan
              </h3>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <Card key={action.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={completedActions.has(action.id)}
                          onCheckedChange={() => toggleAction(action.id)}
                        />
                        <div className="flex-1">
                          <span className="text-muted-foreground mr-2">{index + 1}.</span>
                          <span
                            className={
                              completedActions.has(action.id)
                                ? 'line-through text-muted-foreground'
                                : ''
                            }
                          >
                            {action.description}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 5-4-3-2-1 Grounding */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              5-4-3-2-1 Grounding Exercise
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p><strong>5</strong> things you can see</p>
                  <p><strong>4</strong> things you can touch</p>
                  <p><strong>3</strong> things you can hear</p>
                  <p><strong>2</strong> things you can smell</p>
                  <p><strong>1</strong> thing you can taste</p>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Take slow, deep breaths as you go through each step.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 4-7-8 Breathing */}
          <div>
            <h3 className="font-semibold mb-3">4-7-8 Breathing</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Exhale completely through your mouth</p>
                  <p><strong>2.</strong> Inhale through your nose for 4 counts</p>
                  <p><strong>3.</strong> Hold your breath for 7 counts</p>
                  <p><strong>4.</strong> Exhale through your mouth for 8 counts</p>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Repeat 3-4 times to activate your body's relaxation response.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
