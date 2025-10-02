import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Safety Net</h1>
        <p className="text-muted-foreground">
          Your support system and crisis resources
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Safety Net features will include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-6">
            <li>Manage 3 safe contacts with one-tap calling</li>
            <li>Customize your crisis action plan</li>
            <li>Access grounding exercises (5-4-3-2-1)</li>
            <li>Emergency resources by location</li>
            <li>Log crisis events for therapist awareness</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <h3 className="font-bold text-red-900 mb-3">Emergency Resources</h3>
          <div className="space-y-2 text-sm text-red-800">
            <p><strong>US:</strong> National Suicide Prevention Lifeline: 988</p>
            <p><strong>US:</strong> Crisis Text Line: Text HOME to 741741</p>
            <p><strong>International:</strong> <a href="https://findahelpline.com" target="_blank" className="underline">findahelpline.com</a></p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
