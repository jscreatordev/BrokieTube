import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Video, type Category } from "@shared/schema";
import CategorySidebar from "@/components/layout/CategorySidebar";
import MobileCategories from "@/components/layout/MobileCategories";
import VideoCard from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("trending");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  
  // Parse URL params to get category and search query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
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
  let pageTitle = "Trending Now";
  
  if (searchQuery) {
    displayedVideos = searchResults || [];
    isLoading = isLoadingSearch;
    pageTitle = `Search Results: ${searchQuery}`;
  } else if (selectedCategory === "trending") {
    displayedVideos = allVideos || [];
    isLoading = isLoadingVideos;
  } else {
    displayedVideos = categoryVideos || [];
    isLoading = isLoadingCategoryVideos;
    pageTitle = categories?.find(c => c.slug === selectedCategory)?.name || "Videos";
  }
  
  // Group videos by category for the homepage
  const videosByCategory = allVideos
    ? Array.from(new Set(allVideos.map(video => video.categoryId)))
        .filter(categoryId => {
          const category = categories?.find(c => c.id === categoryId);
          return category && category.slug !== "trending";
        })
        .map(categoryId => {
          const category = categories?.find(c => c.id === categoryId);
          const categoryVideos = allVideos.filter(video => video.categoryId === categoryId);
          return {
            id: categoryId,
            name: category?.name || "",
            videos: categoryVideos
          };
        })
    : [];
  
  return (
    <div className="flex flex-1">
      {/* Category Sidebar */}
      <CategorySidebar selectedCategory={selectedCategory} />
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Home Page Content */}
        <div id="home-page">
          {searchQuery || selectedCategory !== "trending" ? (
            // Category or Search page with single section
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{pageTitle}</h2>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#242424] rounded-lg overflow-hidden">
                      <Skeleton className="aspect-video w-full bg-[#1A1A1A]" />
                      <div className="p-3">
                        <Skeleton className="h-5 w-full mb-2 bg-[#1A1A1A]" />
                        <Skeleton className="h-4 w-1/2 mb-2 bg-[#1A1A1A]" />
                        <Skeleton className="h-3 w-2/3 bg-[#1A1A1A]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedVideos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#B3B3B3]">No videos found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            // Homepage with multiple category sections
            <>
              {/* Trending Section */}
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Trending Now</h2>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-[#242424] rounded-lg overflow-hidden">
                        <Skeleton className="aspect-video w-full bg-[#1A1A1A]" />
                        <div className="p-3">
                          <Skeleton className="h-5 w-full mb-2 bg-[#1A1A1A]" />
                          <Skeleton className="h-4 w-1/2 mb-2 bg-[#1A1A1A]" />
                          <Skeleton className="h-3 w-2/3 bg-[#1A1A1A]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayedVideos.slice(0, 4).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </section>
              
              {/* Category Sections */}
              {!isLoading && videosByCategory.map((category) => (
                <section key={category.id} className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <a href={`/?category=${categories?.find(c => c.id === category.id)?.slug}`} className="text-sm text-[#FF4500] hover:underline">See all</a>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {category.videos.slice(0, 4).map((video) => (
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
