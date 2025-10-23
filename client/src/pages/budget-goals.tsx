import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertBudgetSchema,
  insertGoalSchema,
  type InsertBudget,
  type InsertGoal,
  type Budget,
  type Goal,
  type Transaction,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const expenseCategories = [
  { value: "groceries", label: "Groceries" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "shopping", label: "Shopping" },
  { value: "dining", label: "Dining" },
  { value: "other_expense", label: "Other Expense" },
];

const goalTypes = [
  { value: "savings", label: "Savings" },
  { value: "debt_reduction", label: "Debt Reduction" },
  { value: "investment", label: "Investment" },
];

export default function BudgetGoals() {
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const { toast } = useToast();

  const { data: budgets = [], isLoading: loadingBudgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const budgetForm = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      category: "",
      limit: "",
      period: "monthly",
    },
  });

  const goalForm = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      name: "",
      type: "",
      targetAmount: "",
      currentAmount: "0",
      targetDate: "",
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: InsertBudget) => {
      return await apiRequest("POST", "/api/budgets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Budget created successfully" });
      budgetForm.reset();
      setBudgetOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create budget", variant: "destructive" });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertGoal) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully" });
      goalForm.reset();
      setGoalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, currentAmount }: { id: string; currentAmount: string }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, { currentAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully" });
    },
  });

  const onSubmitBudget = (data: InsertBudget) => {
    createBudgetMutation.mutate(data);
  };

  const onSubmitGoal = (data: InsertGoal) => {
    createGoalMutation.mutate(data);
  };

  // Calculate spending per category
  const categorySpending = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const isLoading = loadingBudgets || loadingGoals;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budget & Goals</h1>
        <p className="text-muted-foreground mt-1">
          Manage your budgets and track financial goals
        </p>
      </div>

      <Tabs defaultValue="budgets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="budgets" data-testid="tab-budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-budget">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Budget</DialogTitle>
                </DialogHeader>
                <Form {...budgetForm}>
                  <form
                    onSubmit={budgetForm.handleSubmit(onSubmitBudget)}
                    className="space-y-4"
                  >
                    <FormField
                      control={budgetForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-budget-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={budgetForm.control}
                      name="limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              data-testid="input-budget-limit"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createBudgetMutation.isPending}
                      data-testid="button-submit-budget"
                    >
                      {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {budgets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No budgets set. Create your first budget to start tracking spending limits.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const spent = categorySpending[budget.category] || 0;
                const limit = Number(budget.limit);
                const percentage = (spent / limit) * 100;
                const isOverBudget = spent > limit;

                return (
                  <Card key={budget.id} data-testid={`budget-${budget.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>
                          {budget.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        {isOverBudget && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Spent</span>
                        <span className={`font-mono font-semibold ${isOverBudget ? "text-destructive" : ""}`}>
                          ${spent.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Limit</span>
                        <span className="font-mono font-semibold">
                          ${limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={isOverBudget ? "bg-destructive/20" : ""}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        {percentage.toFixed(1)}% of budget used
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-goal">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Financial Goal</DialogTitle>
                </DialogHeader>
                <Form {...goalForm}>
                  <form
                    onSubmit={goalForm.handleSubmit(onSubmitGoal)}
                    className="space-y-4"
                  >
                    <FormField
                      control={goalForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Emergency Fund"
                              data-testid="input-goal-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-goal-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goalTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              data-testid="input-goal-target"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="currentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              data-testid="input-goal-current"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              data-testid="input-goal-date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createGoalMutation.isPending}
                      data-testid="button-submit-goal"
                    >
                      {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No goals set. Create your first financial goal to start tracking your progress.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
                const daysRemaining = Math.ceil(
                  (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={goal.id} data-testid={`goal-${goal.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {goal.name}
                        </CardTitle>
                        <Badge variant="outline">
                          {goal.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Current</p>
                          <p className="text-lg font-mono font-semibold">
                            ${Number(goal.currentAmount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target</p>
                          <p className="text-lg font-mono font-semibold">
                            ${Number(goal.targetAmount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className="text-lg font-mono font-semibold">
                            ${remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Target: {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                        </span>
                        <span className={daysRemaining < 30 ? "text-warning" : "text-muted-foreground"}>
                          {daysRemaining} days remaining
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
