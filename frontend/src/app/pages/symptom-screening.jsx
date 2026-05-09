import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/navbar.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Label } from '../components/ui/label.jsx';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group.jsx';
import { Brain, AlertCircle, CheckCircle2, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';

export function SymptomScreening() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [symptomText, setSymptomText] = useState('');
  const [preferences, setPreferences] = useState({
    budget: 'any',
    gender: 'any',
    language: 'any',
    urgency: 'normal'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setSymptomText(text);
    setCharCount(text.length);
  };

  const handleNextStep = () => {
    if (symptomText.trim().length < 20) {
      toast.error('Please describe your symptoms in more detail (min 20 chars)');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
          preferences
        },
      });
    } catch (error) {
      console.error('Analysis error:', error);
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

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
            <Brain className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black mb-4">
            AI-Powered Support Finder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Step {step} of 2: {step === 1 ? "Describe your concerns" : "Tell us your preferences"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Describe What You're Experiencing</CardTitle>
                  <CardDescription>
                    Your story helps us identify the right patterns and match you with specialized care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <textarea
                      value={symptomText}
                      onChange={handleTextChange}
                      placeholder="Example: I've been feeling very anxious lately. My heart races, I have trouble sleeping, and I worry constantly..."
                      className="w-full h-64 px-4 py-3 rounded-lg border border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${charCount < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {charCount < 20 ? `Min 20 characters required (${20 - charCount} left)` : `${charCount} characters`}
                      </span>
                      <Badge variant={charCount >= 100 ? 'default' : 'secondary'}>
                        {charCount >= 100 ? 'Excellent detail' : charCount >= 20 ? 'Minimum met' : 'Too short'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90 gap-2"
                    disabled={charCount < 20}
                  >
                    Continue to Preferences
                    <ArrowRight size={20} />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Tell Us Your Preferences</CardTitle>
                  <CardDescription>
                    This helps us filter therapists that match your lifestyle and budget.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-bold">What is your budget per session?</Label>
                    <RadioGroup 
                      value={preferences.budget} 
                      onValueChange={(val) => setPreferences({...preferences, budget: val})}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="any" id="b-any" />
                        <Label htmlFor="b-any" className="cursor-pointer">Any Budget</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="low" id="b-low" />
                        <Label htmlFor="b-low" className="cursor-pointer">Under Rs. 1500</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="mid" id="b-mid" />
                        <Label htmlFor="b-mid" className="cursor-pointer">Rs. 1500 - 3000</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="high" id="b-high" />
                        <Label htmlFor="b-high" className="cursor-pointer">Rs. 3000+</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-bold">Preferred Therapist Gender</Label>
                    <RadioGroup 
                      value={preferences.gender} 
                      onValueChange={(val) => setPreferences({...preferences, gender: val})}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="g-any" />
                        <Label htmlFor="g-any">Any</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="g-female" />
                        <Label htmlFor="g-female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="g-male" />
                        <Label htmlFor="g-male">Male</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-bold">Preferred Language</Label>
                    <RadioGroup 
                      value={preferences.language} 
                      onValueChange={(val) => setPreferences({...preferences, language: val})}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="l-any" />
                        <Label htmlFor="l-any">Any</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Nepali" id="l-nepali" />
                        <Label htmlFor="l-nepali">Nepali</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="English" id="l-english" />
                        <Label htmlFor="l-english">English</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Newari" id="l-newari" />
                        <Label htmlFor="l-newari">Newari</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-[2] h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90 gap-2"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Brain className="animate-pulse" size={20} />
                          Analyzing Patterns...
                        </>
                      ) : (
                        <>
                          <Brain size={20} />
                          Analyze & Find Match
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {step === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Examples</CardTitle>
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
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <Lightbulb size={20} />
                  Pro Tip
                </h4>
                <p className="text-sm text-primary/80 leading-relaxed">
                  Choosing a preferred gender or budget helps our matching engine narrow down from our 500+ licensed professionals to the top 3 most relevant for you.
                </p>
              </div>
            )}

            <div className="bg-muted/30 p-6 rounded-xl border border-dashed border-muted-foreground/30">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-destructive" />
                In Crisis?
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                If you are in immediate danger or thinking about self-harm, please call:
              </p>
              <a 
                href="tel:1166" 
                className="block text-center py-2 px-4 bg-destructive text-destructive-foreground rounded-lg font-black text-lg hover:scale-105 transition-transform"
              >
                Call 1166
              </a>
              <p className="text-[10px] text-center mt-2 text-muted-foreground">
                Nepal Mental Health Crisis Helpline
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
