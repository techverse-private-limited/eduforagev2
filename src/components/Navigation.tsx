
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground font-poppins">EduForge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors font-poppins font-medium">
              About
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors font-poppins font-medium">
              Login
            </Link>
            <Link to="/login">
              <Button variant="default" className="font-poppins font-semibold">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/about" className="block px-3 py-2 text-muted-foreground hover:text-foreground font-poppins font-medium">
                About
              </Link>
              <Link to="/login" className="block px-3 py-2 text-muted-foreground hover:text-foreground font-poppins font-medium">
                Login
              </Link>
              <div className="px-3 py-2">
                <Link to="/login">
                  <Button variant="default" className="w-full font-poppins font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
