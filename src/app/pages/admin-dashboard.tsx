import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Navbar } from "../components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Users, CheckCircle, XCircle, DollarSign, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";

const pendingTherapists = [
  {
    id: "1",
    name: "Dr. Kiran Adhikari",
    email: "kiran@example.com",
    license: "NMC-12345",
    specialty: "Clinical Psychology",
    appliedDate: "2026-02-28",
  },
  {
    id: "2",
    name: "Sunita Rai",
    email: "sunita@example.com",
    license: "NMC-67890",
    specialty: "Counseling Psychology",
    appliedDate: "2026-02-27",
  },
];

const verifiedTherapists = [
  {
    id: "3",
    name: "Dr. Anjali Sharma",
    email: "anjali@example.com",
    license: "NMC-11111",
    specialty: "Clinical Psychology",
    totalSessions: 234,
    rating: 4.8,
    status: "active",
  },
  {
    id: "4",
    name: "Dr. Ramesh Thapa",
    email: "ramesh@example.com",
    license: "NMC-22222",
    specialty: "Psychiatry",
    totalSessions: 456,
    rating: 4.9,
    status: "active",
  },
];

export function AdminDashboard() {
  const [pendingList, setPendingList] = useState(pendingTherapists);

  const handleApprove = (id: string) => {
    toast.success("Therapist approved successfully!");
    setPendingList(pendingList.filter((t) => t.id !== id));
  };

  const handleReject = (id: string) => {
    toast.error("Application rejected");
    setPendingList(pendingList.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and oversight</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Therapists</p>
                  <p className="text-3xl font-bold text-gray-900">156</p>
                </div>
                <Users className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingList.length}</p>
                </div>
                <CheckCircle className="text-orange-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">12,456</p>
                </div>
                <Calendar className="text-gray-600" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">₹18.7M</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Verifications ({pendingList.length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified Therapists
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
                {pendingList.length > 0 ? (
                  <div className="space-y-4">
                    {pendingList.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="border rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{therapist.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Email: {therapist.email}</p>
                            <p>License: {therapist.license}</p>
                            <p>Specialty: {therapist.specialty}</p>
                            <p>
                              Applied:{" "}
                              {new Date(therapist.appliedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
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
                  <div className="text-center py-12 text-gray-500">
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
                      <TableHead>Specialty</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifiedTherapists.map((therapist) => (
                      <TableRow key={therapist.id}>
                        <TableCell className="font-medium">{therapist.name}</TableCell>
                        <TableCell>{therapist.specialty}</TableCell>
                        <TableCell>{therapist.totalSessions}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{therapist.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            {therapist.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <span className="text-gray-600">New Patients</span>
                      <span className="font-semibold text-lg">+234</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">New Therapists</span>
                      <span className="font-semibold text-lg">+12</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Total Sessions</span>
                      <span className="font-semibold text-lg">1,456</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-semibold text-lg text-green-600">NPR 1.2M</span>
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
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Anxiety</span>
                      <Badge variant="secondary">3,245 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Depression</span>
                      <Badge variant="secondary">2,891 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Relationship Issues</span>
                      <Badge variant="secondary">1,967 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Stress Management</span>
                      <Badge variant="secondary">1,543 sessions</Badge>
                    </div>
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
