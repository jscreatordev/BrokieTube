import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    const username = req.headers["x-username"] as string;
    
    if (!username) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Administrator access required" });
    }
    
    next();
  };

  // GET all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // GET all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos" });
    }
  });
  
  // GET videos by category
  app.get("/api/categories/:id/videos", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const videos = await storage.getVideosByCategory(categoryId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos for category" });
    }
  });
  
  // GET video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count
      await storage.updateVideoViews(videoId);
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Error fetching video" });
    }
  });
  
  // SEARCH videos
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const videos = await storage.getVideosBySearch(query);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error searching videos" });
    }
  });
  
  // POST new video (admin only)
  app.post("/api/videos", isAdmin, async (req, res) => {
    try {
      const username = req.headers["x-username"] as string;
      
      // Validate video data
      const validationResult = insertVideoSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid video data", 
          errors: validationResult.error.errors 
        });
      }
      
      const videoData = validationResult.data;
      
      // Check if category exists
      const category = await storage.getCategoryById(videoData.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Add the video
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: username
      });
      
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: "Error creating video" });
    }
  });
  
  // DELETE video by ID (admin only)
  app.delete("/api/videos/:id", isAdmin, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const success = await storage.deleteVideo(videoId);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
