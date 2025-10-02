import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Mental Health Logbook
            </Link>
            <div className="hidden space-x-4 md:flex">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/journal/check-in">
                <Button variant="ghost">Journal</Button>
              </Link>
              <Link href="/stats">
                <Button variant="ghost">Stats</Button>
              </Link>
              <Link href="/safety">
                <Button variant="ghost">Safety</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
            <form action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}>
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 md:p-8">{children}</main>
    </div>
  )
}
