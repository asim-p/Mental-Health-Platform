import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Brain, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function SymptomScreening() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [symptomText, setSymptomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSymptomText(text);
    setCharCount(text.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptomText.trim().length < 20) {
      return;
    }

    setIsAnalyzing(true);

    try {
      let result;
      if (isAuthenticated) {
        const response = await api.screening.predict(symptomText);
        result = response.data;
      } else {
        const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001';
        const res = await fetch(`${AI_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: symptomText }),
        });
        const data = await res.json();
        result = {
          category: data.category,
          confidence: data.confidence,
          recommendedSpecializations: data.recommendedSpecializations,
        };
      }

      navigate('/screening/results', {
        state: {
          symptomText,
          result,
        },
      });
    } catch (error) {
      toast.error('Failed to analyze symptoms. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const examplePrompts = [
    {
      title: 'Feeling Overwhelmed',
      text: 'I feel constantly worried about everything. My heart races and I have trouble sleeping at night. Sometimes I feel like I cannot breathe properly.',
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      title: 'Loss of Interest',
      text: "I've lost interest in things I used to enjoy. I feel hopeless and tired all the time. Even getting out of bed feels difficult these days.",
      icon: Brain,
      color: 'text-blue-500',
    },
    {
      title: 'Relationship Issues',
      text: "I'm having constant arguments with my partner and feel disconnected from loved ones. Family expectations are adding more stress to my life.",
      icon: Lightbulb,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
            <Brain className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            AI-Powered Symptom Screening
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe what you're experiencing, and our intelligent triage system will help
            identify potential concerns and recommend the right specialists for you.
          </p>
        </div>

        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={24} />
              How Our AI Screening Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Share Your Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Describe your symptoms in your own words, in any language you're comfortable
                    with.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our Linear SVC model analyzes your text using TF-IDF vectorization for
                    accurate categorization.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Get Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized therapist suggestions based on identified patterns.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Describe What You're Experiencing</CardTitle>
                <CardDescription>
                  Be as detailed as possible. The more information you provide, the more accurate
                  our recommendations will be.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <textarea
                      value={symptomText}
                      onChange={handleTextChange}
                      placeholder="Example: I've been feeling very anxious lately. My heart races, I have trouble sleeping, and I worry constantly about things that didn't bother me before. I've also noticed I'm avoiding social situations..."
                      className="w-full h-64 px-4 py-3 rounded-lg border border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-sm ${
                          charCount < 20 ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        {charCount < 20
                          ? `Please enter at least ${20 - charCount} more characters`
                          : `${charCount} characters`}
                      </span>
                      <Badge
                        variant={charCount >= 20 ? 'default' : 'secondary'}
                        className={charCount >= 20 ? 'bg-primary' : ''}
                      >
                        {charCount >= 100
                          ? 'Excellent detail'
                          : charCount >= 50
                            ? 'Good'
                            : charCount >= 20
                              ? 'Minimum met'
                              : 'Too short'}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-primary" />
                      Privacy & Confidentiality
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your responses are completely confidential and encrypted. This screening is
                      for guidance only and does not constitute a medical diagnosis. For
                      emergencies, please contact:{' '}
                      <span className="font-bold">1166 (Nepal Mental Health Helpline)</span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    disabled={isAnalyzing || symptomText.trim().length < 20}
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="animate-pulse mr-2" size={20} />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2" size={20} />
                        Analyze My Symptoms
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Descriptions</CardTitle>
                <CardDescription>Click any example to see how it works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSymptomText(prompt.text);
                      setCharCount(prompt.text.length);
                    }}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <prompt.icon
                        className={`${prompt.color} mt-1 flex-shrink-0 group-hover:scale-110 transition-transform`}
                        size={20}
                      />
                      <div>
                        <h4 className="font-bold text-sm mb-1">{prompt.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  Powered by AI
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Algorithm:</strong> Linear SVC (Support
                  Vector Classifier)
                </p>
                <p>
                  <strong className="text-foreground">Vectorization:</strong> TF-IDF (Term
                  Frequency-Inverse Document Frequency)
                </p>
                <p>
                  <strong className="text-foreground">Languages:</strong> Nepali, English, Hindi
                </p>
                <p>
                  <strong className="text-foreground">Accuracy:</strong> 87.3% on validation set
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Is this a medical diagnosis?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No. This screening is an intelligent guidance tool to help you find the right
                professional. Only a licensed mental health professional can provide an official
                diagnosis.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How accurate is the AI?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Our model has been trained on thousands of clinical symptom descriptions and
                achieves 87.3% accuracy. However, it should be used as a starting point, not a
                definitive answer.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What happens to my data?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your responses are encrypted and anonymized. We use them only to improve our AI
                model and never share personal information with third parties.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
