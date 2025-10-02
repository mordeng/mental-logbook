import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import MobileNav from "@/components/shared/MobileNav"

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
      <MobileNav session={session} />
      <main className="container mx-auto p-4 md:p-8">{children}</main>
    </div>
  )
}
