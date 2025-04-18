import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Video } from "@shared/schema";
import { formatViewCount, formatRelativeDate, getRecommendedVideos } from "@/lib/video";
import VideoPlayer from "@/components/video/VideoPlayer";
import CategorySidebar from "@/components/layout/CategorySidebar";
import MobileCategories from "@/components/layout/MobileCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

const VideoPage = () => {
  const [match, params] = useRoute("/video/:id");
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
  
  return (
    <div className="flex flex-1">
      {/* Category Sidebar */}
      <CategorySidebar />
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Video Player Page */}
        <div id="video-page">
          {isLoadingVideo ? (
            <>
              <Skeleton className="aspect-video w-full mb-4 bg-[#1A1A1A]" />
              <div className="md:flex space-y-4 md:space-y-0 md:space-x-6">
                <div className="md:w-2/3">
                  <Skeleton className="h-8 w-3/4 mb-2 bg-[#242424]" />
                  <Skeleton className="h-4 w-1/3 mb-4 bg-[#242424]" />
                  <Skeleton className="h-32 w-full rounded-lg bg-[#242424]" />
                </div>
                <div className="md:w-1/3">
                  <Skeleton className="h-6 w-48 mb-3 bg-[#242424]" />
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex space-x-2">
                        <Skeleton className="h-16 w-28 bg-[#242424]" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-1 bg-[#242424]" />
                          <Skeleton className="h-3 w-24 mb-1 bg-[#242424]" />
                          <Skeleton className="h-3 w-16 bg-[#242424]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : !video ? (
            <div className="text-center py-8">
              <p className="text-[#B3B3B3]">Video not found</p>
            </div>
          ) : (
            <>
              {/* Video Player */}
              <VideoPlayer 
                videoUrl={video.videoUrl} 
                thumbnailUrl={video.thumbnailUrl}
                title={video.title}
              />
              
              <div className="md:flex space-y-4 md:space-y-0 md:space-x-6">
                <div className="md:w-2/3">
                  <h1 className="text-2xl font-semibold mb-2">{video.title}</h1>
                  <div className="flex items-center text-[#B3B3B3] text-sm mb-4">
                    <span>{formatViewCount(video.views)} views</span>
                    <span className="mx-2">•</span>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="p-4 bg-[#242424] rounded-lg mb-6">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-[#B3B3B3] text-sm">
                      {video.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#1A1A1A] hover:bg-[#242424]">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/3">
                  <h3 className="font-medium mb-3">Recommended Videos</h3>
                  <div className="space-y-3">
                    {isLoadingAllVideos ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex space-x-2">
                          <Skeleton className="h-16 w-28 bg-[#242424]" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-1 bg-[#242424]" />
                            <Skeleton className="h-3 w-24 mb-1 bg-[#242424]" />
                            <Skeleton className="h-3 w-16 bg-[#242424]" />
                          </div>
                        </div>
                      ))
                    ) : recommendedVideos.length === 0 ? (
                      <p className="text-[#B3B3B3] text-sm">No recommendations available</p>
                    ) : (
                      recommendedVideos.map((recVideo) => (
                        <a 
                          key={recVideo.id} 
                          href={`/video/${recVideo.id}`}
                          className="flex space-x-2 cursor-pointer hover:bg-[#242424] p-1 rounded"
                        >
                          <div className="relative w-28 h-16">
                            <img 
                              src={recVideo.thumbnailUrl} 
                              alt={recVideo.title} 
                              className="rounded object-cover w-full h-full"
                            />
                            <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                              {Math.floor(recVideo.duration / 60)}:{(recVideo.duration % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-2">{recVideo.title}</h4>
                            <p className="text-[#B3B3B3] text-xs mt-1">{recVideo.uploadedBy}</p>
                            <p className="text-[#B3B3B3] text-xs">{formatViewCount(recVideo.views)} views</p>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Mobile Categories */}
      <MobileCategories />
    </div>
  );
};

export default VideoPage;
