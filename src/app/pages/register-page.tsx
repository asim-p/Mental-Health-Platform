import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Navbar } from "../components/navbar";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [therapistEmail, setTherapistEmail] = useState("");
  const [therapistPassword, setTherapistPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handlePatientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientEmail && patientPassword) {
      toast.success("Account created successfully!");
      navigate("/dashboard/patient");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleTherapistRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (therapistName && therapistEmail && therapistPassword && licenseNumber) {
      toast.success("Application submitted! You'll be notified once verified.");
      navigate("/login");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="patient">As Patient</TabsTrigger>
            <TabsTrigger value="therapist">As Therapist</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration</CardTitle>
                <CardDescription>
                  Start your mental health journey today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-reg-email">Email</Label>
                    <Input
                      id="patient-reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-reg-password">Password</Label>
                    <Input
                      id="patient-reg-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="patient-terms" />
                    <label htmlFor="patient-terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-teal-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-teal-600 hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Create Account
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                    Log in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="therapist">
            <Card>
              <CardHeader>
                <CardTitle>Therapist Application</CardTitle>
                <CardDescription>
                  Join our network of mental health professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTherapistRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="therapist-name">Full Name</Label>
                    <Input
                      id="therapist-name"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={therapistName}
                      onChange={(e) => setTherapistName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-reg-email">Email</Label>
                    <Input
                      id="therapist-reg-email"
                      type="email"
                      placeholder="therapist@example.com"
                      value={therapistEmail}
                      onChange={(e) => setTherapistEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-reg-password">Password</Label>
                    <Input
                      id="therapist-reg-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={therapistPassword}
                      onChange={(e) => setTherapistPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license-number">License Number</Label>
                    <Input
                      id="license-number"
                      type="text"
                      placeholder="Nepal Medical Council ID"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Your credentials will be verified before activation
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="therapist-terms" />
                    <label htmlFor="therapist-terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-teal-600 hover:underline">
                        Provider Agreement
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-teal-600 hover:underline">
                        Code of Conduct
                      </a>
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Submit Application
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-600">Already registered? </span>
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                    Log in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
