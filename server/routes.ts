import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAttendanceSchema, insertFeedbackSchema, insertMenuSchema, insertMessInfoSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a manager
const isManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === "manager") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // =========================================
  
  // Attendance routes
  // -----------------------------------------
  // Mark attendance (create or update)
  app.post("/api/attendance", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if attendance already exists for today
      const todayAttendances = await storage.getAttendanceByDate(today);
      const existingAttendance = todayAttendances.find(a => a.userId === userId);
      
      if (existingAttendance) {
        // Update existing attendance
        const updatedAttendance = await storage.updateAttendance(
          existingAttendance.id, 
          req.body.status
        );
        return res.json(updatedAttendance);
      }
      
      // Create new attendance
      const attendance = await storage.createAttendance({
        userId,
        date: today,
        status: req.body.status
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      next(error);
    }
  });
  
  // Get attendance history for current user
  app.get("/api/attendance/me", isAuthenticated, async (req, res, next) => {
    try {
      const attendances = await storage.getAttendanceByUserId(req.user.id);
      res.json(attendances);
    } catch (error) {
      next(error);
    }
  });
  
  // Get today's attendance for current user
  app.get("/api/attendance/today", isAuthenticated, async (req, res, next) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttendances = await storage.getAttendanceByDate(today);
      const myAttendance = todayAttendances.find(a => a.userId === req.user.id);
      
      if (myAttendance) {
        res.json(myAttendance);
      } else {
        res.json(null);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Get all attendance records (manager only)
  app.get("/api/attendance", isManager, async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      let attendances;
      if (startDate && endDate) {
        attendances = await storage.getAttendanceByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else if (startDate) {
        attendances = await storage.getAttendanceByDate(new Date(startDate as string));
      } else {
        // Default to today's attendance if no dates provided
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        attendances = await storage.getAttendanceByDate(today);
      }
      
      // Get all users to merge with attendance data
      const users = await storage.getAllUsers();
      
      // Merge attendance data with user info
      const enrichedAttendances = attendances.map(attendance => {
        const user = users.find(u => u.id === attendance.userId);
        return {
          ...attendance,
          user: user ? { id: user.id, fullName: user.fullName, username: user.username, role: user.role } : null
        };
      });
      
      res.json(enrichedAttendances);
    } catch (error) {
      next(error);
    }
  });
  
  // Menu routes
  // -----------------------------------------
  // Get menus by date or date range
  app.get("/api/menus", async (req, res, next) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      let menus;
      if (startDate && endDate) {
        menus = await storage.getMenusByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else if (date) {
        menus = await storage.getMenusByDate(new Date(date as string));
      } else {
        // Default to today's menu if no date provided
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        menus = await storage.getMenusByDate(today);
      }
      
      res.json(menus);
    } catch (error) {
      next(error);
    }
  });
  
  // Get menu by ID
  app.get("/api/menus/:id", async (req, res, next) => {
    try {
      const menuId = parseInt(req.params.id);
      const menu = await storage.getMenuById(menuId);
      
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      
      res.json(menu);
    } catch (error) {
      next(error);
    }
  });
  
  // Create menu (manager only)
  app.post("/api/menus", isManager, async (req, res, next) => {
    try {
      const validatedMenu = insertMenuSchema.parse(req.body);
      const menu = await storage.createMenu(validatedMenu);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Update menu (manager only)
  app.put("/api/menus/:id", isManager, async (req, res, next) => {
    try {
      const menuId = parseInt(req.params.id);
      const menu = await storage.getMenuById(menuId);
      
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      
      const updatedMenu = await storage.updateMenu(menuId, req.body);
      res.json(updatedMenu);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete menu (manager only)
  app.delete("/api/menus/:id", isManager, async (req, res, next) => {
    try {
      const menuId = parseInt(req.params.id);
      const deleted = await storage.deleteMenu(menuId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Menu not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Feedback routes
  // -----------------------------------------
  // Submit feedback (customer only)
  app.post("/api/feedback", isAuthenticated, async (req, res, next) => {
    try {
      const feedback = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedFeedback = insertFeedbackSchema.parse(feedback);
      const createdFeedback = await storage.createFeedback(validatedFeedback);
      
      res.status(201).json(createdFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Get all feedback (manager only)
  app.get("/api/feedback", isManager, async (req, res, next) => {
    try {
      const feedbacks = await storage.getAllFeedback();
      
      // Get all users to merge with feedback data
      const users = await storage.getAllUsers();
      
      // Merge feedback data with user info
      const enrichedFeedbacks = feedbacks.map(feedback => {
        const user = users.find(u => u.id === feedback.userId);
        return {
          ...feedback,
          user: user ? { id: user.id, fullName: user.fullName, username: user.username } : null
        };
      });
      
      res.json(enrichedFeedbacks);
    } catch (error) {
      next(error);
    }
  });
  
  // Get feedback for current user
  app.get("/api/feedback/me", isAuthenticated, async (req, res, next) => {
    try {
      const feedbacks = await storage.getFeedbackByUserId(req.user.id);
      res.json(feedbacks);
    } catch (error) {
      next(error);
    }
  });
  
  // Mess Info routes
  // -----------------------------------------
  // Get mess info
  app.get("/api/mess-info", async (req, res, next) => {
    try {
      const messInfo = await storage.getMessInfo();
      res.json(messInfo);
    } catch (error) {
      next(error);
    }
  });
  
  // Update mess info (manager only)
  app.put("/api/mess-info", isManager, async (req, res, next) => {
    try {
      const updatedMessInfo = await storage.updateMessInfo(req.body);
      res.json(updatedMessInfo);
    } catch (error) {
      next(error);
    }
  });
  
  // Users route (manager only)
  app.get("/api/users", isManager, async (req, res, next) => {
    try {
      let users;
      
      if (req.query.role) {
        users = await storage.getUsersByRole(req.query.role as string);
      } else {
        users = await storage.getAllUsers();
      }
      
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
