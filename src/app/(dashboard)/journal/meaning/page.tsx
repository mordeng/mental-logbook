import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MeaningPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meaning & Belonging</h1>
        <p className="text-muted-foreground">
          Reflect on purpose and connection
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
            Meaning & Belonging journal will help you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-6">
            <li>Set monthly goals for purpose and connection</li>
            <li>Reflect on times you felt part of something bigger</li>
            <li>Track milestones in your journey</li>
            <li>Create a gallery of meaningful moments</li>
          </ul>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
