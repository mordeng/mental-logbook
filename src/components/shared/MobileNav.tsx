'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { handleSignOut } from '@/lib/actions';
import { Menu, X, Home, BarChart3, Settings as SettingsIcon, BookOpen } from 'lucide-react';

interface MobileNavProps {
  session: any;
}

export default function MobileNav({ session }: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Mental Health Logbook
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/journal/check-in">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Daily Check-In
              </Button>
            </Link>

            <Link href="/stats">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden lg:flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden xl:inline">
            {session.user?.name || session.user?.email}
          </span>
          <form action={handleSignOut}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Button>
            </Link>

            <Link href="/journal/check-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <BookOpen className="h-5 w-5 mr-3" />
                Daily Check-In
              </Button>
            </Link>

            <Link href="/stats" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <BarChart3 className="h-5 w-5 mr-3" />
                Stats
              </Button>
            </Link>

            <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <SettingsIcon className="h-5 w-5 mr-3" />
                Settings
              </Button>
            </Link>

            <div className="border-t pt-4 space-y-2">
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}
              </div>
              <form action={handleSignOut}>
                <Button type="submit" variant="outline" className="w-full" size="lg">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
