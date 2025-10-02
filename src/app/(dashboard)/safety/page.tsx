import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SafeContactsManager from '@/components/safety/SafeContactsManager';
import CrisisActionsManager from '@/components/safety/CrisisActionsManager';
import { AlertTriangle, Phone, Heart } from 'lucide-react';

export default function SafetyNetPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Safety Net</h1>
        <p className="text-muted-foreground">
          Your personalized crisis support system and emergency resources
        </p>
      </div>

      {/* Emergency Resources Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Crisis Resources - Available 24/7
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">National Crisis Hotlines</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">988</span> - Suicide & Crisis Lifeline
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">1-800-273-8255</span> - National Suicide Prevention
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">741741</span> - Crisis Text Line (text HOME)
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">Specialized Support</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">1-800-662-4357</span> - SAMHSA Helpline
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">1-866-488-7386</span> - Trevor Project (LGBTQ+)
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">1-800-799-7233</span> - Domestic Violence Hotline
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-4">
            If you are in immediate danger, please call 911 or go to your nearest emergency room.
          </p>
        </CardContent>
      </Card>

      {/* Safe Contacts Section */}
      <SafeContactsManager />

      {/* Crisis Actions Section */}
      <CrisisActionsManager />

      {/* Grounding Exercise Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            5-4-3-2-1 Grounding Exercise
          </CardTitle>
          <CardDescription>
            Use this when you feel overwhelmed, anxious, or disconnected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="font-bold text-2xl text-primary w-8">5</div>
              <div>
                <h4 className="font-semibold">Things you can SEE</h4>
                <p className="text-sm text-muted-foreground">
                  Look around and name 5 things you can see right now
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-2xl text-primary w-8">4</div>
              <div>
                <h4 className="font-semibold">Things you can TOUCH</h4>
                <p className="text-sm text-muted-foreground">
                  Notice 4 things you can feel (texture, temperature, etc.)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-2xl text-primary w-8">3</div>
              <div>
                <h4 className="font-semibold">Things you can HEAR</h4>
                <p className="text-sm text-muted-foreground">
                  Listen carefully and identify 3 sounds around you
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-2xl text-primary w-8">2</div>
              <div>
                <h4 className="font-semibold">Things you can SMELL</h4>
                <p className="text-sm text-muted-foreground">
                  Notice 2 scents in your environment or on your body
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-2xl text-primary w-8">1</div>
              <div>
                <h4 className="font-semibold">Thing you can TASTE</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on 1 taste you can notice right now
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic mt-4">
            Take slow, deep breaths as you go through each step. This exercise helps bring you back to the present moment.
          </p>
        </CardContent>
      </Card>

      {/* Deep Breathing Card */}
      <Card>
        <CardHeader>
          <CardTitle>4-7-8 Breathing Technique</CardTitle>
          <CardDescription>
            A simple breathing pattern to calm anxiety and stress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex gap-3">
              <div className="font-bold text-xl text-primary w-8">1.</div>
              <p className="text-sm">Exhale completely through your mouth</p>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-xl text-primary w-8">2.</div>
              <p className="text-sm">Close your mouth and inhale through your nose for <strong>4 counts</strong></p>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-xl text-primary w-8">3.</div>
              <p className="text-sm">Hold your breath for <strong>7 counts</strong></p>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-xl text-primary w-8">4.</div>
              <p className="text-sm">Exhale completely through your mouth for <strong>8 counts</strong></p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic mt-4">
            Repeat this cycle 3-4 times. This technique activates your parasympathetic nervous system to promote relaxation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
