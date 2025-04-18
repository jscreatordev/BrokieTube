import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

const UsernameModal = ({ onSubmit }: UsernameModalProps) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    onSubmit(trimmedUsername);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#242424] p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome to <span className="text-[#FF4500]">Brokie</span>Tube
          </h2>
          <p className="text-[#B3B3B3]">Enter a username to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-[#B3B3B3] mb-1">
              Username
            </Label>
            <Input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-full p-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
              placeholder="Enter your username"
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#FF4500] hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
