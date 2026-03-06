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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Expense } from "../backend.d";
import { useAddExpense, useUpdateExpense } from "../hooks/useQueries";
import { EXPENSE_CATEGORIES } from "../lib/constants";

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  editExpense?: Expense | null;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ExpenseFormModal({
  open,
  onOpenChange,
  month,
  editExpense,
}: ExpenseFormModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Online");
  const [date, setDate] = useState(getTodayString());

  const addMutation = useAddExpense();
  const updateMutation = useUpdateExpense();
  const isPending = addMutation.isPending || updateMutation.isPending;
  const isEdit = !!editExpense;

  useEffect(() => {
    if (open) {
      if (editExpense) {
        setName(editExpense.name);
        setAmount(editExpense.amount.toString());
        setCategory(editExpense.category);
        setPaymentMode(editExpense.paymentMode as "Cash" | "Online");
        setDate(editExpense.date);
      } else {
        setName("");
        setAmount("");
        setCategory("");
        setPaymentMode("Online");
        setDate(getTodayString());
      }
    }
  }, [open, editExpense]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amtNum = Number.parseFloat(amount);
    if (!name.trim()) {
      toast.error("Please enter an expense name");
      return;
    }
    if (Number.isNaN(amtNum) || amtNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      if (isEdit && editExpense) {
        await updateMutation.mutateAsync({
          id: editExpense.id,
          month: editExpense.month,
          date,
          name: name.trim(),
          paymentMode,
          category,
          amount: amtNum,
        });
        toast.success("Expense updated!");
      } else {
        await addMutation.mutateAsync({
          name: name.trim(),
          amount: amtNum,
          category,
          paymentMode,
          date,
          month,
        });
        toast.success("Expense added!");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEdit ? "Failed to update expense" : "Failed to add expense",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="expense.add.modal"
        className="rounded-2xl max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            {isEdit ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="exp-name" className="text-sm font-medium">
              Name / Description
            </Label>
            <Input
              id="exp-name"
              data-ocid="expense.name.input"
              placeholder="e.g. Lunch at café"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-amount" className="text-sm font-medium">
              Amount (₹)
            </Label>
            <Input
              id="exp-amount"
              data-ocid="expense.amount.input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                data-ocid="expense.category.select"
                className="rounded-xl"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Payment Mode</Label>
            <div
              data-ocid="expense.payment_mode.toggle"
              className="flex rounded-xl border border-border overflow-hidden"
            >
              {(["Cash", "Online"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                    paymentMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "Cash" ? (
                    <Banknote className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="exp-date"
              data-ocid="expense.date.input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="expense.cancel_button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="expense.submit_button"
              disabled={isPending}
              className="rounded-xl"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Update" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
