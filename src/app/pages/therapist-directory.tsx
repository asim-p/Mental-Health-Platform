import { useState } from "react";
import { Navbar } from "../components/navbar";
import { TherapistCard } from "../components/therapist-card";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { mockTherapists, Specialty, Language } from "../data/therapists";
import { Search, Filter } from "lucide-react";

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
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSpecialty = (specialty: Specialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleLanguage = (language: Language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  const filteredTherapists = mockTherapists.filter((therapist) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !therapist.name.toLowerCase().includes(query) &&
        !therapist.title.toLowerCase().includes(query) &&
        !therapist.bio.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      if (!selectedSpecialties.some((s) => therapist.specialties.includes(s))) {
        return false;
      }
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      if (!selectedLanguages.some((l) => therapist.languages.includes(l))) {
        return false;
      }
    }

    // Price filter
    if (
      therapist.pricePerSession < priceRange[0] ||
      therapist.pricePerSession > priceRange[1]
    ) {
      return false;
    }

    return true;
  });

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
            Browse {mockTherapists.length} verified mental health professionals
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
              Showing {filteredTherapists.length} therapist
              {filteredTherapists.length !== 1 ? "s" : ""}
            </div>

            {filteredTherapists.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTherapists.map((therapist) => (
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
                      setPriceRange([0, 3000]);
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
