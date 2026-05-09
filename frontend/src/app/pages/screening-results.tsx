import { useLocation, useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Navbar } from '../components/navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Brain,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Star,
  Languages,
} from 'lucide-react';
import { api, Therapist, ScreeningResult } from '../services/api';
import { toast } from 'sonner';

interface AnalysisResult {
  category: string;
  confidence: number;
  recommendedSpecializations: string[];
}

export function ScreeningResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);

  const symptomText = location.state?.symptomText || '';

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
    if (result) {
      setIsLoadingTherapists(true);
      api
        .screening.getRecommendations({
          category: result.recommendedSpecializations[0],
        })
        .then((response) => {
          if (response.success && response.data) {
            setTherapists(response.data);
          }
        })
        .catch(() => {
          api.therapists.getAll({ verified: 'true', limit: '3' }).then((response) => {
            if (response.success && response.data) {
              setTherapists(response.data.therapists);
            }
          });
        })
        .finally(() => setIsLoadingTherapists(false));
    }
  }, [result]);

  const getSeverityFromCategory = (category: string): 'mild' | 'moderate' | 'severe' => {
    const severeKeywords = ['suicide', 'kill', 'unbearable', 'end'];
    if (severeKeywords.some((kw) => symptomText.toLowerCase().includes(kw))) {
      return 'severe';
    }
    const moderateKeywords = ['constantly', 'every day', 'struggling', 'difficult'];
    if (moderateKeywords.some((kw) => symptomText.toLowerCase().includes(kw))) {
      return 'moderate';
    }
    return 'mild';
  };

  const getRecommendedAction = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'Immediate professional consultation recommended';
      case 'moderate':
        return 'Schedule an appointment within the next week';
      default:
        return 'Consider scheduling a consultation to discuss your concerns';
    }
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      Normal: 'No significant mental health concerns detected. You appear to be managing well.',
      Depression:
        'A mood disorder causing persistent feelings of sadness and loss of interest in activities.',
      Anxiety:
        'Excessive worry and fear that interferes with daily activities and quality of life.',
      Stress: 'Elevated stress levels that may benefit from stress management techniques.',
      Bipolar: 'Symptoms may indicate mood swings between emotional highs and lows.',
      PTSD: 'Symptoms consistent with post-traumatic stress that developed after a traumatic event.',
    };
    return descriptions[category] || 'A mental health concern that may benefit from professional support.';
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="animate-pulse text-primary mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Analyzing your symptoms...</p>
        </div>
      </div>
    );
  }

  const severity = getSeverityFromCategory(result.category);
  const recommendedAction = getRecommendedAction(severity);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Your Screening Results</h1>
          <p className="text-lg text-muted-foreground">
            Based on AI analysis of your description
          </p>
        </div>

        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{result.category}</CardTitle>
                <CardDescription className="text-base">
                  {getCategoryDescription(result.category)}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-primary">
                  {Math.round(Number(result.confidence) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Severity Level
                </h4>
                <Badge
                  className={`${
                    severity === 'severe'
                      ? 'bg-red-500'
                      : severity === 'moderate'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                  } text-white`}
                >
                  {severity.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  Recommended Specializations
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.recommendedSpecializations.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Next Step
                </h4>
                <p className="text-sm text-muted-foreground">{recommendedAction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {severity === 'severe' && (
          <Card className="mb-8 border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                    Immediate Support Available
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                    Your responses suggest you may be experiencing significant distress. Please don't
                    hesitate to reach out for immediate help.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-red-900 dark:text-red-200">
                      Nepal Mental Health Helpline: <a href="tel:1166" className="underline">1166</a>
                    </p>
                    <p className="font-bold text-red-900 dark:text-red-200">
                      Emergency Services: <a href="tel:100" className="underline">100</a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-primary" size={24} />
              Understanding Your Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">How We Analyzed Your Description</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Our AI system used a <strong>Linear SVC</strong> (Support Vector Classifier) with{' '}
                  <strong>TF-IDF vectorization</strong> to analyze your text. Here's what that
                  means:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">1. Text Preprocessing</h5>
                    <p className="text-xs text-muted-foreground">
                      Your text was cleaned and transformed into numerical features using TF-IDF
                      weighting.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">2. Feature Extraction</h5>
                    <p className="text-xs text-muted-foreground">
                      Each word was weighted based on its importance in distinguishing mental health
                      categories.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">3. Classification</h5>
                    <p className="text-xs text-muted-foreground">
                      Linear SVC draws optimal decision boundaries to classify your symptoms into
                      categories.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">4. Confidence Scoring</h5>
                    <p className="text-xs text-muted-foreground">
                      The model confidence reflects how certain it is about the classification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-primary" />
                  Important Disclaimer
                </h4>
                <p className="text-sm text-muted-foreground">
                  This screening is a guidance tool, not a medical diagnosis. Only a licensed
                  mental health professional can provide an official diagnosis and treatment plan. We
                  strongly recommend scheduling a consultation with one of our verified therapists
                  below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Recommended Specialists</h2>
              <p className="text-muted-foreground">
                Top-rated therapists specializing in {result.recommendedSpecializations[0] || result.category}
              </p>
            </div>
            <Link
              to="/therapists"
              className="text-primary font-bold hover:text-primary/90 flex items-center gap-1 group"
            >
              View all therapists
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </Link>
          </div>

          {isLoadingTherapists ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-48 bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : therapists.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {therapists.slice(0, 3).map((therapist) => (
                <Card key={therapist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-muted relative">
                    {therapist.user ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <span className="text-4xl font-bold text-primary">
                          {therapist.user.firstName?.[0]}
                          {therapist.user.lastName?.[0]}
                        </span>
                      </div>
                    ) : null}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} />
                      {Number(therapist.rating || 0).toFixed(1)}
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-1">
                      {therapist.user
                        ? `Dr. ${therapist.user.firstName} ${therapist.user.lastName}`
                        : 'Therapist'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {therapist.specialization?.join(', ') || 'Mental Health Professional'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {therapist.specialization?.slice(0, 2).map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Languages size={14} />
                        {therapist.languages?.join(', ') || 'Nepali, English'}
                      </span>
                    </div>
                    <Link to={`/book/${therapist.userId || therapist.id}`}>
                      <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        Book Session
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="text-muted-foreground mx-auto mb-4" size={48} />
                <p className="text-muted-foreground mb-4">
                  We're currently matching you with specialists.
                </p>
                <Link to="/therapists">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse All Therapists
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Choose a Therapist</h4>
                  <p className="text-sm text-muted-foreground">
                    Review profiles and select a specialist who matches your needs and preferences.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">Book Your Session</h4>
                  <p className="text-sm text-muted-foreground">
                    Pick a convenient time slot and pay securely with eSewa or Khalti.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Start Your Journey</h4>
                  <p className="text-sm text-muted-foreground">
                    Join your secure video session and begin your path to better mental health.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link to="/screening">
            <Button variant="outline" className="w-full sm:w-auto">
              Take Screening Again
            </Button>
          </Link>
          <Link to="/therapists">
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Browse All Therapists
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
