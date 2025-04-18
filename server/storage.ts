import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory,
  videos, type Video, type InsertVideo
} from "@shared/schema";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category related methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Video related methods
  getVideos(): Promise<Video[]>;
  getVideosByCategory(categoryId: number): Promise<Video[]>;
  getVideosBySearch(searchTerm: string): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoViews(id: number): Promise<Video | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private videos: Map<number, Video>;
  currentUserId: number;
  currentCategoryId: number;
  currentVideoId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.videos = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentVideoId = 1;
    
    // Initialize with default categories
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Trending", icon: "fire", slug: "trending" },
      { name: "Movies", icon: "film", slug: "movies" },
      { name: "Music", icon: "music", slug: "music" },
      { name: "Gaming", icon: "gamepad", slug: "gaming" },
      { name: "Education", icon: "graduation-cap", slug: "education" },
      { name: "Cooking", icon: "utensils", slug: "cooking" },
      { name: "Fitness", icon: "dumbbell", slug: "fitness" },
      { name: "Programming", icon: "code", slug: "programming" }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
    
    // Create sample videos
    const sampleVideos: InsertVideo[] = [
      {
        title: "How to Budget When You're Broke",
        description: "In this video, we break down practical budgeting techniques for when you're living paycheck to paycheck. Learn how to track expenses, prioritize spending, and start building an emergency fund even when money is tight.",
        thumbnailUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: 504, // 8:24
        categoryId: 1, // Trending
        tags: ["Budget", "SavingMoney", "FinanceTips"],
        uploadedBy: "admin",
      },
      {
        title: "Side Hustle Ideas for 2023",
        description: "Discover the best side hustle ideas to make extra income in 2023. These are practical ways to earn money on the side while working your regular job.",
        thumbnailUrl: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration: 771, // 12:51
        categoryId: 1, // Trending
        tags: ["SideHustle", "Money", "Business"],
        uploadedBy: "admin",
      },
      {
        title: "Thrifting Tips: Find Hidden Gems",
        description: "Learn how to find amazing deals while thrifting. These expert tips will help you discover hidden gems at thrift stores and save a ton of money.",
        thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        duration: 933, // 15:33
        categoryId: 1, // Trending
        tags: ["Thrifting", "Shopping", "Savings"],
        uploadedBy: "admin",
      },
      {
        title: "Easy Ramen Upgrade Ideas",
        description: "Transform your basic instant ramen into gourmet meals with these simple and affordable upgrades. Perfect for college students and budget-conscious foodies.",
        thumbnailUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        duration: 434, // 7:14
        categoryId: 6, // Cooking
        tags: ["Ramen", "CookingHacks", "BudgetMeals"],
        uploadedBy: "admin",
      },
      {
        title: "Investing With Just $50",
        description: "Yes, you can start investing with just $50! Learn about micro-investing apps, fractional shares, and other ways to begin your investment journey with minimal cash.",
        thumbnailUrl: "https://images.unsplash.com/photo-1593672755342-741a7f868732?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        duration: 1102, // 18:22
        categoryId: 5, // Finance
        tags: ["Investing", "Finance", "Money"],
        uploadedBy: "admin",
      },
      {
        title: "Pay Off Debt Fast: 5 Methods",
        description: "Learn five proven strategies to eliminate debt quickly. From the snowball method to debt consolidation, find out which approach works best for your situation.",
        thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        duration: 845, // 14:05
        categoryId: 5, // Finance
        tags: ["DebtFree", "FinanceTips", "Money"],
        uploadedBy: "admin",
      }
    ];
    
    sampleVideos.forEach(video => {
      this.createVideo(video);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin === undefined ? false : insertUser.isAdmin 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Video methods
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }
  
  async getVideosByCategory(categoryId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.categoryId === categoryId,
    );
  }
  
  async getVideosBySearch(searchTerm: string): Promise<Video[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Array.from(this.videos.values()).filter(
      (video) => 
        video.title.toLowerCase().includes(lowerSearchTerm) || 
        video.description.toLowerCase().includes(lowerSearchTerm) ||
        video.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      views: 0, 
      uploadedAt: now,
    };
    this.videos.set(id, video);
    return video;
  }
  
  async updateVideoViews(id: number): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (video) {
      const updatedVideo = { ...video, views: video.views + 1 };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
