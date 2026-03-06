import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Banknote,
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Expense } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { ExpenseFormModal } from "../components/ExpenseFormModal";
import { MonthSelector } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { useDeleteExpense, useExpensesByMonth } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/constants";

interface ExpensesPageProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function ExpensesPage({
  selectedMonth,
  onMonthChange,
}: ExpensesPageProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: expenses, isLoading } = useExpensesByMonth(selectedMonth);
  const deleteMutation = useDeleteExpense();

  // Group expenses by date
  const grouped = groupByDate(expenses ?? []);
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const totalAmount = expenses?.reduce((acc, e) => acc + e.amount, 0) ?? 0;

  async function handleDelete(expense: Expense) {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(expense.id);
    try {
      await deleteMutation.mutateAsync({
        id: expense.id,
        month: expense.month,
      });
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  }

  // Create flat list for deterministic indices
  const flatExpenses = sortedDates.flatMap((date) => grouped[date]);

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={
          expenses
            ? `${expenses.length} expenses · ${formatCurrency(totalAmount)}`
            : ""
        }
        actions={
          <div className="flex items-center gap-2">
            <MonthSelector
              value={selectedMonth}
              onChange={onMonthChange}
              ocid="expense.month.select"
            />
            <Button
              data-ocid="expense.add.button"
              onClick={() => setAddOpen(true)}
              className="rounded-xl gap-1.5"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        }
      />

      <div className="px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : expenses?.length === 0 ? (
          <motion.div
            data-ocid="expense.empty_state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Banknote className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No expenses yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Start tracking your spending by adding your first expense for this
              month.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Expense
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dayExpenses = grouped[date];
              const dayTotal = dayExpenses.reduce(
                (acc, e) => acc + e.amount,
                0,
              );

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {formatDate(date)}
                    </h4>
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatCurrency(dayTotal)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayExpenses.map((expense) => {
                      const flatIdx = flatExpenses.findIndex(
                        (e) => e.id === expense.id,
                      );
                      const itemNum = flatIdx + 1;
                      return (
                        <AnimatePresence
                          key={expense.id.toString()}
                          mode="popLayout"
                        >
                          <motion.div
                            data-ocid={`expense.item.${itemNum}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 group"
                          >
                            {/* Payment mode icon */}
                            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              {expense.paymentMode === "Cash" ? (
                                <Banknote className="w-4 h-4 text-green-600" />
                              ) : (
                                <CreditCard className="w-4 h-4 text-blue-500" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {expense.name}
                                </span>
                                <CategoryBadge category={expense.category} />
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {expense.paymentMode}
                              </p>
                            </div>

                            {/* Amount + actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-semibold text-sm text-foreground">
                                {formatCurrency(expense.amount)}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-ocid={`expense.edit_button.${itemNum}`}
                                  onClick={() => setEditExpense(expense)}
                                  className="h-7 w-7 rounded-lg"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-ocid={`expense.delete_button.${itemNum}`}
                                  onClick={() => handleDelete(expense)}
                                  disabled={deletingId === expense.id}
                                  className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                                >
                                  {deletingId === expense.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      <ExpenseFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        month={selectedMonth}
      />

      {/* Edit modal */}
      <ExpenseFormModal
        open={!!editExpense}
        onOpenChange={(open) => !open && setEditExpense(null)}
        month={selectedMonth}
        editExpense={editExpense}
      />
    </>
  );
}

function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
  const grouped: Record<string, Expense[]> = {};
  for (const expense of expenses) {
    if (!grouped[expense.date]) {
      grouped[expense.date] = [];
    }
    grouped[expense.date].push(expense);
  }
  return grouped;
}
