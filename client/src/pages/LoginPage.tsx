
import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setUsernameToStorage } from "@/lib/auth";

const LoginPage = () => {
  const [_, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-neutral-900 p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
        </div>
        <Button 
          onClick={handleGoogleLogin} 
          className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
