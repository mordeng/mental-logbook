import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">Here's your mental health journey at a glance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Check-In</CardTitle>
            <CardDescription>Quick emotional state tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/journal/check-in">
              <Button className="w-full">Start Check-In</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Connections</CardTitle>
            <CardDescription>Track your social interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/3</div>
            <p className="text-sm text-muted-foreground">Actions this week</p>
            <Link href="/journal/weekly-tracker">
              <Button className="mt-4 w-full" variant="outline">View Tracker</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
            <CardDescription>Daily check-in consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🔥 0 days</div>
            <p className="text-sm text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/journal/check-in">
            <Button variant="outline" className="w-full">Daily Check-In</Button>
          </Link>
          <Link href="/journal/ffn">
            <Button variant="outline" className="w-full">FFN Log</Button>
          </Link>
          <Link href="/journal/weekly-tracker">
            <Button variant="outline" className="w-full">Weekly Tracker</Button>
          </Link>
          <Link href="/journal/boundary">
            <Button variant="outline" className="w-full">Boundary Check</Button>
          </Link>
          <Link href="/journal/meaning">
            <Button variant="outline" className="w-full">Meaning & Belonging</Button>
          </Link>
          <Link href="/journal/joy">
            <Button variant="outline" className="w-full">Joy Activity</Button>
          </Link>
          <Link href="/safety">
            <Button variant="outline" className="w-full">Safety Net</Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="w-full">View Stats</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
