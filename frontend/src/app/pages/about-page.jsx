import { Navbar } from "../components/navbar.jsx";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-6">About Us</h1>
          <p className="text-xl text-muted-foreground">
            We are dedicated to making mental healthcare accessible, affordable, and stigma-free for everyone in Nepal.
          </p>
        </div>
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Mental Health Platform (MHP) was created with a simple yet powerful vision: to bridge the gap between people seeking mental health support and qualified professionals. We believe that everyone deserves access to a safe, confidential space to heal and grow.
          </p>
          <h2 className="text-2xl font-bold mb-4">What We Do</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>Provide a seamless platform to discover and connect with verified therapists.</li>
            <li>Offer an AI-driven symptom screening tool to guide users to the right specialists.</li>
            <li>Ensure a secure and confidential environment for virtual consultations.</li>
          </ul>
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
