import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("customer"), // 'customer' or 'manager'
});

export const usersRelations = relations(users, ({ many }) => ({
  attendances: many(attendances),
  feedbacks: many(feedbacks),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Attendance model
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull().defaultNow(),
  status: boolean("status").notNull().default(true), // true = present, false = absent
});

export const attendancesRelations = relations(attendances, ({ one }) => ({
  user: one(users, {
    fields: [attendances.userId],
    references: [users.id],
  })
}));

export const insertAttendanceSchema = createInsertSchema(attendances).pick({
  userId: true,
  date: true,
  status: true,
});

// Menu model
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'breakfast', 'lunch', 'dinner'
  items: jsonb("items").notNull(), // array of food items
  description: text("description"),
});

export const menusRelations = relations(menus, ({ many }) => ({
  feedbacks: many(feedbacks),
}));

export const insertMenuSchema = createInsertSchema(menus).pick({
  date: true,
  type: true,
  items: true,
  description: true,
});

// Feedback model
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull().defaultNow(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  menuId: integer("menu_id").references(() => menus.id, { onDelete: 'set null' }), // optional, can be related to a specific menu
});

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
  menu: one(menus, {
    fields: [feedbacks.menuId],
    references: [menus.id],
  }),
}));

export const insertFeedbackSchema = createInsertSchema(feedbacks).pick({
  userId: true,
  date: true,
  rating: true,
  comment: true,
  menuId: true,
});

// MessInfo model for general info about the mess
export const messInfos = pgTable("mess_infos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  operatingHours: jsonb("operating_hours").notNull(), // JSON object with opening and closing hours
  contactInfo: text("contact_info"),
});

export const insertMessInfoSchema = createInsertSchema(messInfos).pick({
  name: true,
  description: true,
  operatingHours: true,
  contactInfo: true,
});

// Export all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Menu = typeof menus.$inferSelect;
export type InsertMenu = z.infer<typeof insertMenuSchema>;

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type MessInfo = typeof messInfos.$inferSelect;
export type InsertMessInfo = z.infer<typeof insertMessInfoSchema>;
