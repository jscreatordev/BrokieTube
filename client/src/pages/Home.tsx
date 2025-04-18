import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Video, type Category } from "@shared/schema";
import CategorySidebar from "@/components/layout/CategorySidebar";
import MobileCategories from "@/components/layout/MobileCategories";
import VideoCard from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Info, Plus } from "lucide-react";

const HeroSkeleton = () => (
  <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded overflow-hidden mb-8">
    <Skeleton className="w-full h-full bg-neutral-900" />
    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
      <Skeleton className="h-8 w-48 mb-4 bg-neutral-800" />
      <Skeleton className="h-6 w-96 mb-4 bg-neutral-800" />
      <Skeleton className="h-4 w-64 mb-6 bg-neutral-800" />
      <div className="flex space-x-4">
        <Skeleton className="h-12 w-32 rounded-md bg-neutral-800" />
        <Skeleton className="h-12 w-32 rounded-md bg-neutral-800" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [_, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("trending");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  
  // Parse URL params to get category and search query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreParam = params.get("genre");
    const searchParam = params.get("search");
    
    if (genreParam) {
      setSelectedCategory(genreParam);
      setSearchQuery(null);
    } else if (searchParam) {
      setSearchQuery(searchParam);
      setSelectedCategory("trending");
    } else {
      setSelectedCategory("trending");
      setSearchQuery(null);
    }
  }, [location]);
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch all videos
  const { data: allVideos, isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });
  
  // Fetch videos by category if a category is selected
  const { data: categoryVideos, isLoading: isLoadingCategoryVideos } = useQuery<Video[]>({
    queryKey: ["/api/categories", selectedCategory, "videos"],
    enabled: selectedCategory !== "trending" && !!categories?.find(c => c.slug === selectedCategory),
  });
  
  // Fetch search results if there's a search query
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery<Video[]>({
    queryKey: ["/api/search", searchQuery],
    enabled: !!searchQuery,
  });
  
  // Determine which videos to display
  let displayedVideos: Video[] = [];
  let isLoading = false;
  let pageTitle = "Popular on BrokieFlix";
  
  if (searchQuery) {
    displayedVideos = searchResults || [];
    isLoading = isLoadingSearch;
    pageTitle = `Results for "${searchQuery}"`;
  } else if (selectedCategory === "trending") {
    displayedVideos = allVideos || [];
    isLoading = isLoadingVideos;
  } else {
    displayedVideos = categoryVideos || [];
    isLoading = isLoadingCategoryVideos;
    pageTitle = categories?.find(c => c.slug === selectedCategory)?.name || "Videos";
  }
  
  // Featured video for hero section (first trending video)
  const featuredVideo = allVideos?.length ? allVideos[0] : null;
  
  // Group videos by category for the homepage rows
  const videosByCategory = allVideos && categories 
    ? categories
        .filter(category => category.slug !== "trending")
        .map(category => {
          const categoryVideos = allVideos.filter(video => video.categoryId === category.id);
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            videos: categoryVideos
          };
        })
        .filter(category => category.videos.length > 0)
    : [];
  
  // Go to video page
  const handlePlayFeatured = () => {
    if (featuredVideo) {
      navigate(`/video/${featuredVideo.id}`);
    }
  };
  
  return (
    <div className="flex flex-1">
      {/* Category Sidebar */}
      <CategorySidebar selectedCategory={selectedCategory} />
      
      {/* Main Content */}
      <main className="flex-1">
        <div id="home-page" className="pb-16">
          {searchQuery || selectedCategory !== "trending" ? (
            // Search results or Category page
            <div className="px-4 md:px-8 mt-4">
              <h2 className="section-title mt-6 mb-6">{pageTitle}</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {Array(12).fill(0).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded overflow-hidden">
                      <Skeleton className="w-full h-full bg-neutral-800" />
                    </div>
                  ))}
                </div>
              ) : displayedVideos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400">No videos found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {displayedVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Homepage with hero and rows
            <>
              {/* Hero Banner */}
              {isLoading || !featuredVideo ? (
                <HeroSkeleton />
              ) : (
                <div className="relative w-full aspect-[21/9] md:aspect-[25/9] mb-8">
                  <img 
                    src={featuredVideo.thumbnailUrl} 
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="hero-gradient"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 max-w-2xl">
                      {featuredVideo.title}
                    </h1>
                    <p className="text-sm md:text-base text-neutral-200 mb-4 max-w-xl line-clamp-2">
                      {featuredVideo.description}
                    </p>
                    <div className="flex space-x-3 mt-4">
                      <Button 
                        onClick={handlePlayFeatured}
                        size="lg"
                        className="bg-white hover:bg-white/90 text-black rounded-md font-medium"
                      >
                        <Play size={20} className="mr-2" />
                        Play
                      </Button>
                      <Button 
                        variant="secondary"
                        size="lg"
                        className="bg-neutral-700/70 hover:bg-neutral-700 text-white rounded-md font-medium"
                      >
                        <Info size={20} className="mr-2" />
                        More Info
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Popular Now Section */}
              <section className="px-4 md:px-8 mb-12">
                <h2 className="section-title">Popular on BrokieFlix</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="aspect-video rounded overflow-hidden">
                        <Skeleton className="w-full h-full bg-neutral-800" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {displayedVideos.slice(0, 6).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </section>
              
              {/* Category Rows */}
              {!isLoading && videosByCategory.map((category) => (
                <section key={category.id} className="px-4 md:px-8 mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="section-title">{category.name}</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {category.videos.slice(0, 6).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </main>
      
      {/* Mobile Categories */}
      <MobileCategories selectedCategory={selectedCategory} />
    </div>
  );
};

export default Home;
