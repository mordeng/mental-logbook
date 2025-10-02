'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Calendar, Activity, Heart, AlertTriangle, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface TherapistSession {
  patientId: string;
  patientName: string;
  patientEmail: string;
  therapistId: string;
}

interface PatientData {
  patient: {
    name: string;
    email: string;
    createdAt: Date;
  };
  summary: {
    avgMood: number | null;
    checkInStreak: number;
    totalCheckIns: number;
    totalFFNLogs: number;
    totalBoundaryCheckIns: number;
    crisisEvents: number;
  };
  recentData: {
    checkIns: any[];
    ffnLogs: any[];
    weeklyTrackers: any[];
    boundaryCheckIns: any[];
    meaningGoals: any[];
    joyActivities: any[];
    crisisLogs: any[];
  };
}

export default function TherapistDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<TherapistSession | null>(null);
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for therapist session
    const sessionData = localStorage.getItem('therapistSession');
    if (!sessionData) {
      router.push('/therapist-login');
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    fetchPatientData(parsedSession.patientId);
  }, [router]);

  const fetchPatientData = async (patientId: string) => {
    try {
      const response = await fetch(`/api/therapist/patient-data?patientId=${patientId}`);
      if (response.ok) {
        const patientData = await response.json();
        setData(patientData);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('therapistSession');
    router.push('/therapist-login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session || !data) {
    return <div className="min-h-screen flex items-center justify-center">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold">Therapist View</h1>
                <p className="text-sm text-muted-foreground">
                  Patient: {data.patient.name || data.patient.email}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {data.summary.avgMood ? data.summary.avgMood.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Mood (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.checkInStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.totalCheckIns}</p>
                  <p className="text-sm text-muted-foreground">Check-Ins (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-8 w-8 ${data.summary.crisisEvents > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-2xl font-bold">{data.summary.crisisEvents}</p>
                  <p className="text-sm text-muted-foreground">Crisis Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-Ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Check-Ins</CardTitle>
            <CardDescription>Last 30 days of mood tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentData.checkIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-ins yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentData.checkIns.slice(0, 5).map((checkIn) => (
                  <div key={checkIn.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">
                        {format(new Date(checkIn.date), 'MMM d, yyyy')}
                      </p>
                      <span className="text-lg font-bold text-blue-600">
                        {checkIn.moodRating}/10
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {checkIn.feelingText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FFN Communications */}
        <Card>
          <CardHeader>
            <CardTitle>FFN Communication Logs</CardTitle>
            <CardDescription>Fact-Feeling-Need practice</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentData.ffnLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No FFN logs yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentData.ffnLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{log.contactName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.date), 'MMM d')}
                      </p>
                    </div>
                    {log.successRating && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log.successRating === 'successful' ? 'bg-green-100 text-green-700' :
                        log.successRating === 'difficult' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.successRating}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crisis Logs */}
        {data.summary.crisisEvents > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Crisis Events</CardTitle>
              <CardDescription>Patient accessed crisis support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recentData.crisisLogs.map((log) => (
                  <div key={log.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900">
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-sm text-red-700">{log.actionsTaken}</p>
                    {log.notes && (
                      <p className="text-sm text-red-600 mt-1">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boundary Check-Ins */}
        <Card>
          <CardHeader>
            <CardTitle>Boundary Decisions</CardTitle>
            <CardDescription>Recent boundary check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentData.boundaryCheckIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No boundary check-ins yet</p>
            ) : (
              <div className="space-y-2">
                {data.recentData.boundaryCheckIns.slice(0, 5).map((boundary) => (
                  <div key={boundary.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(boundary.date), 'MMM d')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        boundary.decision === 'yes' ? 'bg-green-100 text-green-700' :
                        boundary.decision === 'no' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {boundary.decision}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{boundary.situation}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
