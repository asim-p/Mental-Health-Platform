import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Navbar } from '../components/navbar.jsx';
import { Calendar, Video, Clock, User, LogOut, Brain, MessageSquare, Star, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { toast } from 'sonner';

export function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [screeningHistory, setScreeningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [upcomingRes, pastRes, screeningRes] = await Promise.all([
          api.appointments.getAll({ upcoming: 'true' }),
          api.appointments.getAll({ status: 'COMPLETED' }),
          api.screening.getHistory(),
        ]);

        if (upcomingRes.success && upcomingRes.data) {
          setUpcomingAppointments(upcomingRes.data);
        }
        if (pastRes.success && pastRes.data) {
          setPastAppointments(pastRes.data);
        }
        if (screeningRes.success && screeningRes.data) {
          setScreeningHistory(screeningRes.data);
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

  const handlePayment = async (appointmentId) => {
    try {
      const paymentRes = await api.payments.initiate(appointmentId);
      
      if (paymentRes.success && paymentRes.data) {
        const { paymentUrl, params } = paymentRes.data;
        
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", paymentUrl);
        
        for (const key in params) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);
          form.appendChild(hiddenField);
        }
        
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'PAID':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Unpaid';
      case 'PAID': return 'Paid';
      case 'CONFIRMED': return 'Confirmed';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments and mental health journey
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
                  <p className="text-sm text-muted-foreground mb-1">Upcoming Sessions</p>
                  <p className="text-3xl font-bold text-primary">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="text-primary" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold">{pastAppointments.length}</p>
                </div>
                <Video className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                  <p className="text-3xl font-bold">
                    {Math.round(pastAppointments.length * 0.75)}
                  </p>
                </div>
                <Clock className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Screenings</p>
                  <p className="text-3xl font-bold">{screeningHistory.length}</p>
                </div>
                <Brain className="text-primary" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">
                        {appointment.therapist?.user?.firstName || 'Unknown'} {appointment.therapist?.user?.lastName || 'Therapist'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(appointment.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(appointment.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {appointment.zoomJoinUrl && (
                      <a href={appointment.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-primary gap-2">
                          <Video size={14} />
                          Join Session
                        </Button>
                      </a>
                    )}
                    {['PAID', 'CONFIRMED', 'COMPLETED'].includes(appointment.status) ? (
                      <Link to={`/appointments/${appointment.id}/chat`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageSquare size={14} />
                          Chat
                        </Button>
                      </Link>
                    ) : appointment.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => handlePayment(appointment.id)}
                      >
                        <DollarSign size={14} />
                        Pay Now (eSewa)
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.appointments.cancel(appointment.id, 'User requested cancellation');
                          toast.success('Appointment cancelled');
                          setUpcomingAppointments((prev) =>
                            prev.filter((a) => a.id !== appointment.id)
                          );
                        } catch {
                          toast.error('Failed to cancel appointment');
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No upcoming appointments</p>
                  <Link to="/screening">
                    <Button className="bg-primary">
                      Take a Screening
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Your completed sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-1">
                        {appointment.therapist?.user?.firstName || 'Unknown'} {appointment.therapist?.user?.lastName || 'Therapist'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(appointment.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(appointment.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              ))}
              {pastAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No past appointments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {screeningHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Screening Results</CardTitle>
              <CardDescription>Your mental health assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {screeningHistory.slice(0, 3).map((result) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-primary">{result.predictedCategory}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(result.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/screening">
                  <Button variant="outline" className="gap-2">
                    <Brain size={16} />
                    Take New Screening
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link to="/screening">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Brain size={24} />
                  <span>AI Screening</span>
                </Button>
              </Link>
              <Link to="/therapists">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Calendar size={24} />
                  <span>Find Therapist</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <User size={24} />
                <span>Profile</span>
              </Button>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Video size={24} />
                <span>Test Video</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
