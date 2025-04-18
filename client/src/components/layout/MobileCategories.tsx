import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Category } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileCategoriesProps {
  selectedCategory?: string;
}

const MobileCategories = ({ selectedCategory = "trending" }: MobileCategoriesProps) => {
  const [_, navigate] = useLocation();
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Get all categories for scrollable view
  const visibleCategories = categories || [];

  // Helper function to get the appropriate icon for each category
  const getCategoryIcon = (icon: string) => {
    return <i className={`fas fa-${icon} text-lg mb-1`}></i>;
  };
  
  const handleCategoryClick = (slug: string) => {
    if (slug === "trending") {
      navigate("/");
    } else {
      navigate(`/?genre=${slug}`);
    }
  };

  return (
    <div className="lg:hidden bg-black/90 sticky bottom-0 z-10 py-2 border-t border-neutral-800">
      {isLoading ? (
        <div className="flex overflow-x-auto pb-1 space-x-2 px-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="min-w-[100px] h-10 bg-neutral-800 flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-1 space-x-3 px-3">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                "flex-shrink-0 min-w-[100px] px-4 py-2 rounded-full text-sm text-center",
                selectedCategory === category.slug 
                  ? "bg-primary text-white" 
                  : "bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCategories;
