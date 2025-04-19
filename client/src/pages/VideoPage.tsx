import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { type Video } from "@shared/schema";
import { formatViewCount, formatRelativeDate, getRecommendedVideos } from "@/lib/video";
import VideoPlayer from "@/components/video/VideoPlayer";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";

const VideoPage = () => {
  const [match, params] = useRoute("/video/:id");
  const [_, navigate] = useLocation();
  const videoId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch video data
  const { data: video, isLoading: isLoadingVideo } = useQuery<Video>({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });
  
  // Fetch all videos for recommendations
  const { data: allVideos, isLoading: isLoadingAllVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });
  
  // Generate recommended videos when both queries are loaded
  const recommendedVideos = video && allVideos 
    ? getRecommendedVideos(video, allVideos)
    : [];
  
  // Format the uploaded date
  const formattedDate = video 
    ? new Date(video.uploadedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  
  // Scroll to top when videoId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoId]);
  
  // Navigate to a recommended video
  const handleRecommendedClick = (id: number) => {
    navigate(`/video/${id}`);
  };
  
  return (
    <div className="flex flex-1">
      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Video Player Page */}
        <div id="video-page" className="bg-black">
          {isLoadingVideo ? (
            <>
              <Skeleton className="aspect-video w-full mb-0 bg-neutral-900" />
              <div className="p-4 md:p-8 space-y-6">
                <Skeleton className="h-10 w-3/4 bg-neutral-800" />
                <div className="flex space-x-3">
                  <Skeleton className="h-10 w-32 rounded-md bg-neutral-800" />
                  <Skeleton className="h-10 w-32 rounded-md bg-neutral-800" />
                </div>
                <Skeleton className="h-24 w-full rounded-md bg-neutral-800" />
              </div>
            </>
          ) : !video ? (
            <div className="text-center py-24">
              <p className="text-neutral-400">Video not found</p>
            </div>
          ) : (
            <>
              {/* Video Player */}
              <VideoPlayer 
                videoUrl={video.videoUrl} 
                thumbnailUrl={video.thumbnailUrl}
                title={video.title}
              />
              
              <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{video.title}</h1>
                  
                  <div className="flex flex-wrap items-center text-neutral-400 text-sm mb-4">
                    <span>{formatViewCount(video.views)} views</span>
                    <span className="mx-2">•</span>
                    <span>{formattedDate}</span>
                    <span className="mx-2">•</span>
                    <span>Uploaded by {video.uploadedBy}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 my-4">
                    <Button 
                      className="bg-white hover:bg-white/90 text-black rounded-md font-medium"
                    >
                      <Play size={18} className="mr-2" />
                      Play
                    </Button>
                    
                    
                  </div>
                  
                  <div className="bg-neutral-900/50 p-4 rounded-md">
                    <p className="text-neutral-200 mb-4">
                      {video.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {video.tags.map((tag, index) => (
                        <Badge key={index} className="genre-pill">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* More like this */}
                <div className="mt-12 mb-16">
                  <h2 className="section-title mb-6">More Like This</h2>
                  
                  {isLoadingAllVideos ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="aspect-video rounded overflow-hidden">
                          <Skeleton className="w-full h-full bg-neutral-800" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedVideos.length === 0 ? (
                    <p className="text-neutral-400">No recommendations available</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {recommendedVideos.map((recVideo) => (
                        <div 
                          key={recVideo.id}
                          className="netflix-card cursor-pointer" 
                          onClick={() => handleRecommendedClick(recVideo.id)}
                        >
                          <div className="relative aspect-video rounded overflow-hidden">
                            <img 
                              src={recVideo.thumbnailUrl} 
                              alt={recVideo.title} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="card-overlay"></div>
                            <div className="absolute bottom-0 left-0 p-2">
                              <h4 className="text-sm font-medium line-clamp-1">{recVideo.title}</h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoPage;
