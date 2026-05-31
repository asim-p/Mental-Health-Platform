import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { Loader2, Save, User, DollarSign, BookOpen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group.jsx';

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

export function TherapistProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    hourlyRate: '',
    specialization: [],
    qualifications: '',
    yearsOfExperience: '',
    languages: [],
    gender: '',
  });
  const [otherSpecialty, setOtherSpecialty] = useState('');
  const [otherLanguage, setOtherLanguage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'THERAPIST') {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.therapists.getById(user.id);
        if (response.success && response.data) {
          const profile = response.data;
          setFormData({
            bio: profile.bio || '',
            hourlyRate: profile.hourlyRate || '',
            specialization: profile.specialization || [],
            qualifications: profile.qualifications?.join(', ') || '',
            yearsOfExperience: profile.yearsOfExperience || '',
            languages: profile.languages || [],
            gender: profile.gender || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleToggleTag = (field, tag) => {
    const currentTags = [...formData[field]];
    const index = currentTags.indexOf(tag);
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }
    setFormData({ ...formData, [field]: currentTags });
  };

  const handleAddOther = (field, value, setValue) => {
    if (!value.trim()) return;
    if (!formData[field].includes(value.trim())) {
      setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    }
    setValue('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        qualifications: formData.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
      };

      const response = await api.therapists.updateProfile(payload);
      if (response.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your professional information visible to patients</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your public bio and professional background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell patients about your approach and experience..."
                    className="min-h-[150px]"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="g-male" />
                      <Label htmlFor="g-male" className="cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="g-female" />
                      <Label htmlFor="g-female" className="cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="g-other" />
                      <Label htmlFor="g-other" className="cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {CORE_LANGUAGES.map(lang => (
                        <Button
                          key={lang}
                          type="button"
                          variant={formData.languages.includes(lang) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleTag('languages', lang)}
                          className="rounded-full"
                        >
                          {lang}
                        </Button>
                      ))}
                      {formData.languages.filter(l => !CORE_LANGUAGES.includes(l)).map(lang => (
                        <Button
                          key={lang}
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleToggleTag('languages', lang)}
                          className="rounded-full bg-teal-600"
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Expertise & Qualifications
                </CardTitle>
                <CardDescription>Your clinical focus and educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CORE_SPECIALTIES.map(spec => (
                      <Button
                        key={spec}
                        type="button"
                        variant={formData.specialization.includes(spec) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleTag('specialization', spec)}
                        className="rounded-full"
                      >
                        {spec}
                      </Button>
                    ))}
                    {formData.specialization.filter(s => !CORE_SPECIALTIES.includes(s)).map(spec => (
                      <Button
                        key={spec}
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleToggleTag('specialization', spec)}
                        className="rounded-full bg-teal-600"
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
                  <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
                  <Input
                    id="qualifications"
                    placeholder="MA in Psychology, PhD, etc."
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} className="text-primary" />
                  Pricing
                </CardTitle>
                <CardDescription>Set your consultation fees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate (NPR)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="1500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/therapist')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
