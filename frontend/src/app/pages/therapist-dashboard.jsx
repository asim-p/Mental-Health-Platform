import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Navbar } from '../components/navbar.jsx';
import {
  Calendar,
  Video,
  Clock,
  DollarSign,
  LogOut,
  User,
  Settings,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { toast } from 'sonner';

export function TherapistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [appointmentsRes, profileRes] = await Promise.all([
          api.appointments.getAll({}),
          api.therapists.getById(user.id),
        ]);

        if (appointmentsRes.success && appointmentsRes.data) {
          setAppointments(appointmentsRes.data);
        }
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const todayAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.scheduledAt).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today && a.status !== 'CANCELLED';
  });

  const upcomingAppointments = appointments.filter((a) => {
    return new Date(a.scheduledAt) > new Date() && a.status !== 'CANCELLED';
  });

  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  const thisMonthEarnings = completedAppointments
    .filter((a) => {
      const date = new Date(a.scheduledAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, a) => sum + Number(a.payment?.amount || 0), 0);

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Dr. {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {profile?.specialization?.join(', ') || 'Mental Health Professional'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today</p>
                  <p className="text-3xl font-bold text-primary">{todayAppointments.length}</p>
                </div>
                <Calendar className="text-primary" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Week</p>
                  <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Video className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
                  <p className="text-3xl font-bold">
                    {new Set(appointments.map((a) => a.patientId)).size}
                  </p>
                </div>
                <User className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-3xl font-bold text-green-600">
                    NPR {thisMonthEarnings.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">
                        {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(appointment.scheduledAt)}
                        </span>
                        <span>{appointment.duration} min</span>
                      </div>
                      {appointment.aiPrediction && (
                        <p className="text-xs text-primary mt-1">
                          AI Prediction: {appointment.aiPrediction}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === 'PENDING' && (
                      <Button
                        size="sm"
                        className="bg-primary gap-2"
                        onClick={async () => {
                          try {
                            await api.appointments.confirm(appointment.id);
                            toast.success('Appointment confirmed');
                            setAppointments((prev) =>
                              prev.map((a) =>
                                a.id === appointment.id ? { ...a, status: 'CONFIRMED' } : a
                              )
                            );
                          } catch {
                            toast.error('Failed to confirm');
                          }
                        }}
                      >
                        <CheckCircle size={14} />
                        Confirm
                      </Button>
                    )}
                    {appointment.zoomMeetingUrl && (
                      <a href={appointment.zoomMeetingUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-primary gap-2">
                          <Video size={14} />
                          Start Session
                        </Button>
                      </a>
                    )}
                    <Link to={`/appointments/${appointment.id}/chat`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <MessageSquare size={14} />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments
                .filter((a) => {
                  const date = new Date(a.scheduledAt);
                  const now = new Date();
                  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return date > now && date <= weekLater;
                })
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="mb-2">
                      <p className="font-semibold text-sm mb-1">
                        {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(appointment.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(appointment.scheduledAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Profile</CardTitle>
              <CardDescription>Update your professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings size={16} />
                Edit Profile & Bio
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <DollarSign size={16} />
                Update Pricing
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link to="/dashboard/therapist/availability">
                  <Calendar size={16} />
                  Set Availability
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
