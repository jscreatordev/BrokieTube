import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/video";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronDown
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: number;
    
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      
      timeout = window.setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      });
    }
    
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);
  
  // Update metadata when video is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);
  
  // Set up event listeners for video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = (value[0] / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(value[0]);
  };
  
  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedOptions(false);
  };
  
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="video-container relative mb-4 bg-black rounded-lg overflow-hidden"
      onClick={(e) => {
        // Only toggle play if not clicking on a control
        if (e.target === containerRef.current || e.target === videoRef.current) {
          togglePlay();
        }
      }}
    >
      <video 
        ref={videoRef}
        className="w-full aspect-video"
        poster={thumbnailUrl}
        aria-label={title}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div 
        className={`video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={0.01}
              onValueChange={handleProgressChange}
              className="h-1"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#FF4500] hover:bg-transparent"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-[#FF4500] hover:bg-transparent"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-16 h-1"
              />
            </div>
            
            <span className="text-white text-sm">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                className="text-white hover:text-[#FF4500] hover:bg-transparent flex items-center h-8 px-2"
                onClick={() => setShowSpeedOptions(!showSpeedOptions)}
              >
                <span className="text-sm mr-1">{playbackSpeed}x</span>
                <ChevronDown size={16} />
              </Button>
              
              {showSpeedOptions && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#242424] rounded shadow-lg p-2 w-28 z-10">
                  <div className="space-y-1 text-sm">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        className={`block w-full text-left px-2 py-1 hover:bg-gray-700 rounded ${
                          playbackSpeed === speed ? 'bg-[#FF4500] bg-opacity-20' : ''
                        }`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#FF4500] hover:bg-transparent"
              onClick={toggleFullscreen}
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
