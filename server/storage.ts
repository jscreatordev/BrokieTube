import {
  users,
  type User,
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  videos,
  type Video,
  type InsertVideo,
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

    // Initialize with default categories and data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultCategories: InsertCategory[] = [
      { name: "Trending", icon: "fire", slug: "trending" },
      { name: "Movies", icon: "film", slug: "movies" },
      { name: "Music", icon: "music", slug: "music" },
      { name: "Gaming", icon: "gamepad", slug: "gaming" },
      { name: "Education", icon: "graduation-cap", slug: "education" },
      { name: "Cooking", icon: "utensils", slug: "cooking" },
      { name: "Fitness", icon: "dumbbell", slug: "fitness" },
      { name: "Programming", icon: "code", slug: "programming" },
    ];

    defaultCategories.forEach((category) => {
      this.createCategory(category);
    });

    this.createUser({
      username: "jscreator",
      password: "admin123",
      isAdmin: true,
    });

    const sampleVideos: InsertVideo[] = [
      {
        title: "A Minecraft Movie",
        description:
          "A mysterious portal pulls four misfits into the Overworld, a bizarre, cubic wonderland that thrives on imagination. To get back home, they'll have to master the terrain while embarking on a magical quest with an unexpected crafter named Steve.",
        categoryId: 2,
        duration: 5644,
        thumbnailUrl:
          "https://img.megaplextheatres.com/FilmBackdrop/HO00003457",
        videoUrl:
          "https://ia601602.us.archive.org/8/items/a-minecraft-movie-nova-show-01/A%20Minecraft%20Movie%20-%20NovaShow-01.mp4",
        tags: ["minecraft", "gaming", "mojang"],
        isPopular: true,
      },
      {
        title: "Sonic The Hedgehog 3",
        description:
          "Sonic, Knuckles and Tails reunite to battle Shadow, a mysterious new enemy with powers unlike anything they've faced before. With their abilities outmatched in every way, they seek out an unlikely alliance to stop Shadow and protect the planet.",
        categoryId: 2,
        duration: 6617,
        thumbnailUrl:
          "https://i.ytimg.com/vi/qYAn4js_TsQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBWISLhBT_uZWzaWDMDCgJRl4fG1w",
        videoUrl:
          "https://ia601907.us.archive.org/19/items/sonic3_202504/1630858463-01.mp4",
        tags: ["sonic", "gaming", "sega"],
        isPopular: true,
      },
      {
        title: "Kung fu Panda 4",
        description:
          "Po must train a new warrior when he's chosen to become the spiritual leader of the Valley of Peace. However, when a powerful shape-shifting sorceress sets her eyes on his Staff of Wisdom, he suddenly realizes he's going to need some help. Teaming up with a quick-witted corsac fox, Po soon discovers that heroes can be found in the most unexpected places.",
        categoryId: 2,
        duration: 5713,
        thumbnailUrl:
          "https://4kwallpapers.com/images/wallpapers/kung-fu-panda-4-1920x1080-15545.jpg",
        videoUrl:
          "https://ia801504.us.archive.org/9/items/kungfupanda4_202504/Watch%20Kung%20Fu%20Panda%204%202024%20Full%20HD%20Movie%20YesMovies%20to-01.mp4",
        tags: ["dreamworks", "animated", "panda"],
        isPopular: false,
      },
      {
        title: "The Wild Robot",
        description:
          "After a shipwreck, an intelligent robot is stranded on an uninhabited island. To survive the harsh surroundings, she bonds with the native animals and cares for an orphaned baby goose. The film was nominated for 3 Oscars.",
        categoryId: 2,
        duration: 6106,
        thumbnailUrl: "https://images3.alphacoders.com/136/1367325.jpeg",
        videoUrl:
          "https://ia800709.us.archive.org/15/items/wild-robot/1630858186-01.mp4",
        tags: ["universal", "animated", "robot"],
        isPopular: false,
      },
      {
        title: "Moana 2",
        description:
          "After receiving an unexpected call from her wayfinding ancestors, a strong-willed girl journeys with her crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she has ever faced.",
        categoryId: 2,
        duration: 5494,
        thumbnailUrl: "https://images.squarespace-cdn.com/content/v1/5fbc4a62c2150e62cfcb09aa/1733125328711-J0YEMFJCDGLKYNC2S030/Moana%2B2%2BCollision.png",
        videoUrl:
          "https://ia601404.us.archive.org/14/items/moana-2_202504/Watch%20Moana%202%202024%20Full%20HD%20Movie%20YesMovies%20to.mp4",
        tags: ["universal", "animated", "robot"],
        isPopular: false,
      }
    ];

    sampleVideos.forEach((video) => {
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
      isAdmin: insertUser.isAdmin ?? false,
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
        video.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm)),
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
    return this.videos.delete(id);
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
