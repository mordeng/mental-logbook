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
            <CardTitle>Streak</CardTitle>
            <CardDescription>Daily check-in consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🔥 0 days</div>
            <p className="text-sm text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>View your mental health journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/stats">
              <Button className="w-full" variant="outline">View Stats</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/journal/check-in">
            <Button variant="outline" className="w-full">Daily Check-In</Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="w-full">View Stats</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="w-full">Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
