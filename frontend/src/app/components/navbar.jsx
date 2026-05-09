import { Link } from "react-router";
import { Button } from "./ui/button.jsx";
import { Menu, X, User, Calendar, Settings, Brain } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const dashboardLink = user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/dashboard/patient";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white">
      <div className="px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo and Greeting */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Brain size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">
              MHP
            </span>
          </Link>

          {/* Personalized Greeting */}
          {isAuthenticated && user?.firstName && (
            <div className="hidden md:flex items-center gap-6 text-gray-600">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Hello, {user.firstName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {user.role === 'THERAPIST' ? 'Therapist' : 'Patient'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {user?.role === 'THERAPIST' ? (
            // Therapist Navigation
            <>
              <Link to="/dashboard/therapist" className="text-gray-700 hover:text-green-600 font-medium">
                My Dashboard
              </Link>
              <Link to="/dashboard/therapist/availability" className="text-gray-700 hover:text-green-600 font-medium">
                Availability
              </Link>
              <Link to="/dashboard/therapist/settings" className="text-gray-700 hover:text-green-600 font-medium">
                Profile Settings
              </Link>
            </>
          ) : (
            // Patient Navigation
            <>
              <Link to="/screening" className="text-gray-700 hover:text-green-600 font-medium">
                AI Screening
              </Link>
              <Link to="/therapists" className="text-gray-700 hover:text-green-600 font-medium">
                Find Therapists
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-green-600 font-medium">
                How It Works
              </Link>
            </>
          )}

          <Link to="/about" className="text-gray-700 hover:text-green-600 font-medium">
            About
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardLink}>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={logout} className="bg-green-600 text-white hover:bg-green-700">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-300 bg-white px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Mobile Greeting */}
            {isAuthenticated && user?.firstName && (
              <div className="flex items-center gap-2 text-gray-600 pb-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Hello, {user.firstName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {user.role === 'THERAPIST' ? 'Therapist' : 'Patient'}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Navigation */}
            {user?.role === 'THERAPIST' ? (
              // Therapist Mobile Navigation
              <>
                <Link
                  to="/dashboard/therapist"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/dashboard/therapist/availability"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Availability
                </Link>
                <Link
                  to="/dashboard/therapist/settings"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
              </>
            ) : (
              // Patient Mobile Navigation
              <>
                <Link
                  to="/screening"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Screening
                </Link>
                <Link
                  to="/therapists"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Therapists
                </Link>
                <Link
                  to="/how-it-works"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
              </>
            )}

            <Link
              to="/about"
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Mobile Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
