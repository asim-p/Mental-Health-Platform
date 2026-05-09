import { Navbar } from "../components/navbar.jsx";
import { Search, Calendar, Video, Brain } from "lucide-react";

export function HowItWorksPage() {
  const steps = [
    {
      icon: <Search size={48} />,
      title: "1. Search for a Therapist",
      description: "Browse our directory of licensed psychologists and psychiatrists. Filter by specialty, language, and price to find the best match for your needs."
    },
    {
      icon: <Brain size={48} />,
      title: "2. AI Symptom Screening",
      description: "Not sure where to start? Take our quick AI-powered screening to get a preliminary analysis and personalized recommendations for specialists."
    },
    {
      icon: <Calendar size={48} />,
      title: "3. Book an Appointment",
      description: "Choose a time that works for you and book your session instantly. Pay securely using local payment methods like eSewa or Khalti."
    },
    {
      icon: <Video size={48} />,
      title: "4. Start Your Session",
      description: "Join your private, encrypted video consultation from anywhere. Connect with your therapist in a safe and confidential environment."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">How It Works</h1>
          <p className="text-xl text-muted-foreground">
            A simple, secure, and effective way to access professional mental health support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary mb-6">
                {step.icon}
              </div>
              <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>


      </main>
      <footer className="bg-card border-t border-border mt-auto">
        <div className="px-4 md:px-10 py-6 max-w-[1280px] mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 Mental Health Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
