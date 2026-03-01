import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navbar } from "../components/navbar";
import { Calendar, Video, Clock, User, LogOut } from "lucide-react";

const upcomingAppointments = [
  {
    id: "1",
    therapistName: "Dr. Anjali Sharma",
    date: "2026-03-05",
    time: "10:00 AM",
    duration: "45 min",
    status: "confirmed",
  },
  {
    id: "2",
    therapistName: "Dr. Ramesh Thapa",
    date: "2026-03-08",
    time: "02:00 PM",
    duration: "45 min",
    status: "confirmed",
  },
];

const pastAppointments = [
  {
    id: "3",
    therapistName: "Sita Gurung",
    date: "2026-02-25",
    time: "03:00 PM",
    duration: "45 min",
    status: "completed",
  },
  {
    id: "4",
    therapistName: "Dr. Anjali Sharma",
    date: "2026-02-18",
    time: "10:00 AM",
    duration: "45 min",
    status: "completed",
  },
];

export function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">Manage your appointments and mental health journey</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <LogOut size={16} />
              Logout
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
                  <p className="text-3xl font-bold text-teal-600">2</p>
                </div>
                <Calendar className="text-teal-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <Video className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-900">6</p>
                </div>
                <Clock className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Therapists</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <User className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{appointment.therapistName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2">
                      <Video size={14} />
                      Join Session
                    </Button>
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No upcoming appointments</p>
                  <Link to="/therapists">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      Book an Appointment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Your appointment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-1">{appointment.therapistName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/therapists">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Calendar size={24} />
                  <span>Book New Session</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <User size={24} />
                <span>Update Profile</span>
              </Button>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Video size={24} />
                <span>Test Video Setup</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
