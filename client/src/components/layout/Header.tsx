import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeaderProps {
  username: string | null;
}

const Header = ({ username }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[#1A1A1A] py-2 px-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-[#FF4500] text-2xl font-bold">
              Brokie<span className="text-white">Tube</span>
            </span>
          </Link>
        </div>
        
        {/* Search - Desktop */}
        <form 
          className="hidden md:flex flex-1 max-w-2xl mx-6"
          onSubmit={handleSearch}
        >
          <div className="relative w-full">
            <Input
              type="text"
              className="w-full py-2 px-4 bg-[#242424] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#B3B3B3] hover:text-white hover:bg-transparent"
            >
              <Search size={18} />
            </Button>
          </div>
        </form>
        
        {/* User info */}
        <div className="flex items-center space-x-4">
          <span className="hidden md:block text-white">
            {username || "Guest"}
          </span>
          <Button 
            variant="default" 
            className="bg-[#FF4500] hover:bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            <i className="fas fa-user mr-1"></i>
            <span className="hidden md:inline">Account</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile search */}
      <form 
        className="md:hidden mt-2 px-2"
        onSubmit={handleSearch}
      >
        <div className="relative w-full">
          <Input
            type="text"
            className="w-full py-2 px-4 bg-[#242424] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="ghost" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#B3B3B3] hover:text-white hover:bg-transparent"
          >
            <Search size={18} />
          </Button>
        </div>
      </form>
    </header>
  );
};

export default Header;
