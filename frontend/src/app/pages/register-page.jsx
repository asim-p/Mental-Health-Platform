import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { Checkbox } from '../components/ui/checkbox.jsx';
import { Navbar } from '../components/navbar.jsx';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';

const CORE_SPECIALTIES = [
  "General Consultation",
  "Depression",
  "Anxiety",
  "Stress",
  "Bipolar",
  "Suicidal",
  "Personality disorder",
];

const CORE_LANGUAGES = ["Nepali", "English", "Newari", "Maithili", "Bhojpuri"];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [therapistForm, setTherapistForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    specialization: [],
    yearsOfExperience: '',
    bio: '',
    hourlyRate: '',
    gender: 'Other',
    languages: [],
    qualifications: '',
  });

  const [otherSpecialty, setOtherSpecialty] = useState('');
  const [otherLanguage, setOtherLanguage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTag = (field, tag) => {
    const currentTags = [...therapistForm[field]];
    const index = currentTags.indexOf(tag);
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }
    setTherapistForm({ ...therapistForm, [field]: currentTags });
  };

  const handleAddOther = (field, value, setValue) => {
    if (!value.trim()) return;
    if (!therapistForm[field].includes(value.trim())) {
      setTherapistForm({ ...therapistForm, [field]: [...therapistForm[field], value.trim()] });
    }
    setValue('');
  };

  const handlePatientRegister = async (e) => {
    e.preventDefault();

    if (patientForm.password !== patientForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (patientForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: patientForm.email,
        password: patientForm.password,
        firstName: patientForm.firstName,
        lastName: patientForm.lastName,
        phone: patientForm.phone,
        role: 'PATIENT',
      });

      toast.success('Account created successfully!');
      navigate('/dashboard/patient');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTherapistRegister = async (e) => {
    e.preventDefault();

    if (therapistForm.password !== therapistForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (therapistForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: therapistForm.email,
        password: therapistForm.password,
        firstName: therapistForm.firstName,
        lastName: therapistForm.lastName,
        phone: therapistForm.phone,
        role: 'THERAPIST',
        therapistData: {
          specialization: therapistForm.specialization,
          yearsOfExperience: parseInt(therapistForm.yearsOfExperience) || 0,
          bio: therapistForm.bio,
          licenseNumber: therapistForm.licenseNumber,
          hourlyRate: parseFloat(therapistForm.hourlyRate) || 0,
          gender: therapistForm.gender,
          languages: therapistForm.languages,
          qualifications: therapistForm.qualifications.split(',').map((s) => s.trim()),
        },
      });

      toast.success('Account created successfully!');
      navigate('/dashboard/therapist');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Get Started</h1>
          <p className="text-muted-foreground">Create your account</p>
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
                <CardDescription>Start your mental health journey today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-first-name">First Name</Label>
                      <Input
                        id="patient-first-name"
                        type="text"
                        placeholder="John"
                        value={patientForm.firstName}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-last-name">Last Name</Label>
                      <Input
                        id="patient-last-name"
                        type="text"
                        placeholder="Doe"
                        value={patientForm.lastName}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="you@example.com"
                      value={patientForm.email}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Phone (optional)</Label>
                    <Input
                      id="patient-phone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={patientForm.phone}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="Create a strong password (min 8 chars)"
                      value={patientForm.password}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-confirm-password">Confirm Password</Label>
                    <Input
                      id="patient-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={patientForm.confirmPassword}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="patient-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked)}
                    />
                    <label htmlFor="patient-terms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading || !agreedToTerms}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link to="/login" className="text-primary hover:text-primary/90 font-medium">
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
                <CardDescription>Join our network of mental health professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTherapistRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="therapist-first-name">First Name</Label>
                      <Input
                        id="therapist-first-name"
                        type="text"
                        placeholder="John"
                        value={therapistForm.firstName}
                        onChange={(e) =>
                          setTherapistForm({ ...therapistForm, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-last-name">Last Name</Label>
                      <Input
                        id="therapist-last-name"
                        type="text"
                        placeholder="Doe"
                        value={therapistForm.lastName}
                        onChange={(e) =>
                          setTherapistForm({ ...therapistForm, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-email">Email</Label>
                    <Input
                      id="therapist-email"
                      type="email"
                      placeholder="therapist@example.com"
                      value={therapistForm.email}
                      onChange={(e) =>
                        setTherapistForm({ ...therapistForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license-number">License Number</Label>
                    <Input
                      id="license-number"
                      type="text"
                      placeholder="Nepal Medical Council ID"
                      value={therapistForm.licenseNumber}
                      onChange={(e) =>
                        setTherapistForm({ ...therapistForm, licenseNumber: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Your credentials will be verified before activation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {CORE_SPECIALTIES.map(spec => (
                        <Button
                          key={spec}
                          type="button"
                          variant={therapistForm.specialization.includes(spec) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleTag('specialization', spec)}
                          className="rounded-full h-8 text-xs"
                        >
                          {spec}
                        </Button>
                      ))}
                      {therapistForm.specialization.filter(s => !CORE_SPECIALTIES.includes(s)).map(spec => (
                        <Button
                          key={spec}
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleToggleTag('specialization', spec)}
                          className="rounded-full h-8 text-xs bg-teal-600"
                        >
                          {spec} ×
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Other specialty..."
                        value={otherSpecialty}
                        onChange={(e) => setOtherSpecialty(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleAddOther('specialization', otherSpecialty, setOtherSpecialty)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years-of-experience">Years of Experience</Label>
                    <Input
                      id="years-of-experience"
                      type="number"
                      placeholder="5"
                      value={therapistForm.yearsOfExperience}
                      onChange={(e) =>
                        setTherapistForm({ ...therapistForm, yearsOfExperience: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      type="text"
                      placeholder="Brief professional background"
                      value={therapistForm.bio}
                      onChange={(e) => setTherapistForm({ ...therapistForm, bio: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourly-rate">Hourly Rate (NPR)</Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        placeholder="1500"
                        value={therapistForm.hourlyRate}
                        onChange={(e) => setTherapistForm({ ...therapistForm, hourlyRate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={therapistForm.gender}
                        onChange={(e) => setTherapistForm({ ...therapistForm, gender: e.target.value })}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {CORE_LANGUAGES.map(lang => (
                        <Button
                          key={lang}
                          type="button"
                          variant={therapistForm.languages.includes(lang) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleTag('languages', lang)}
                          className="rounded-full h-8 text-xs"
                        >
                          {lang}
                        </Button>
                      ))}
                      {therapistForm.languages.filter(l => !CORE_LANGUAGES.includes(l)).map(lang => (
                        <Button
                          key={lang}
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleToggleTag('languages', lang)}
                          className="rounded-full h-8 text-xs bg-teal-600"
                        >
                          {lang} ×
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Other language..."
                        value={otherLanguage}
                        onChange={(e) => setOtherLanguage(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleAddOther('languages', otherLanguage, setOtherLanguage)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      type="text"
                      placeholder="MA Psychology, PhD (comma separated)"
                      value={therapistForm.qualifications}
                      onChange={(e) => setTherapistForm({ ...therapistForm, qualifications: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-password">Password</Label>
                    <Input
                      id="therapist-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={therapistForm.password}
                      onChange={(e) =>
                        setTherapistForm({ ...therapistForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapist-confirm-password">Confirm Password</Label>
                    <Input
                      id="therapist-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={therapistForm.confirmPassword}
                      onChange={(e) =>
                        setTherapistForm({ ...therapistForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="therapist-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked)}
                    />
                    <label htmlFor="therapist-terms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">
                        Provider Agreement
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:underline">
                        Code of Conduct
                      </a>
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading || !agreedToTerms}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">Already registered? </span>
                  <Link to="/login" className="text-primary hover:text-primary/90 font-medium">
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
