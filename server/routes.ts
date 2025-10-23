import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertInvestmentSchema, insertBudgetSchema, insertGoalSchema } from "@shared/schema";
import { getFinancialAdvice } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Investments routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const data = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(data);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  // Budgets routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const data = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(data);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate update data with partial schema
      const updateSchema = insertGoalSchema.partial().pick({
        currentAmount: true,
        targetAmount: true,
        targetDate: true,
        name: true,
      });
      
      const validatedData = updateSchema.parse(req.body);
      const goal = await storage.updateGoal(id, validatedData);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Failed to update goal" });
    }
  });

  // AI Assistant routes
  app.get("/api/ai/messages", async (req, res) => {
    try {
      const messages = await storage.getAiMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Save user message
      await storage.createAiMessage({
        role: "user",
        content: message,
      });

      // Get financial context for better advice
      const transactions = await storage.getTransactions();
      const investments = await storage.getInvestments();
      const budgets = await storage.getBudgets();

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalInvestments = investments.reduce(
        (sum, inv) => sum + Number(inv.currentValue),
        0
      );

      // Get AI response
      const aiResponse = await getFinancialAdvice(message, {
        totalIncome,
        totalExpenses,
        investments: totalInvestments,
        budgets,
      });

      // Save AI response
      await storage.createAiMessage({
        role: "assistant",
        content: aiResponse,
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
