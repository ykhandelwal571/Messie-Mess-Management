import { 
  User, InsertUser, 
  Attendance, InsertAttendance, 
  Menu, InsertMenu, 
  Feedback, InsertFeedback, 
  MessInfo, InsertMessInfo 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Attendance methods
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByUserId(userId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]>;
  updateAttendance(id: number, status: boolean): Promise<Attendance | undefined>;
  
  // Menu methods
  createMenu(menu: InsertMenu): Promise<Menu>;
  getMenuById(id: number): Promise<Menu | undefined>;
  getMenusByDate(date: Date): Promise<Menu[]>;
  getMenusByDateRange(startDate: Date, endDate: Date): Promise<Menu[]>;
  updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: number): Promise<boolean>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackById(id: number): Promise<Feedback | undefined>;
  getFeedbackByUserId(userId: number): Promise<Feedback[]>;
  getFeedbackByMenuId(menuId: number): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
  
  // MessInfo methods
  getMessInfo(): Promise<MessInfo | undefined>;
  updateMessInfo(messInfo: Partial<InsertMessInfo>): Promise<MessInfo | undefined>;
  
  // Session store for auth
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private attendances: Map<number, Attendance>;
  private menus: Map<number, Menu>;
  private feedbacks: Map<number, Feedback>;
  private messInfo: MessInfo | undefined;
  private userIdCounter: number;
  private attendanceIdCounter: number;
  private menuIdCounter: number;
  private feedbackIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.attendances = new Map();
    this.menus = new Map();
    this.feedbacks = new Map();
    this.userIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.menuIdCounter = 1;
    this.feedbackIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with a default admin/manager account
    this.createUser({
      username: "manager",
      password: "password123",
      fullName: "Mess Manager",
      role: "manager"
    });
    
    // Initialize with a default customer account
    this.createUser({
      username: "customer",
      password: "password123",
      fullName: "John Customer",
      role: "customer"
    });
    
    // Initialize with default mess info
    this.messInfo = {
      id: 1,
      name: "Campus Mess",
      description: "The main mess facility for the campus",
      operatingHours: {
        breakfast: { open: "7:00 AM", close: "9:30 AM" },
        lunch: { open: "12:00 PM", close: "2:30 PM" },
        dinner: { open: "7:00 PM", close: "9:30 PM" }
      },
      contactInfo: "Email: mess@campus.edu | Phone: (123) 456-7890"
    };
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
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Attendance methods
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceIdCounter++;
    const attendance: Attendance = { ...insertAttendance, id };
    this.attendances.set(id, attendance);
    return attendance;
  }
  
  async getAttendanceByUserId(userId: number): Promise<Attendance[]> {
    return Array.from(this.attendances.values()).filter(
      (attendance) => attendance.userId === userId
    );
  }
  
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateStr = date.toDateString();
    return Array.from(this.attendances.values()).filter(
      (attendance) => new Date(attendance.date).toDateString() === dateStr
    );
  }
  
  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]> {
    return Array.from(this.attendances.values()).filter(
      (attendance) => {
        const attendanceDate = new Date(attendance.date);
        return attendanceDate >= startDate && attendanceDate <= endDate;
      }
    );
  }
  
  async updateAttendance(id: number, status: boolean): Promise<Attendance | undefined> {
    const attendance = this.attendances.get(id);
    if (!attendance) return undefined;
    
    const updatedAttendance = { ...attendance, status };
    this.attendances.set(id, updatedAttendance);
    return updatedAttendance;
  }

  // Menu methods
  async createMenu(insertMenu: InsertMenu): Promise<Menu> {
    const id = this.menuIdCounter++;
    const menu: Menu = { ...insertMenu, id };
    this.menus.set(id, menu);
    return menu;
  }
  
  async getMenuById(id: number): Promise<Menu | undefined> {
    return this.menus.get(id);
  }
  
  async getMenusByDate(date: Date): Promise<Menu[]> {
    const dateStr = date.toDateString();
    return Array.from(this.menus.values()).filter(
      (menu) => new Date(menu.date).toDateString() === dateStr
    );
  }
  
  async getMenusByDateRange(startDate: Date, endDate: Date): Promise<Menu[]> {
    return Array.from(this.menus.values()).filter(
      (menu) => {
        const menuDate = new Date(menu.date);
        return menuDate >= startDate && menuDate <= endDate;
      }
    );
  }
  
  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    const existingMenu = this.menus.get(id);
    if (!existingMenu) return undefined;
    
    const updatedMenu = { ...existingMenu, ...menu };
    this.menus.set(id, updatedMenu);
    return updatedMenu;
  }
  
  async deleteMenu(id: number): Promise<boolean> {
    return this.menus.delete(id);
  }

  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackIdCounter++;
    const feedback: Feedback = { ...insertFeedback, id };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
  
  async getFeedbackById(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }
  
  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(
      (feedback) => feedback.userId === userId
    );
  }
  
  async getFeedbackByMenuId(menuId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(
      (feedback) => feedback.menuId === menuId
    );
  }
  
  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values());
  }

  // MessInfo methods
  async getMessInfo(): Promise<MessInfo | undefined> {
    return this.messInfo;
  }
  
  async updateMessInfo(info: Partial<InsertMessInfo>): Promise<MessInfo | undefined> {
    if (!this.messInfo) return undefined;
    
    this.messInfo = { ...this.messInfo, ...info };
    return this.messInfo;
  }
}

export const storage = new MemStorage();
