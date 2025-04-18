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
  likeVideo(username: string, videoId: number): Promise<boolean>;
  unlikeVideo(username: string, videoId: number): Promise<boolean>;
  getUserLikedVideos(username: string): Promise<number[]>;
  
  // Category related methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Video related methods
  getVideos(): Promise<Video[]>;
  getVideosByCategory(categoryId: number): Promise<Video[]>;
  getVideosByType(type: string): Promise<Video[]>;
  getVideosBySearch(searchTerm: string): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoViews(id: number): Promise<Video | undefined>;
  updateVideoFeatured(id: number, isFeatured: boolean): Promise<Video | undefined>;
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
      { name: "TV Shows", icon: "tv", slug: "tvshows" }
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
    
    // Create sample videos - initially none, admin will add them
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false,
      likedVideos: [] 
    };
    this.users.set(id, user);
    return user;
  }
  
  async likeVideo(username: string, videoId: number): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    const video = await this.getVideoById(videoId);
    
    if (!user || !video) {
      return false;
    }
    
    // Check if video is already liked
    if (user.likedVideos.includes(videoId)) {
      return true;
    }
    
    // Update user's liked videos
    const updatedUser = { 
      ...user, 
      likedVideos: [...user.likedVideos, videoId] 
    };
    this.users.set(user.id, updatedUser);
    
    // Update video's like count
    const updatedVideo = { 
      ...video, 
      likes: video.likes + 1 
    };
    this.videos.set(videoId, updatedVideo);
    
    return true;
  }
  
  async unlikeVideo(username: string, videoId: number): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    const video = await this.getVideoById(videoId);
    
    if (!user || !video) {
      return false;
    }
    
    // Check if video is not liked
    if (!user.likedVideos.includes(videoId)) {
      return true;
    }
    
    // Update user's liked videos
    const updatedUser = { 
      ...user, 
      likedVideos: user.likedVideos.filter(id => id !== videoId) 
    };
    this.users.set(user.id, updatedUser);
    
    // Update video's like count
    const updatedVideo = { 
      ...video, 
      likes: Math.max(0, video.likes - 1) 
    };
    this.videos.set(videoId, updatedVideo);
    
    return true;
  }
  
  async getUserLikedVideos(username: string): Promise<number[]> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return [];
    }
    return user.likedVideos;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByCategory(categoryId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.categoryId === categoryId
    );
  }
  
  async getVideosByType(type: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.type === type
    );
  }

  async getVideosBySearch(searchTerm: string): Promise<Video[]> {
    const lowerTerm = searchTerm.toLowerCase();
    return Array.from(this.videos.values()).filter((video) => {
      return (
        video.title.toLowerCase().includes(lowerTerm) ||
        video.description.toLowerCase().includes(lowerTerm) ||
        video.tags.some((tag) => tag.toLowerCase().includes(lowerTerm))
      );
    });
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = { 
      ...insertVideo, 
      id, 
      views: 0,
      likes: 0,
      uploadedAt: new Date(),
      isFeatured: insertVideo.isFeatured || false,
      type: insertVideo.type || 'movie'
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
  
  async updateVideoFeatured(id: number, isFeatured: boolean): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (video) {
      const updatedVideo = { ...video, isFeatured };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }
}

export const storage = new MemStorage();