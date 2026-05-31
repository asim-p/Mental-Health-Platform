import { useLocation, useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Navbar } from '../components/navbar.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import {
  Brain,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  DollarSign,
  User
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';

export function ScreeningResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const symptomText = location.state?.symptomText || '';
  const preferences = location.state?.preferences || { budget: 'any', gender: 'any', language: 'any' };

  useEffect(() => {
    if (!symptomText) {
      navigate('/screening');
      return;
    }

    const stateResult = location.state?.result;
    if (stateResult) {
      setResult(stateResult);
    }
  }, [symptomText, location.state, navigate]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!result?.category) return;
      setIsLoadingRecs(true);
      try {
        const params = { category: result.category };
        if (preferences.gender !== 'any') params.gender = preferences.gender;
        if (preferences.language !== 'any') params.language = preferences.language;
        if (preferences.budget === 'low') params.budget = 1500;
        if (preferences.budget === 'mid') params.budget = 3000;
        if (preferences.budget === 'high') params.budget = 10000;

        const response = await api.screening.getRecommendations(params);
        if (response.success) {
          setRecommendations(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [result, preferences]);

  const getCategoryDescription = (category) => {
    const descriptions = {
      Normal: "While our AI hasn't detected specific clinical symptoms, AI screening is not 100% accurate. We recommend a General Consultation to discuss your overall well-being with a professional.",
      Depression:
        'A mood disorder causing persistent feelings of sadness and loss of interest in activities.',
      Anxiety:
        'Excessive worry and fear that interferes with daily activities and quality of life.',
      Stress: 'Elevated stress levels that may benefit from stress management techniques.',
      Bipolar: 'Symptoms may indicate mood swings between emotional highs and lows.',
      Suicidal: 'Severe distress detected. Please prioritize your safety and reach out for help immediately.',
      'Personality disorder': 'Patterns of thinking or behavior that may benefit from specialized clinical support.',
    };
    return descriptions[category] || 'A mental health concern that may benefit from professional support.';
  };

  const handleBook = (therapistId) => {
    if (!isAuthenticated) {
      toast.info("Please login to book your appointment");
      navigate('/login', { state: { from: `/book/${therapistId}` } });
    } else {
      navigate(`/book/${therapistId}`);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="animate-pulse text-primary mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Gathering your results...</p>
        </div>
      </div>
    );
  }

  const isSevere = result.category === 'Suicidal' || result.category === 'Bipolar';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-border p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center flex-shrink-0">
              <Brain className="text-primary" size={48} />
            </div>
            <div className="flex-1">
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Analysis Complete</p>
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                You're likely showing signs of <span className="text-primary">{result.category}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-5">
                {getCategoryDescription(result.category)}
              </p>

              {result.confidence != null && (
                <p className="text-sm text-muted-foreground">
                  Model confidence: <span className="font-semibold text-foreground">{result.confidence.toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Users className="text-primary" size={24} />
                  Top Matches for You
                </h2>
                <Badge variant="outline" className="bg-white">
                  {recommendations.length} {recommendations.length === 1 ? 'Match' : 'Matches'}
                </Badge>
              </div>

              {isLoadingRecs ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Matching with specialized therapists...</p>
                  </div>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid gap-4">
                  {recommendations.map((therapist) => (
                    <Card key={therapist.id} className="overflow-hidden hover:border-primary transition-all group">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="p-6 flex-grow">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                                {therapist.user?.firstName[0]}{therapist.user?.lastName[0]}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg leading-none mb-1">
                                  Dr. {therapist.user?.firstName} {therapist.user?.lastName}
                                </h3>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {therapist.specialization?.map((s) => (
                                <Badge key={s} variant="secondary" className="text-[10px] bg-secondary/50">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} />
                                NPR {therapist.hourlyRate}/session
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {therapist.gender}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 sm:w-48 p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l">
                            <Button 
                              onClick={() => handleBook(therapist.user?.id)}
                              className="w-full bg-primary hover:bg-primary/90 font-bold"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                  <p className="text-muted-foreground mb-4">No exact matches found for your current preferences.</p>
                  <Link to="/therapists">
                    <Button variant="outline" className="font-bold">
                      Browse All 500+ Therapists
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/screening" className="flex-1">
                <Button variant="outline" className="w-full h-12">
                  Retake Screening
                </Button>
              </Link>
              <Link to="/therapists" className="flex-1">
                <Button className="w-full h-12 bg-primary font-bold gap-2">
                  View Full Directory
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-destructive text-destructive-foreground border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Phone size={80} />
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle size={20} />
                  Emergency Help
                </CardTitle>
                <CardDescription className="text-destructive-foreground/80">
                  If you are in immediate danger or need someone to talk to right now.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-xs uppercase tracking-widest font-bold mb-1 opacity-70">24/7 Helpline</p>
                  <a href="tel:1166" className="text-3xl font-black block hover:underline">1166</a>
                </div>
                <p className="text-[10px] text-center opacity-70 italic">
                  National Suicide Prevention Helpline Nepal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  Your Input Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Budget: {preferences.budget === 'any' ? 'Any' : preferences.budget === 'low' ? '< 1500' : 'Flexible'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Gender: {preferences.gender}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Language: {preferences.language}
                    </Badge>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12 px-6">
          Disclaimer: This AI analysis is for informational purposes only and does not constitute a clinical diagnosis. Always consult with a qualified healthcare professional.
        </p>
      </main>
    </div>
  );
}
