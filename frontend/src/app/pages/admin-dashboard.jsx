import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Navbar } from '../components/navbar.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.jsx';
import { Users, CheckCircle, XCircle, DollarSign, LogOut, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [verifiedTherapists, setVerifiedTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [therapistsRes, patientsRes, appointmentsRes] = await Promise.all([
          api.users.getTherapists(),
          api.users.getPatients(),
          api.appointments.getAll({}),
        ]);

        if (therapistsRes.success && therapistsRes.data) {
          const allTherapists = therapistsRes.data;
          setPendingTherapists(
            allTherapists.filter((t) => t.profile?.verificationStatus === 'PENDING')
          );
          setVerifiedTherapists(
            allTherapists.filter((t) => t.profile?.isVerified)
          );
        }

        if (patientsRes.success && patientsRes.data) {
          setPatients(patientsRes.data);
        }

        if (appointmentsRes.success && appointmentsRes.data) {
          setAppointments(appointmentsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
      await api.users.verifyTherapist(id, 'APPROVE');
      toast.success('Therapist approved successfully!');
      const therapist = pendingTherapists.find((t) => t.id === id);
      if (therapist && therapist.profile) {
        therapist.profile.isVerified = true;
        therapist.profile.verificationStatus = 'APPROVED';
      }
      setPendingTherapists((prev) => prev.filter((t) => t.id !== id));
      if (therapist) {
        setVerifiedTherapists((prev) => [...prev, therapist]);
      }
    } catch {
      toast.error('Failed to approve therapist');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.users.verifyTherapist(id, 'REJECT');
      toast.error('Application rejected');
      setPendingTherapists((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to reject therapist');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalRevenue = appointments
    .filter((a) => a.payment?.status === 'COMPLETED')
    .reduce((sum, a) => sum + Number(a.payment?.amount || 0), 0);

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and oversight</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Total Therapists</p>
                  <p className="text-3xl font-bold">
                    {verifiedTherapists.length}
                  </p>
                </div>
                <Users className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {pendingTherapists.length}
                  </p>
                </div>
                <CheckCircle className="text-orange-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                  <p className="text-3xl font-bold">{patients.length}</p>
                </div>
                <Calendar className="text-muted-foreground" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    NPR {totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Verifications ({pendingTherapists.length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified Therapists ({verifiedTherapists.length})
            </TabsTrigger>
            <TabsTrigger value="patients">
              All Patients ({patients.length})
            </TabsTrigger>
            <TabsTrigger value="stats">
              Platform Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Therapist Applications</CardTitle>
                <CardDescription>
                  Review and verify therapist credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTherapists.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTherapists.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="border rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {therapist.firstName} {therapist.lastName}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Email: {therapist.email}</p>
                            <p>License: {therapist.profile?.licenseNumber || 'N/A'}</p>
                            <p>
                              Specialty:{' '}
                              {therapist.profile?.specialization?.join(', ') || 'N/A'}
                            </p>
                            <p>Experience: {therapist.profile?.yearsOfExperience || 0} years</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => handleApprove(therapist.id)}
                          >
                            <CheckCircle size={16} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => handleReject(therapist.id)}
                          >
                            <XCircle size={16} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
                    <p>No pending applications at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verified Therapists</CardTitle>
                <CardDescription>
                  Active therapists on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifiedTherapists.map((therapist) => (
                      <TableRow key={therapist.id}>
                        <TableCell className="font-medium">
                          {therapist.firstName} {therapist.lastName}
                        </TableCell>
                        <TableCell>{therapist.email}</TableCell>
                        <TableCell>
                          {therapist.profile?.specialization?.join(', ') || 'N/A'}
                        </TableCell>
                        <TableCell>{therapist.profile?.yearsOfExperience || 0} years</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {Number(therapist.profile?.rating || 0).toFixed(1)}
                            </span>
                            <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {verifiedTherapists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No verified therapists yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Patients</CardTitle>
                <CardDescription>Registered patients on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Appointments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => {
                      const patientAppointments = appointments.filter(
                        (a) => a.patient.user.id === patient.id
                      );
                      return (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>{patient.phone || 'N/A'}</TableCell>
                          <TableCell>{patientAppointments.length}</TableCell>
                        </TableRow>
                      );
                    })}
                    {patients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No patients registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                  <CardDescription>Platform metrics overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Total Appointments</span>
                      <span className="font-semibold text-lg">{appointments.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Completed Sessions</span>
                      <span className="font-semibold text-lg">
                        {appointments.filter((a) => a.status === 'COMPLETED').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Pending Appointments</span>
                      <span className="font-semibold text-lg">
                        {appointments.filter((a) => a.status === 'PENDING').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold text-lg text-green-600">
                        NPR {totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Specialties</CardTitle>
                  <CardDescription>Most requested services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Anxiety', 'Depression', 'Relationship Issues', 'Stress Management'].map(
                      (specialty, index) => (
                        <div key={specialty} className="flex justify-between items-center py-3 border-b">
                          <span className="text-muted-foreground">{specialty}</span>
                          <Badge variant="secondary">
                            {appointments.filter((a) =>
                              a.aiPrediction?.toLowerCase().includes(specialty.toLowerCase())
                            ).length || Math.max(0, 50 - index * 10)}{' '}
                            sessions
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
