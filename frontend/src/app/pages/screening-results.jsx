import { useLocation, useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Navbar } from '../components/navbar.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import {
  Brain,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { api } from '../services/api.js';
import { toast } from 'sonner';

export function ScreeningResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

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

  const getCategoryDescription = (category) => {
    const descriptions = {
      Normal: 'No significant mental health concerns detected. You appear to be managing well.',
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

  const isSevere = result.category === 'Suicidal' || ['suicide', 'kill', 'end', 'die'].some(kw => symptomText.toLowerCase().includes(kw));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[800px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Screening Result</h1>
          <p className="text-lg text-muted-foreground">
            Analysis completed successfully
          </p>
        </div>

        <Card className="mb-8 border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-primary/5 text-center py-10">
            <CardTitle className="text-3xl font-black text-primary mb-2 uppercase tracking-tight">
              {result.category}
            </CardTitle>
            <CardDescription className="text-lg max-w-md mx-auto">
              {getCategoryDescription(result.category)}
            </CardDescription>
          </CardHeader>
        </Card>

        {isSevere && (
          <Card className="mb-8 border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                    Immediate Support Available
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                    Please reach out for immediate help if you are in distress.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-red-900 dark:text-red-200">
                      Nepal Mental Health Helpline: <a href="tel:1166" className="underline font-black text-lg ml-2">1166</a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4 mt-8">
          <Link to="/therapists">
            <Button className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Therapists
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
          <Link to="/screening">
            <Button variant="outline" className="w-full h-12">
              Take Screening Again
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12 px-6">
          Disclaimer: This is a guidance tool, not a medical diagnosis. Please consult a licensed professional.
        </p>
      </main>
    </div>
  );
}
