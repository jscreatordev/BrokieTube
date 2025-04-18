import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, ChevronDown, VideoIcon } from "lucide-react";
import { checkIfAdmin } from "@/lib/auth";

interface HeaderProps {
  username: string | null;
}

const Header = ({ username }: HeaderProps) => {
  const isAdmin = checkIfAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchVisible(false);
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <header className="bg-gradient-to-b from-black to-transparent py-3 px-4 sticky top-0 z-20 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <span className="text-primary text-3xl font-bold tracking-tighter">
              BROKIE<span className="text-white">FLIX</span>
            </span>
          </Link>
          
          {/* Navigation Links - Desktop Only */}
          <nav className="hidden md:flex ml-8 space-x-6">
            <Link href="/">
              <span className="text-white hover:text-primary transition-colors">Home</span>
            </Link>
            <Link href="/?genre=trending">
              <span className="text-white hover:text-primary transition-colors">Popular</span>
            </Link>
            <Link href="/?genre=finance">
              <span className="text-white hover:text-primary transition-colors">Finance</span>
            </Link>
            <Link href="/my-list">
              <span className="text-white hover:text-primary transition-colors">My List</span>
            </Link>
          </nav>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Search Button - toggles search input */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-primary hover:bg-transparent"
            onClick={toggleSearch}
          >
            <Search size={20} />
          </Button>
          
          {/* Admin Button - only visible for admin users */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-transparent"
                title="Admin Dashboard"
              >
                <VideoIcon size={20} />
              </Button>
            </Link>
          )}
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-primary hover:bg-transparent"
          >
            <Bell size={20} />
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center">
            <span className="text-white mr-2 hidden md:block">
              {username || "Guest"}
            </span>
            <Button 
              variant="ghost" 
              className="text-white hover:text-primary hover:bg-transparent p-0"
            >
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-medium">
                {username ? username.charAt(0).toUpperCase() : "G"}
              </div>
              <ChevronDown size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search overlay */}
      {searchVisible && (
        <div className="absolute top-full left-0 right-0 bg-black/90 p-4 shadow-lg transition-all duration-300">
          <form onSubmit={handleSearch} className="container mx-auto">
            <div className="relative w-full max-w-2xl mx-auto">
              <Input
                type="text"
                className="w-full py-2 px-4 bg-neutral-800 text-white border-none focus:ring-1 focus:ring-primary"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                type="submit"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-primary hover:bg-transparent"
              >
                <Search size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
