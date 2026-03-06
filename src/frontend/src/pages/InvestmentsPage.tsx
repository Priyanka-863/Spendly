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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Investment } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { MonthSelector } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import {
  useAddInvestment,
  useDeleteInvestment,
  useInvestmentsByMonth,
} from "../hooks/useQueries";
import {
  INVESTMENT_TYPES,
  formatCurrency,
  formatDate,
  getInvestmentColor,
} from "../lib/constants";

interface InvestmentsPageProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function InvestmentsPage({
  selectedMonth,
  onMonthChange,
}: InvestmentsPageProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: investments, isLoading } = useInvestmentsByMonth(selectedMonth);
  const deleteMutation = useDeleteInvestment();

  const totalAmount = investments?.reduce((acc, i) => acc + i.amount, 0) ?? 0;
  const sortedInvestments = [...(investments ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  async function handleDelete(investment: Investment) {
    if (!confirm("Delete this investment?")) return;
    setDeletingId(investment.id);
    try {
      await deleteMutation.mutateAsync({
        id: investment.id,
        month: investment.month,
      });
      toast.success("Investment deleted");
    } catch {
      toast.error("Failed to delete investment");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Investments"
        subtitle={
          investments
            ? `${investments.length} investments · ${formatCurrency(totalAmount)}`
            : ""
        }
        actions={
          <div className="flex items-center gap-2">
            <MonthSelector
              value={selectedMonth}
              onChange={onMonthChange}
              ocid="investment.month.select"
            />
            <Button
              data-ocid="investment.add.button"
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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : sortedInvestments.length === 0 ? (
          <motion.div
            data-ocid="investment.empty_state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No investments yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Start tracking your portfolio by logging your first investment.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Investment
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedInvestments.map((investment, idx) => {
              const itemNum = idx + 1;
              const color = getInvestmentColor(investment.investmentType);
              return (
                <AnimatePresence
                  key={investment.id.toString()}
                  mode="popLayout"
                >
                  <motion.div
                    data-ocid={`investment.item.${itemNum}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 group"
                  >
                    {/* Type icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${color}18`,
                      }}
                    >
                      <TrendingUp className="w-5 h-5" style={{ color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CategoryBadge
                          category={investment.investmentType}
                          type="investment"
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(investment.date)}
                        </span>
                      </div>
                      {investment.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {investment.notes}
                        </p>
                      )}
                    </div>

                    {/* Amount + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-sm text-foreground">
                        {formatCurrency(investment.amount)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-ocid={`investment.delete_button.${itemNum}`}
                          onClick={() => handleDelete(investment)}
                          disabled={deletingId === investment.id}
                          className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                        >
                          {deletingId === investment.id ? (
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
        )}
      </div>

      <AddInvestmentModal
        open={addOpen}
        onOpenChange={setAddOpen}
        month={selectedMonth}
      />
    </>
  );
}

function AddInvestmentModal({
  open,
  onOpenChange,
  month,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
}) {
  const [investmentType, setInvestmentType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState("");

  const addMutation = useAddInvestment();

  useEffect(() => {
    if (open) {
      setInvestmentType("");
      setAmount("");
      setDate(getTodayString());
      setNotes("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amtNum = Number.parseFloat(amount);
    if (!investmentType) {
      toast.error("Please select an investment type");
      return;
    }
    if (Number.isNaN(amtNum) || amtNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await addMutation.mutateAsync({
        investmentType,
        amount: amtNum,
        date,
        month,
        notes: notes.trim() || null,
      });
      toast.success("Investment added!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to add investment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="investment.add.modal"
        className="rounded-2xl max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            Add Investment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Investment Type</Label>
            <Select value={investmentType} onValueChange={setInvestmentType}>
              <SelectTrigger
                data-ocid="investment.type.select"
                className="rounded-xl"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-amount" className="text-sm font-medium">
              Amount (₹)
            </Label>
            <Input
              id="inv-amount"
              data-ocid="investment.amount.input"
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
            <Label htmlFor="inv-date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="inv-date"
              data-ocid="investment.date.input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="inv-notes"
              data-ocid="investment.notes.textarea"
              placeholder="e.g. DCA into index fund, bought at ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="investment.cancel_button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="investment.submit_button"
              disabled={addMutation.isPending}
              className="rounded-xl"
            >
              {addMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Investment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
