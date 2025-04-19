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
  deleteVideo(id: number): Promise<boolean>;
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
    
    // Create admin user with complex username
    this.createUser({
      username: "admin_daniwdiawdnawidwandwndwadnwi",
      password: "admin123",
      isAdmin: true
    });
    
    // Default videos list
    const sampleVideos: InsertVideo[] = [
      {
        title: "The Lost City",
        description: "An epic adventure in a mysterious ancient city",
        categoryId: 2, // Movies category
        duration: 7200,
        thumbnailUrl: "https://images.unsplash.com/photo-1618172193763-c511deb635ca",
        videoUrl: "https://example.com/lost-city.mp4",
        tags: ["adventure", "action", "mystery"],
        isPopular: true
      },
      {
        title: "Summer Beats",
        description: "The hottest summer music festival highlights",
        categoryId: 3, // Music category
        duration: 3600,
        thumbnailUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
        videoUrl: "https://example.com/summer-beats.mp4",
        tags: ["music", "festival", "summer"],
        isPopular: true
      },
      {
        title: "Pro Gaming Tips",
        description: "Advanced strategies for competitive gaming",
        categoryId: 4, // Gaming category
        duration: 2400,
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        videoUrl: "https://example.com/gaming-tips.mp4",
        tags: ["gaming", "esports", "tutorial"]
      },
      {
        title: "Cosmic Journey",
        description: "Explore the mysteries of the universe",
        categoryId: 5, // Education category
        duration: 3000,
        thumbnailUrl: "https://images.unsplash.com/photo-1462332420958-a05d1e002413",
        videoUrl: "https://example.com/cosmic-journey.mp4",
        tags: ["space", "science", "education"]
      },
      {
        title: "Gourmet Kitchen",
        description: "Master chef secrets revealed",
        categoryId: 6, // Cooking category
        duration: 1800,
        thumbnailUrl: "https://images.unsplash.com/photo-1556910096-6f5e72db6803",
        videoUrl: "https://example.com/gourmet-kitchen.mp4",
        tags: ["cooking", "chef", "gourmet"]
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
  
  async deleteVideo(id: number): Promise<boolean> {
    if (this.videos.has(id)) {
      return this.videos.delete(id);
    }
    return false;
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
