import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JoyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Joy Activity</h1>
        <p className="text-muted-foreground">
          Weekly self-care and non-productivity activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Joy Activity tracker will help you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-6">
            <li>Plan weekly joy activities (just for yourself!)</li>
            <li>Track completion and how they made you feel</li>
            <li>Build streak counters for consistency</li>
            <li>Get suggestions from an activities library</li>
            <li>Create a gallery of joyful moments</li>
          </ul>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
