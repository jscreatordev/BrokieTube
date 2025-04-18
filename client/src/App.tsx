import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import VideoPage from "@/pages/VideoPage";
import UsernameModal from "@/components/modals/UsernameModal";
import Header from "@/components/layout/Header";
import { getUsernameFromStorage } from "./lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/video/:id" component={VideoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [location] = useLocation();

  // Check if username exists in localStorage on mount
  useEffect(() => {
    const storedUsername = getUsernameFromStorage();
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  // Prevent right-click and keyboard shortcuts for dev tools
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDevTools = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C"))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventDevTools);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventDevTools);
    };
  }, []);

  const handleUsernameSubmit = (username: string) => {
    setUsername(username);
    setShowUsernameModal(false);
    localStorage.setItem("username", username);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-[#121212] text-white">
          <Header username={username} />
          <Router />
          <Toaster />
          {showUsernameModal && (
            <UsernameModal onSubmit={handleUsernameSubmit} />
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
