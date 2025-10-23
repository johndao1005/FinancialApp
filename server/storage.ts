import {
  type Transaction,
  type InsertTransaction,
  type Investment,
  type InsertInvestment,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type AiMessage,
  type InsertAiMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Investments
  getInvestments(): Promise<Investment[]>;
  getInvestment(id: string): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  
  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  
  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, data: Partial<Goal>): Promise<Goal | undefined>;
  
  // AI Messages
  getAiMessages(): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private investments: Map<string, Investment>;
  private budgets: Map<string, Budget>;
  private goals: Map<string, Goal>;
  private aiMessages: Map<string, AiMessage>;

  constructor() {
    this.transactions = new Map();
    this.investments = new Map();
    this.budgets = new Map();
    this.goals = new Map();
    this.aiMessages = new Map();
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: new Date(insertTransaction.date),
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Investments
  async getInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async getInvestment(id: string): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const investment: Investment = {
      ...insertInvestment,
      id,
      purchaseDate: new Date(insertInvestment.purchaseDate),
      createdAt: new Date(),
    };
    this.investments.set(id, investment);
    return investment;
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      ...insertBudget,
      id,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      currentAmount: insertGoal.currentAmount || "0",
      targetDate: new Date(insertGoal.targetDate),
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...data };
    this.goals.set(id, updated);
    return updated;
  }

  // AI Messages
  async getAiMessages(): Promise<AiMessage[]> {
    return Array.from(this.aiMessages.values());
  }

  async createAiMessage(insertMessage: InsertAiMessage): Promise<AiMessage> {
    const id = randomUUID();
    const message: AiMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.aiMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
