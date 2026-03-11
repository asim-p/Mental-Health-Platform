import { Link } from "react-router";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-[1280px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <div className="size-8 text-primary">
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Chautari</h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 justify-end gap-8 items-center">
          <div className="flex items-center gap-8">
            <Link to="/screening" className="text-sm font-medium hover:text-primary transition-colors">
              AI Screening
            </Link>
            <Link to="/therapists" className="text-sm font-medium hover:text-primary transition-colors">
              Find a Therapist
            </Link>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How it Works
            </a>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              For Therapists
            </Link>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About Us
            </a>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="h-10 px-5 rounded-lg bg-border hover:bg-primary/20 text-sm font-bold">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 shadow-sm">
                Register
              </Button>
            </Link>
          </div>
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
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link
              to="/screening"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Screening
            </Link>
            <Link
              to="/therapists"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find a Therapist
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Therapists
            </Link>
            <a
              href="#about"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full h-10 px-5 rounded-lg bg-border hover:bg-primary/20 text-sm font-bold">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 shadow-sm">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}