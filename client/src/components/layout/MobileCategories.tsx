import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Category } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileCategoriesProps {
  selectedCategory?: string;
}

const MobileCategories = ({ selectedCategory = "trending" }: MobileCategoriesProps) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Get only the first 4 categories for mobile view (plus "More" option)
  const visibleCategories = categories?.slice(0, 4);

  // Helper function to get the appropriate icon for each category
  const getCategoryIcon = (icon: string) => {
    return <i className={`fas fa-${icon} text-lg mb-1`}></i>;
  };

  return (
    <div className="lg:hidden bg-[#1A1A1A] sticky bottom-0 z-10 pt-2 pb-1 px-2 border-t border-gray-800">
      {isLoading ? (
        <div className="flex justify-between items-center overflow-x-auto pb-1 space-x-1">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="min-w-[80px] h-14 bg-[#242424]" />
          ))}
        </div>
      ) : (
        <div className="flex justify-between items-center overflow-x-auto pb-1 space-x-1">
          {/* Trending category */}
          <Link href="/">
            <a 
              className={cn(
                "flex flex-col items-center min-w-[80px] px-2 py-1 rounded text-xs",
                selectedCategory === "trending" 
                  ? "text-[#FF4500]" 
                  : "text-white hover:bg-[#242424]"
              )}
            >
              {getCategoryIcon("fire")}
              <span>Trending</span>
            </a>
          </Link>
          
          {/* Other categories */}
          {visibleCategories?.filter(cat => cat.slug !== "trending").map((category) => (
            <Link key={category.id} href={`/?category=${category.slug}`}>
              <a 
                className={cn(
                  "flex flex-col items-center min-w-[80px] px-2 py-1 rounded text-xs",
                  selectedCategory === category.slug 
                    ? "text-[#FF4500]" 
                    : "text-white hover:bg-[#242424]"
                )}
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
              </a>
            </Link>
          ))}
          
          {/* More option */}
          <Link href="/?showAllCategories=true">
            <a className="flex flex-col items-center min-w-[80px] px-2 py-1 rounded text-white text-xs hover:bg-[#242424]">
              <i className="fas fa-ellipsis-h text-lg mb-1"></i>
              <span>More</span>
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileCategories;
