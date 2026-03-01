import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navbar } from "../components/navbar";
import { Calendar, Video, Clock, DollarSign, LogOut, User, Settings } from "lucide-react";

const todaysAppointments = [
  {
    id: "1",
    patientId: "P-1234",
    time: "10:00 AM",
    duration: "45 min",
    status: "upcoming",
    notes: "",
  },
  {
    id: "2",
    patientId: "P-5678",
    time: "02:00 PM",
    duration: "45 min",
    status: "upcoming",
    notes: "",
  },
];

const upcomingAppointments = [
  {
    id: "3",
    patientId: "P-9012",
    date: "2026-03-05",
    time: "11:00 AM",
    duration: "45 min",
  },
  {
    id: "4",
    patientId: "P-3456",
    date: "2026-03-06",
    time: "03:00 PM",
    duration: "45 min",
  },
];

export function TherapistDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapist Dashboard</h1>
            <p className="text-gray-600">Manage your schedule and client sessions</p>
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
                  <p className="text-sm text-gray-600 mb-1">Today's Sessions</p>
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
                  <p className="text-sm text-gray-600 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <Video className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">48</p>
                </div>
                <User className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-green-600">NPR 45,000</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>March 1, 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">Patient {appointment.patientId}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {appointment.time}
                        </span>
                        <span>{appointment.duration}</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2">
                      <Video size={14} />
                      Start Session
                    </Button>
                    <Button size="sm" variant="outline">
                      View Notes
                    </Button>
                  </div>
                </div>
              ))}
              {todaysAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-3"
                >
                  <div className="mb-2">
                    <p className="font-semibold text-sm mb-1">Patient {appointment.patientId}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(appointment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar size={16} />
                Set Availability
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
              <CardDescription>Private notes for your records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
                <p className="mb-3">Start a session to take notes</p>
                <p className="text-sm">All notes are encrypted and only visible to you</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
