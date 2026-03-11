import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/navbar";
import { Search, Calendar, Video, Shield, Languages, DollarSign, Star } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Brain, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[1280px] mx-auto flex flex-col">
        {/* Hero Section */}
        <div className="px-4 md:px-10 py-12 md:py-16">
          <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-6 lg:w-1/2">
              <div className="flex flex-col gap-4">
                <span className="text-primary font-bold tracking-wide uppercase text-sm">
                  Mental Health Nepal
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  Professional Mental Health Support, Accessible Anywhere in Nepal.
                </h1>
                <p className="text-lg text-muted-foreground max-w-[540px]">
                  Bridging the gap with licensed psychologists and psychiatrists, offering you a safe, confidential space to heal and grow.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/therapists">
                  <Button className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Find My Therapist
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" className="h-12 px-8 rounded-lg font-bold w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <div className="flex -space-x-2 overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1748344386932-f0b9c7b925e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIweW91bmclMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM1NzU0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Patient"
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjMxODI4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Patient"
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1770058428154-9eee8a6a1fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwd29tYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzIzMjAwNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Patient"
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Trusted by 5,000+ patients in Nepal
                </span>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1555069855-e580a9adbf43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGhlcmFweSUyMGdyb3VwJTIwc2Vzc2lvbnxlbnwxfHx8fDE3NzIzNTc1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Therapist helping patients"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] transform hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-10 -mt-6 mb-12 relative z-20">
          <div className="bg-card p-6 rounded-xl shadow-xl border border-border max-w-[1080px] mx-auto">
            <form className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold mb-2">Specialty</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select className="w-full h-12 pl-10 pr-4 rounded-lg bg-input-background border border-border focus:border-primary focus:ring-primary appearance-none">
                    <option>Anxiety & Depression</option>
                    <option>Relationship Issues</option>
                    <option>Child Psychology</option>
                    <option>Trauma & PTSD</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold mb-2">Language</label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select className="w-full h-12 pl-10 pr-4 rounded-lg bg-input-background border border-border focus:border-primary focus:ring-primary appearance-none">
                    <option>Nepali</option>
                    <option>English</option>
                    <option>Newari</option>
                    <option>Maithili</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold mb-2">Budget (per session)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select className="w-full h-12 pl-10 pr-4 rounded-lg bg-input-background border border-border focus:border-primary focus:ring-primary appearance-none">
                    <option>Any Budget</option>
                    <option>Under Rs. 1000</option>
                    <option>Rs. 1000 - 2000</option>
                    <option>Rs. 2000+</option>
                  </select>
                </div>
              </div>
              <Link to="/therapists" className="w-full md:w-auto">
                <Button className="h-12 w-full md:w-auto px-8 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                  <Search size={20} />
                  Search
                </Button>
              </Link>
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="px-4 md:px-10 py-8 mb-8 border-y border-border bg-card/50">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 font-bold text-xl">
              <span className="bg-green-600 text-white rounded p-1 text-xs">eSewa</span> Partner
            </div>
            <div className="flex items-center gap-2 font-bold text-xl">
              <span className="text-purple-600">Khalti</span> Payment
            </div>
            <div className="flex items-center gap-2 font-bold text-sm border-2 border-primary/50 rounded-full px-4 py-1">
              <Shield className="text-primary" size={16} />
              Verified by NMC
            </div>
          </div>
        </div>

        {/* AI Symptom Screening CTA */}
        <div className="px-4 md:px-10 py-16 mb-8">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 md:p-12 border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4">
                    <Brain size={16} />
                    AI-Powered Technology
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4">
                    Not Sure Where to Start?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Take our free AI-powered symptom screening. In just 2 minutes, our intelligent triage system will analyze your concerns and recommend the perfect specialist for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/screening">
                      <Button className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
                        <Brain className="mr-2" size={20} />
                        Start Free Screening
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-12 px-8 rounded-lg font-bold w-full sm:w-auto">
                      Learn How It Works
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="text-primary" size={16} />
                      <span>87.3% Accuracy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="text-primary" size={16} />
                      <span>100% Confidential</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="text-primary" size={16} />
                      <span>Takes 2 Minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 bg-primary/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border-2 border-primary/30 shadow-2xl">
                    <Brain className="text-primary" size={96} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="px-4 md:px-10 py-16" id="how-it-works">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple steps to start your mental wellness journey from the comfort of your home.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search size={120} className="text-primary" />
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse through hundreds of verified experts. Filter by specialty, language, and price to find your perfect match.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar size={120} className="text-primary" />
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Book & Pay</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose a convenient time slot. Pay securely using local wallets like eSewa or Khalti instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Video size={120} className="text-primary" />
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                <Video size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Connect</h3>
              <p className="text-muted-foreground leading-relaxed">
                Join your private, encrypted video session from anywhere. Your privacy is our top priority.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Therapists */}
        <div className="px-4 md:px-10 py-16 bg-card rounded-3xl mx-4 md:mx-0 my-8">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">Featured Therapists</h2>
              <p className="text-muted-foreground">Highly rated professionals available this week.</p>
            </div>
            <Link to="/therapists" className="text-primary font-bold hover:text-primary/90 flex items-center gap-1 group">
              View all therapists
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Therapist Card 1 */}
            <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759350075177-eeb89d507990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyODk0ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dr. Sarita Sharma"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 shadow-sm">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  4.9
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-lg">Dr. Anjali Sharma</h3>
                  <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Anxiety</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Stress</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Languages size={16} />
                  Nepali, English
                </div>
                <Link to="/book/1">
                  <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Therapist Card 2 */}
            <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzEwNzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dr. Rajesh KC"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 shadow-sm">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  4.8
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-lg">Dr. Ramesh Thapa</h3>
                  <p className="text-sm text-muted-foreground">Psychiatrist</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Depression</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">OCD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Languages size={16} />
                  Nepali, English
                </div>
                <Link to="/book/2">
                  <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Therapist Card 3 */}
            <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0aGVyYXBpc3QlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIzNTc1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Ms. Anjali Pradhan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 shadow-sm">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  5.0
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-lg">Sita Gurung</h3>
                  <p className="text-sm text-muted-foreground">Licensed Therapist</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Family</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Relationship</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Languages size={16} />
                  Nepali, English
                </div>
                <Link to="/book/3">
                  <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Therapist Card 4 */}
            <div className="hidden lg:block bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden relative bg-muted flex items-center justify-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">PT</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 shadow-sm">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  4.7
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-lg">Dr. Prakash Rai</h3>
                  <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Trauma</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">PTSD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Languages size={16} />
                  Nepali, Maithili
                </div>
                <Link to="/book/4">
                  <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="px-4 md:px-10 py-16">
          <div className="bg-primary rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-4">
                Are you a Mental Health Professional?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 font-medium">
                Join Chautari to expand your practice and help people across Nepal access the care they need.
              </p>
              <Link to="/register">
                <Button className="h-12 px-8 rounded-lg bg-primary-foreground text-primary font-bold hover:bg-white shadow-lg">
                  Join as a Therapist
                </Button>
              </Link>
            </div>
            <div className="relative z-10 hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield size={64} className="text-primary-foreground" />
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-black/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="px-4 md:px-10 py-12 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
                </svg>
                <span className="text-xl font-bold">Chautari</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making mental healthcare accessible, affordable, and stigma-free for every Nepali.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li><Link to="/therapists" className="hover:text-primary transition-colors">Find a Therapist</Link></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Resources & Blogs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Emergency Contacts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">For Therapists</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">support@chautari.com.np</li>
                <li className="flex items-center gap-2">+977-9800000000</li>
                <li className="flex items-center gap-2">Kathmandu, Nepal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Chautari Health Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="hover:text-primary" href="#">Privacy Policy</a>
              <a className="hover:text-primary" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}