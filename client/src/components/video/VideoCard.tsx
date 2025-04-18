import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { type Video } from "@shared/schema";
import { formatDuration } from "@/lib/video";
import { isVideoLiked } from "@/lib/auth";
import { likeVideo, unlikeVideo, queryClient } from "@/lib/queryClient";
import { Play, Info, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [_, navigate] = useLocation();
  
  // Like and unlike mutations
  const likeMutation = useMutation({
    mutationFn: (id: number) => likeVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    }
  });
  
  const unlikeMutation = useMutation({
    mutationFn: (id: number) => unlikeVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    }
  });
  
  // Check if video is liked when component mounts
  useEffect(() => {
    setIsLiked(isVideoLiked(video.id));
  }, [video.id]);
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/video/${video.id}`);
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiked) {
      setIsLiked(false);
      unlikeMutation.mutate(video.id);
    } else {
      setIsLiked(true);
      likeMutation.mutate(video.id);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/video/${video.id}`);
  };

  return (
    <div 
      className="netflix-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="object-cover w-full h-full transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          loading="lazy"
        />
        
        <div className="card-overlay"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-medium text-sm md:text-md mb-1 text-white">
            {video.title}
          </h3>
          
          {isHovered && (
            <div className="flex items-center space-x-2 mt-2">
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-white/90 rounded-full w-9 h-9 p-0 flex items-center justify-center"
                onClick={handlePlayClick}
              >
                <Play size={18} className="ml-0.5" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-9 h-9 p-0 flex items-center justify-center bg-neutral-800/80 border border-neutral-600"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/video/${video.id}`);
                }}
              >
                <Info size={16} />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className={`rounded-full w-9 h-9 p-0 flex items-center justify-center ${
                  isLiked 
                    ? 'bg-primary/20 text-primary border-primary' 
                    : 'bg-neutral-800/80 border-neutral-600'
                }`}
                onClick={handleLikeClick}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
              >
                <ThumbsUp size={16} />
              </Button>
              
              <div className="flex-grow"></div>
              
              <span className="text-xs text-white bg-neutral-900/60 px-1 py-0.5 rounded">
                {formatDuration(video.duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
