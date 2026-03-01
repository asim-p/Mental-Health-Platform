import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Navbar } from "../components/navbar";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [therapistEmail, setTherapistEmail] = useState("");
  const [therapistPassword, setTherapistPassword] = useState("");

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (patientEmail && patientPassword) {
      toast.success("Welcome back!");
      navigate("/dashboard/patient");
    } else {
      toast.error("Please enter your credentials");
    }
  };

  const handleTherapistLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (therapistEmail && therapistPassword) {
      toast.success("Welcome back!");
      navigate("/dashboard/therapist");
    } else {
      toast.error("Please enter your credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to access your account</p>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="therapist">Therapist</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <Card>
              <CardHeader>
                <CardTitle>Patient Login</CardTitle>
                <CardDescription>
                  Access your appointments and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="you@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="••••••••"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Log In
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="therapist">
            <Card>
              <CardHeader>
                <CardTitle>Therapist Login</CardTitle>
                <CardDescription>
                  Access your schedule and client information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTherapistLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="therapist-email">Email</Label>
                    <Input
                      id="therapist-email"
                      type="email"
                      placeholder="therapist@example.com"
                      value={therapistEmail}
                      onChange={(e) => setTherapistEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-password">Password</Label>
                    <Input
                      id="therapist-password"
                      type="password"
                      placeholder="••••••••"
                      value={therapistPassword}
                      onChange={(e) => setTherapistPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Log In
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-600">Want to join as a therapist? </span>
                  <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                    Apply now
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials: Use any email/password to log in</p>
        </div>
      </div>
    </div>
  );
}
