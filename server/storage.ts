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
    
    // No sample videos - clean start
    const sampleVideos: InsertVideo[] = [];
    
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
