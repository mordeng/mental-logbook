'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CrisisButton from './CrisisButton';
import { handleSignOut } from '@/lib/actions';
import { Menu, X, Home, BookOpen, BarChart3, Shield, Settings as SettingsIcon, ChevronDown } from 'lucide-react';

interface MobileNavProps {
  session: any;
}

export default function MobileNav({ session }: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);

  const journalLinks = [
    { href: '/journal/check-in', label: 'Daily Check-In' },
    { href: '/journal/ffn', label: 'FFN Communication' },
    { href: '/journal/weekly-tracker', label: 'Weekly Connections' },
    { href: '/journal/boundary', label: 'Boundary Check-In' },
    { href: '/journal/meaning', label: 'Meaning & Belonging' },
    { href: '/journal/joy', label: 'Joy Activity' },
  ];

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

            <div className="relative group">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <BookOpen className="h-4 w-4 mr-2" />
                Journal
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              <div className="absolute left-0 mt-2 w-56 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {journalLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2 hover:bg-slate-100 text-sm">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/stats">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
            </Link>
            <Link href="/safety">
              <Button variant="ghost" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Safety
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
          <CrisisButton />
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
          <CrisisButton />
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

            <div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
                onClick={() => setJournalOpen(!journalOpen)}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Journal
                <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${journalOpen ? 'rotate-180' : ''}`} />
              </Button>
              {journalOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {journalLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/stats" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <BarChart3 className="h-5 w-5 mr-3" />
                Stats
              </Button>
            </Link>

            <Link href="/safety" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Shield className="h-5 w-5 mr-3" />
                Safety
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
