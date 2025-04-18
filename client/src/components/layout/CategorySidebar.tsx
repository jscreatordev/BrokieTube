import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  selectedCategory?: string;
}

const CategorySidebar = ({ selectedCategory = "trending" }: CategorySidebarProps) => {
  const [location, navigate] = useLocation();
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Helper function to get the appropriate icon for each category
  const getCategoryIcon = (icon: string) => {
    return <i className={`fas fa-${icon} mr-3`}></i>;
  };
  
  const handleCategoryClick = (slug: string) => {
    if (slug === "trending") {
      navigate("/");
    } else {
      navigate(`/?genre=${slug}`);
    }
  };

  return (
    <aside className="hidden lg:block w-64 bg-black/95 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-6 pl-2 uppercase tracking-wider text-neutral-400">Genres</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-neutral-800" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {categories?.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategoryClick(category.slug)}
                className={cn(
                  "flex items-center w-full py-2 px-3 rounded text-left hover:bg-neutral-800 transition-colors",
                  (
                    (selectedCategory === category.slug) ||
                    (selectedCategory === "trending" && category.slug === "trending" && !location.includes("?"))
                  ) && "text-primary border-l-2 border-primary pl-2 font-medium"
                )}
              >
                {getCategoryIcon(category.icon)}
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default CategorySidebar;
