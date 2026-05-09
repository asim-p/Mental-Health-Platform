import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button.jsx";
import { Navbar } from "../components/navbar.jsx";
import { Search, Calendar, Video, Star, Clock, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'THERAPIST') {
      navigate('/dashboard/therapist');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await api.therapists.getAll();
        if (response.success) {
          const list = response.data.therapists || response.data;
          setFeaturedTherapists(Array.isArray(list) ? list.slice(0, 3) : []);
        }
      } catch (error) {
        console.error("Failed to fetch featured therapists:", error);
      } finally {
        setIsLoadingTherapists(false);
      }
    };
    fetchTherapists();
  }, []);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto flex flex-col">
        {/* Hero Section */}
        <div className="px-4 py-16 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-green-600">
              Mental Health Nepal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Find licensed therapists and get mental health support online. Our AI-powered screening matches you with the best therapist based on your symptoms, budget, language, and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/screening">
                <Button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold">
                  Take Free AI Screening
                </Button>
              </Link>
              <Link to="/therapists">
                <Button variant="outline" className="border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 text-lg">
                  Browse Therapists
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to start your mental wellness journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Search</h3>
              <p className="text-gray-600">Browse through verified experts and find your perfect match</p>
            </div>
            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Book</h3>
              <p className="text-gray-600">Choose a convenient time and pay securely using local wallets</p>
            </div>
            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Connect</h3>
              <p className="text-gray-600">Join your private video session from anywhere</p>
            </div>
          </div>
        </div>

        {/* Featured Therapists */}
        <div className="px-4 py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Featured Therapists</h2>
              <p className="text-gray-600">Highly rated professionals available this week</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingTherapists ? (
                <div className="col-span-3 text-center py-10">Loading featured therapists...</div>
              ) : featuredTherapists.length > 0 ? (
                featuredTherapists.map((therapist) => (
                  <div key={therapist.id} className="bg-white p-6 border border-gray-200 rounded-lg text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {therapist.profileImage ? (
                        <img src={therapist.profileImage} alt={`${therapist.user?.firstName} ${therapist.user?.lastName}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">
                          {therapist.user?.firstName?.[0]}{therapist.user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">
                      Dr. {therapist.user?.firstName} {therapist.user?.lastName}
                    </h3>
                    <p className="text-gray-600 mb-3">{therapist.title || 'Therapist'}</p>
                    <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock size={14} className="text-green-600" />
                        <span className="font-medium">{therapist.yearsOfExperience || 0} Years Experience</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <GraduationCap size={14} className="text-green-600" />
                        <span className="truncate max-w-[200px]" title={therapist.qualifications?.[0]}>
                          {therapist.qualifications?.[0] || 'Licensed Therapist'}
                        </span>
                      </div>
                    </div>
                    <Link to={`/book/${therapist.user?.id}`}>
                      <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">No therapists found.</div>
              )}
            </div>
            <div className="text-center mt-6">
              <Link to="/therapists" className="text-green-600 font-medium hover:text-green-700">
                View all therapists →
              </Link>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-300 mt-auto">
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-600">MHP</h3>
              <p className="text-sm text-gray-600">
                Making mental healthcare accessible for every Nepali
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                <li><Link to="/therapists" className="hover:text-green-600">Find a Therapist</Link></li>
                <li><Link to="/how-it-works" className="hover:text-green-600">How it Works</Link></li>
                <li><a href="#" className="hover:text-green-600">Resources</a></li>
                <li><a href="#" className="hover:text-green-600">Emergency</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-green-600">About Us</Link></li>
                <li><a href="#" className="hover:text-green-600">Careers</a></li>
                <li><Link to="/register" className="hover:text-green-600">For Therapists</Link></li>
                <li><a href="#" className="hover:text-green-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                <li>support@mentalhealthplatform.edu.np</li>
                <li>+977-9800000000</li>
                <li>Kathmandu, Nepal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
            <p>© 2026 Mental Health Platform. All rights reserved.</p>
            <div className="flex gap-4 justify-center mt-2">
              <a className="hover:text-green-600" href="#">Privacy Policy</a>
              <a className="hover:text-green-600" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
