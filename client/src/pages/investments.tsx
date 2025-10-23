import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { insertInvestmentSchema, type InsertInvestment, type Investment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const investmentCategories = [
  { value: "stocks", label: "Stocks" },
  { value: "bonds", label: "Bonds" },
  { value: "real_estate", label: "Real Estate" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Investments() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: investments = [], isLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const form = useForm<InsertInvestment>({
    resolver: zodResolver(insertInvestmentSchema),
    defaultValues: {
      name: "",
      category: "",
      amount: "",
      currentValue: "",
      purchaseDate: new Date().toISOString().split("T")[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInvestment) => {
      return await apiRequest("POST", "/api/investments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({ title: "Investment added successfully" });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to add investment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInvestment) => {
    createMutation.mutate(data);
  };

  // Calculate totals
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Portfolio distribution
  const portfolioData = investments.reduce((acc, inv) => {
    const existing = acc.find((item) => item.name === inv.category);
    if (existing) {
      existing.value += Number(inv.currentValue);
    } else {
      acc.push({
        name: inv.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: Number(inv.currentValue),
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investments</h1>
          <p className="text-muted-foreground mt-1">
            Track your investment portfolio
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-investment">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Apple Stock, Bitcoin"
                          data-testid="input-investment-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-investment-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {investmentCategories.map((cat) => (
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
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Investment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          data-testid="input-investment-amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          data-testid="input-investment-value"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-investment-date"
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
                  disabled={createMutation.isPending}
                  data-testid="button-submit-investment"
                >
                  {createMutation.isPending ? "Adding..." : "Add Investment"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-semibold" data-testid="text-total-invested">
              ${totalInvested.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-semibold" data-testid="text-total-value">
              ${totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-mono font-semibold ${
                totalGain >= 0 ? "text-success" : "text-destructive"
              }`}
              data-testid="text-total-gain"
            >
              {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString()}
            </div>
            <p
              className={`text-sm mt-1 ${
                gainPercentage >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {gainPercentage >= 0 ? "+" : ""}
              {gainPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Distribution */}
        {portfolioData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Investment List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No investments yet. Add your first investment to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => {
                  const gain = Number(investment.currentValue) - Number(investment.amount);
                  const gainPercent = (gain / Number(investment.amount)) * 100;
                  return (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-4 rounded-md border hover-elevate"
                      data-testid={`investment-${investment.id}`}
                    >
                      <div>
                        <p className="font-medium">{investment.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {investment.category.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(investment.purchaseDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          ${Number(investment.currentValue).toLocaleString()}
                        </div>
                        <div
                          className={`text-xs flex items-center gap-1 justify-end ${
                            gain >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {gain >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {gain >= 0 ? "+" : ""}${gain.toLocaleString()} (
                          {gainPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
