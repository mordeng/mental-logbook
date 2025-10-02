'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Lock, Shield, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [therapistConfigured, setTherapistConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    checkTherapistSetup();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setName(data.user.name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTherapistSetup = async () => {
    try {
      const response = await fetch('/api/therapist/setup');
      if (response.ok) {
        const data = await response.json();
        setTherapistConfigured(data.configured);
      }
    } catch (error) {
      console.error('Error checking therapist setup:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchProfile();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred');
    }
  };

  const handleSetupTherapistPasscode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(passcode)) {
      alert('Passcode must be exactly 6 digits');
      return;
    }

    try {
      const response = await fetch('/api/therapist/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        alert(therapistConfigured ? 'Passcode updated successfully!' : 'Therapist access configured!');
        setPasscode('');
        checkTherapistSetup();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to setup passcode');
      }
    } catch (error) {
      console.error('Error setting up passcode:', error);
      alert('An error occurred');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/analytics?days=9999');
      if (response.ok) {
        const data = await response.json();

        // Create download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mental-health-logbook-${format(new Date(), 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-gray-500" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account, privacy, and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            {profile?.createdAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {format(new Date(profile.createdAt), 'MMMM d, yyyy')}</span>
              </div>
            )}
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Therapist Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Therapist Access
          </CardTitle>
          <CardDescription>
            {therapistConfigured
              ? 'Update the passcode for your therapist to access your journal'
              : 'Set up a passcode for your therapist to view your journal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupTherapistPasscode} className="space-y-4">
            {therapistConfigured && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ✓ Therapist access is configured
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="passcode">
                {therapistConfigured ? 'New ' : ''}6-Digit Passcode
              </Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your therapist will use this passcode to access your journal
              </p>
            </div>
            <Button type="submit">
              {therapistConfigured ? 'Update Passcode' : 'Setup Therapist Access'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>Download all your journal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export all your journal entries, analytics, and personal data in JSON format.
          </p>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download My Data (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
