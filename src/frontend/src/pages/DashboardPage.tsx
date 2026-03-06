import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Loader2,
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { CategoryBadge } from "../components/CategoryBadge";
import { ExpenseFormModal } from "../components/ExpenseFormModal";
import { MonthSelector } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import {
  useBudgetByMonth,
  useExpensesByMonth,
  useInvestmentsByMonth,
  useSetBudget,
} from "../hooks/useQueries";
import { formatCurrency, formatDate, formatMonth } from "../lib/constants";

interface DashboardPageProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({
  selectedMonth,
  onMonthChange,
  onNavigate,
}: DashboardPageProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const { data: expenses, isLoading: expLoading } =
    useExpensesByMonth(selectedMonth);
  const { data: investments, isLoading: invLoading } =
    useInvestmentsByMonth(selectedMonth);
  const { data: budget, isLoading: budgetLoading } =
    useBudgetByMonth(selectedMonth);
  const setBudgetMutation = useSetBudget();

  const totalSpent = expenses?.reduce((acc, e) => acc + e.amount, 0) ?? 0;
  const totalInvested = investments?.reduce((acc, i) => acc + i.amount, 0) ?? 0;
  const budgetAmount_ = budget?.amount ?? 0;
  const remaining = budgetAmount_ > 0 ? budgetAmount_ - totalSpent : 0;
  const budgetProgress =
    budgetAmount_ > 0 ? Math.min((totalSpent / budgetAmount_) * 100, 100) : 0;
  const savingsRate =
    budgetAmount_ > 0
      ? Math.max(
          0,
          ((budgetAmount_ - totalSpent - totalInvested) / budgetAmount_) * 100,
        )
      : 0;

  const recentExpenses = [...(expenses ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isLoading = expLoading || invLoading;

  async function handleSetBudget(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number.parseFloat(budgetAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    try {
      await setBudgetMutation.mutateAsync({ month: selectedMonth, amount });
      toast.success("Budget set successfully!");
      setBudgetOpen(false);
      setBudgetAmount("");
    } catch {
      toast.error("Failed to set budget");
    }
  }

  return (
    <>
      <PageHeader
        title={`Dashboard — ${formatMonth(selectedMonth)}`}
        subtitle="Your financial overview at a glance"
        actions={
          <MonthSelector
            value={selectedMonth}
            onChange={onMonthChange}
            ocid="dashboard.month.select"
          />
        }
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            title="Total Spent"
            value={totalSpent}
            icon={DollarSign}
            iconColor="text-red-500"
            loading={isLoading}
            variant="danger"
            index={0}
          />
          <StatCard
            title="Total Invested"
            value={totalInvested}
            icon={TrendingUp}
            iconColor="text-green-600"
            loading={isLoading}
            variant="success"
            index={1}
          />
          <StatCard
            title="Budget Remaining"
            value={budgetAmount_ > 0 ? remaining : 0}
            icon={Wallet}
            iconColor="text-primary"
            loading={isLoading || budgetLoading}
            description={
              budgetAmount_ > 0
                ? `of ${formatCurrency(budgetAmount_)}`
                : "No budget set"
            }
            variant={remaining < 0 ? "danger" : "default"}
            index={2}
          />
          <StatCard
            title="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            icon={PiggyBank}
            iconColor="text-amber-500"
            loading={isLoading || budgetLoading}
            variant="warning"
            index={3}
          />
        </div>

        {/* Budget progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Monthly Budget
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              data-ocid="dashboard.set_budget.button"
              onClick={() => {
                setBudgetAmount(budget?.amount?.toString() ?? "");
                setBudgetOpen(true);
              }}
              className="rounded-xl text-xs h-8"
            >
              {budget ? "Edit Budget" : "Set Budget"}
            </Button>
          </div>

          {budgetLoading ? (
            <Skeleton className="h-4 w-full rounded-full" />
          ) : budget ? (
            <>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{formatCurrency(totalSpent)} spent</span>
                <span>{formatCurrency(budgetAmount_)} budget</span>
              </div>
              <Progress
                value={budgetProgress}
                className="h-2.5"
                style={
                  {
                    "--progress-color":
                      budgetProgress >= 90
                        ? "oklch(0.577 0.245 27.325)"
                        : budgetProgress >= 70
                          ? "oklch(0.78 0.15 80)"
                          : "oklch(var(--primary))",
                  } as React.CSSProperties
                }
              />
              <p className="text-xs text-muted-foreground mt-2">
                {budgetProgress >= 100 ? (
                  <span className="text-destructive font-medium">
                    Over budget by {formatCurrency(totalSpent - budgetAmount_)}
                  </span>
                ) : (
                  `${(100 - budgetProgress).toFixed(0)}% remaining`
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No budget set for this month. Set a budget to track your spending.
            </p>
          )}
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-foreground">
              Recent Expenses
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("expenses")}
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </button>
          </div>

          {expLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No expenses this month yet. Add your first expense!
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id.toString()}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: `${getCategoryColorByName(expense.category)}18`,
                        color: getCategoryColorByName(expense.category),
                      }}
                    >
                      {expense.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {expense.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CategoryBadge category={expense.category} />
                    <span className="font-semibold text-sm text-foreground">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        data-ocid="dashboard.add_expense.button"
        onClick={() => setAddExpenseOpen(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Budget Modal */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent
          data-ocid="budget.modal"
          className="rounded-2xl max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              {budget ? "Update Budget" : "Set Monthly Budget"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetBudget}>
            <div className="py-4">
              <Label htmlFor="budget-amount" className="text-sm font-medium">
                Budget Amount (₹)
              </Label>
              <Input
                id="budget-amount"
                data-ocid="budget.amount.input"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 3000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="mt-2 rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-2">
                For {formatMonth(selectedMonth)}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="budget.cancel_button"
                onClick={() => setBudgetOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="budget.submit_button"
                disabled={setBudgetMutation.isPending}
                className="rounded-xl"
              >
                {setBudgetMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {budget ? "Update" : "Set Budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add expense from dashboard */}
      <ExpenseFormModal
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        month={selectedMonth}
      />
    </>
  );
}

function getCategoryColorByName(category: string): string {
  const colors: Record<string, string> = {
    Food: "#f97316",
    Transport: "#3b82f6",
    Utilities: "#a855f7",
    Entertainment: "#ec4899",
    Healthcare: "#ef4444",
    Shopping: "#14b8a6",
    Education: "#6366f1",
    Other: "#6b7280",
  };
  return colors[category] ?? "#6b7280";
}
