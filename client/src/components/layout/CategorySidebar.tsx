import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { type Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  selectedCategory?: string;
}

const CategorySidebar = ({ selectedCategory = "trending" }: CategorySidebarProps) => {
  const [location] = useLocation();
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Helper function to get the appropriate icon for each category
  const getCategoryIcon = (icon: string) => {
    return <i className={`fas fa-${icon} mr-3`}></i>;
  };

  return (
    <aside className="hidden lg:block w-56 bg-[#1A1A1A] p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-[#242424]" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {categories?.map((category) => (
            <li key={category.id}>
              <Link href={category.slug === "trending" ? "/" : `/?category=${category.slug}`}>
                <a 
                  className={cn(
                    "flex items-center py-2 px-3 rounded hover:bg-[#242424]",
                    (
                      (selectedCategory === category.slug) ||
                      (selectedCategory === "trending" && category.slug === "trending" && !location.includes("?"))
                    ) && "bg-[#FF4500] bg-opacity-10 text-[#FF4500] hover:bg-opacity-20"
                  )}
                >
                  {getCategoryIcon(category.icon)}
                  {category.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default CategorySidebar;
