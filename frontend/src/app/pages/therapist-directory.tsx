import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/navbar";
import { TherapistCard } from "../components/therapist-card";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Specialty, Language, Therapist } from "../data/therapists";
import { Search, Filter, Loader2 } from "lucide-react";
import { api } from "../services/api";

const specialties: Specialty[] = [
  "Depression",
  "Anxiety",
  "Relationship Issues",
  "Trauma & PTSD",
  "Stress Management",
  "Family Counseling",
  "Grief & Loss",
  "OCD",
  "Eating Disorders",
];

const languages: Language[] = ["Nepali", "English", "Newari", "Maithili", "Bhojpuri"];

export function TherapistDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string> = {
        verified: "true",
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedSpecialties.length > 0) params.specialty = selectedSpecialties[0]; // Backend currently supports one specialty filter or I'll need to update backend
      if (selectedLanguages.length > 0) params.language = selectedLanguages[0];
      if (priceRange[0] > 0) params.minPrice = priceRange[0].toString();
      if (priceRange[1] < 5000) params.maxPrice = priceRange[1].toString();

      const response = await api.therapists.getAll(params);

      if (response.success && response.data) {
        const mapped: Therapist[] = response.data.therapists.map((t: any) => ({
          id: t.user.id || t.id,
          name: `${t.user.firstName} ${t.user.lastName}`,
          title: t.qualifications?.[0] || "Therapist",
          specialties: t.specialization as Specialty[],
          languages: t.languages as Language[],
          pricePerSession: t.hourlyRate,
          verified: t.isVerified,
          rating: t.rating,
          totalSessions: t.reviewCount,
          bio: t.bio || "",
          education: t.qualifications?.join(", ") || "",
          experience: t.yearsOfExperience || 0,
        }));
        setTherapists(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch therapists:", err);
      setError("Failed to load therapists. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSpecialties, selectedLanguages, priceRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTherapists();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchTherapists]);

  const toggleSpecialty = (specialty: Specialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [specialty] // Simplified to one for backend compatibility for now
    );
  };

  const toggleLanguage = (language: Language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [language]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Therapist
          </h1>
          <p className="text-lg text-gray-600">
            Browse {therapists.length} verified mental health professionals
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name, specialty, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter size={16} className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-6">
                {/* Specialty Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Specialties
                  </Label>
                  <div className="space-y-2">
                    {specialties.map((specialty) => (
                      <div key={specialty} className="flex items-center gap-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        <label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {specialty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Languages
                  </Label>
                  <div className="space-y-2">
                    {languages.map((language) => (
                      <div key={language} className="flex items-center gap-2">
                        <Checkbox
                          id={`language-${language}`}
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
                        <label
                          htmlFor={`language-${language}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Price Range (per session)
                  </Label>
                  <div className="space-y-4">
                    <Slider
                      min={0}
                      max={3000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex items-center gap-2 text-sm">
                      <span>NPR {priceRange[0]}</span>
                      <span>-</span>
                      <span>NPR {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedSpecialties.length > 0 ||
                  selectedLanguages.length > 0 ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== 3000) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedSpecialties([]);
                      setSelectedLanguages([]);
                      setPriceRange([0, 3000]);
                      setSearchQuery("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Therapist Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-600">
              Showing {therapists.length} therapist
              {therapists.length !== 1 ? "s" : ""}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Finding the best therapists for you...</p>
              </div>
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="py-12 text-center">
                  <p className="text-destructive font-semibold mb-4">{error}</p>
                  <Button onClick={fetchTherapists}>Try Again</Button>
                </CardContent>
              </Card>
            ) : therapists.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {therapists.map((therapist) => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">
                    No therapists found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSpecialties([]);
                      setSelectedLanguages([]);
                      setPriceRange([0, 5000]);
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
