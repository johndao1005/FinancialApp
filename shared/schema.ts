import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transaction categories
export const transactionCategories = [
  "salary",
  "freelance",
  "investment_income",
  "other_income",
  "groceries",
  "utilities",
  "rent",
  "transportation",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "dining",
  "other_expense"
] as const;

export const transactionTypes = ["income", "expense"] as const;

// Investment categories
export const investmentCategories = [
  "stocks",
  "bonds",
  "real_estate",
  "crypto",
  "mutual_funds",
  "savings",
  "other"
] as const;

// Goal types
export const goalTypes = ["savings", "debt_reduction", "investment"] as const;

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(transactionTypes),
  category: z.string(),
  amount: z.string().or(z.number()),
  description: z.string().min(1),
  date: z.string().or(z.date()),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Investments table
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.string(),
  amount: z.string().or(z.number()),
  currentValue: z.string().or(z.number()),
  purchaseDate: z.string().or(z.date()),
  name: z.string().min(1),
});

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

// Budget table
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull().unique(),
  limit: decimal("limit", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull().default("monthly"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.string(),
  limit: z.string().or(z.number()),
  period: z.string().default("monthly"),
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  targetDate: timestamp("target_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.string(),
  targetAmount: z.string().or(z.number()),
  currentAmount: z.string().or(z.number()).optional(),
  targetDate: z.string().or(z.date()),
  name: z.string().min(1),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// AI Chat Messages table
export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;
