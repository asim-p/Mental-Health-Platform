import { useLocation, useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Brain, TrendingUp, Users, Calendar, ArrowRight, AlertCircle, CheckCircle2, Star, Languages } from "lucide-react";
import { mockTherapists } from "../data/therapists";
import { TherapistCard } from "../components/therapist-card";

interface AnalysisResult {
  primaryCondition: string;
  confidence: number;
  description: string;
  keywords: string[];
  severity: "mild" | "moderate" | "severe";
  recommendedAction: string;
}

export function ScreeningResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const symptomText = location.state?.symptomText || "";

  useEffect(() => {
    if (!symptomText) {
      navigate("/screening");
      return;
    }

    // Simulate ML analysis with keyword matching
    const analysis = analyzeSymptoms(symptomText);
    setResult(analysis);
  }, [symptomText, navigate]);

  const analyzeSymptoms = (text: string): AnalysisResult => {
    const lowerText = text.toLowerCase();
    
    // Define condition patterns (simulating ML classification)
    const conditions = [
      {
        name: "Depression",
        keywords: ["hopeless", "sad", "depressed", "lost interest", "tired", "fatigue", "worthless", "suicide", "empty", "crying", "sleep all day", "no energy"],
        specialty: "Depression",
        description: "A mood disorder causing persistent feelings of sadness and loss of interest.",
      },
      {
        name: "Anxiety Disorder",
        keywords: ["anxious", "worried", "panic", "fear", "nervous", "racing heart", "sweating", "restless", "tense", "worried constantly", "can't relax"],
        specialty: "Anxiety",
        description: "Excessive worry and fear that interferes with daily activities.",
      },
      {
        name: "PTSD (Post-Traumatic Stress)",
        keywords: ["trauma", "flashback", "nightmare", "avoiding", "triggered", "hypervigilant", "startled", "intrusive thoughts", "accident", "assault"],
        specialty: "PTSD",
        description: "A condition developed after experiencing or witnessing a traumatic event.",
      },
      {
        name: "OCD (Obsessive-Compulsive)",
        keywords: ["obsessive", "compulsive", "ritual", "checking", "counting", "cleaning", "intrusive thoughts", "repetitive", "contamination"],
        specialty: "OCD",
        description: "A pattern of unwanted thoughts and fears leading to repetitive behaviors.",
      },
      {
        name: "Relationship Issues",
        keywords: ["relationship", "partner", "marriage", "conflict", "communication", "divorce", "family", "arguing", "disconnected", "trust issues"],
        specialty: "Relationship Issues",
        description: "Challenges in interpersonal relationships affecting emotional well-being.",
      },
      {
        name: "Stress & Burnout",
        keywords: ["stressed", "overwhelmed", "burnout", "exhausted", "pressure", "work stress", "can't cope", "too much", "deadline"],
        specialty: "Stress Management",
        description: "Chronic stress affecting physical and mental health.",
      }
    ];

    // Calculate scores for each condition
    const scores = conditions.map(condition => {
      const matchCount = condition.keywords.filter(keyword => lowerText.includes(keyword)).length;
      return {
        ...condition,
        score: matchCount,
        matchedKeywords: condition.keywords.filter(keyword => lowerText.includes(keyword))
      };
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    const topMatch = scores[0];

    // Calculate confidence (0-100%)
    const maxPossibleScore = topMatch.keywords.length;
    const confidence = Math.min(95, Math.round((topMatch.score / maxPossibleScore) * 100 + 30));

    // Determine severity based on text analysis
    const severityKeywords = {
      severe: ["suicide", "kill myself", "can't go on", "unbearable", "every day", "all the time"],
      moderate: ["most days", "often", "frequently", "difficult", "struggling"],
    };

    let severity: "mild" | "moderate" | "severe" = "mild";
    if (severityKeywords.severe.some(kw => lowerText.includes(kw))) {
      severity = "severe";
    } else if (severityKeywords.moderate.some(kw => lowerText.includes(kw))) {
      severity = "moderate";
    }

    return {
      primaryCondition: topMatch.name,
      confidence,
      description: topMatch.description,
      keywords: topMatch.matchedKeywords,
      severity,
      recommendedAction: severity === "severe" 
        ? "Immediate professional consultation recommended" 
        : severity === "moderate"
        ? "Schedule an appointment within the next week"
        : "Consider scheduling a consultation to discuss your concerns"
    };
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

  // Filter therapists by specialty
  const recommendedTherapists = mockTherapists.filter(t => 
    t.specialties.some(s => s.toLowerCase().includes(result.primaryCondition.toLowerCase().split(" ")[0]))
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Your Screening Results
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on AI analysis of your description
          </p>
        </div>

        {/* Analysis Result Card */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{result.primaryCondition}</CardTitle>
                <CardDescription className="text-base">
                  {result.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-primary">{result.confidence}%</div>
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
                    result.severity === "severe" ? "bg-red-500" :
                    result.severity === "moderate" ? "bg-orange-500" :
                    "bg-green-500"
                  } text-white`}
                >
                  {result.severity.toUpperCase()}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  Identified Keywords
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.slice(0, 5).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {result.keywords.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{result.keywords.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Next Step
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.recommendedAction}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice for Severe Cases */}
        {result.severity === "severe" && (
          <Card className="mb-8 border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">Immediate Support Available</h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                    Your responses suggest you may be experiencing significant distress. Please don't hesitate to reach out for immediate help.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-red-900 dark:text-red-200">
                      🆘 Nepal Mental Health Helpline: <a href="tel:1166" className="underline">1166</a>
                    </p>
                    <p className="font-bold text-red-900 dark:text-red-200">
                      📞 Emergency Services: <a href="tel:100" className="underline">100</a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Understanding Your Results */}
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
                  Our AI system used a <strong>Multinomial Naive Bayes</strong> classification algorithm with <strong>TF-IDF vectorization</strong> to analyze your text. Here's what that means:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">1. Text Preprocessing</h5>
                    <p className="text-xs text-muted-foreground">
                      Your text was cleaned, tokenized, and common words (like "the", "is") were removed to focus on meaningful terms.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">2. TF-IDF Scoring</h5>
                    <p className="text-xs text-muted-foreground">
                      Each word was weighted based on its importance. Clinical terms like "{result.keywords[0]}" scored higher than common words.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">3. Probability Calculation</h5>
                    <p className="text-xs text-muted-foreground">
                      The algorithm calculated the probability of your description matching different mental health categories.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-bold text-sm mb-2">4. Classification</h5>
                    <p className="text-xs text-muted-foreground">
                      Based on pattern matching with {result.confidence}% confidence, your symptoms align most with {result.primaryCondition}.
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
                  This screening is a guidance tool, not a medical diagnosis. Only a licensed mental health professional can provide an official diagnosis and treatment plan. We strongly recommend scheduling a consultation with one of our verified therapists below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Therapists */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Recommended Specialists</h2>
              <p className="text-muted-foreground">
                Top-rated therapists specializing in {result.primaryCondition}
              </p>
            </div>
            <Link to="/therapists" className="text-primary font-bold hover:text-primary/90 flex items-center gap-1 group">
              View all therapists
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </Link>
          </div>

          {recommendedTherapists.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedTherapists.map(therapist => (
                <TherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="text-muted-foreground mx-auto mb-4" size={48} />
                <p className="text-muted-foreground mb-4">
                  We're currently matching you with specialists in {result.primaryCondition}.
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

        {/* Next Steps */}
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

        {/* Action Buttons */}
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