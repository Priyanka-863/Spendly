import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, History } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { AppPage } from "../App";
import { PageHeader } from "../components/PageHeader";
import {
  useAllExpenses,
  useAllInvestments,
  useAllMonthsWithActivity,
} from "../hooks/useQueries";
import { formatCurrency, formatMonth } from "../lib/constants";

interface HistoryPageProps {
  onNavigate: (page: AppPage, month?: string) => void;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const { data: months, isLoading: monthsLoading } = useAllMonthsWithActivity();
  const { data: allExpenses, isLoading: expLoading } = useAllExpenses();
  const { data: allInvestments, isLoading: invLoading } = useAllInvestments();

  const isLoading = monthsLoading || expLoading || invLoading;

  const sortedMonths = useMemo(() => {
    if (!months) return [];
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [months]);

  const monthStats = useMemo(() => {
    const stats: Record<string, { spent: number; invested: number }> = {};
    for (const month of sortedMonths) {
      stats[month] = { spent: 0, invested: 0 };
    }
    for (const e of allExpenses ?? []) {
      if (stats[e.month]) {
        stats[e.month].spent += e.amount;
      }
    }
    for (const i of allInvestments ?? []) {
      if (stats[i.month]) {
        stats[i.month].invested += i.amount;
      }
    }
    return stats;
  }, [sortedMonths, allExpenses, allInvestments]);

  return (
    <>
      <PageHeader
        title="History"
        subtitle="Browse expenses from any past month"
      />

      <div className="px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : sortedMonths.length === 0 ? (
          <motion.div
            data-ocid="history.empty_state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No history yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Start logging expenses and investments to build your financial
              history.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedMonths.map((month, idx) => {
              const itemNum = idx + 1;
              const stats = monthStats[month] ?? { spent: 0, invested: 0 };
              const isCurrentMonth =
                month ===
                (() => {
                  const now = new Date();
                  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                })();

              return (
                <motion.button
                  key={month}
                  data-ocid={`history.month.item.${itemNum}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate("expenses", month)}
                  className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all duration-200 relative"
                >
                  {isCurrentMonth && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                      Current
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="font-display font-bold text-sm text-foreground mb-3">
                    {formatMonth(month)}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Spent
                      </span>
                      <span className="text-xs font-semibold text-red-500">
                        {formatCurrency(stats.spent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Invested
                      </span>
                      <span className="text-xs font-semibold text-green-600">
                        {formatCurrency(stats.invested)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <footer className="lg:hidden flex items-center justify-center py-4 border-t border-border mt-auto px-4">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </>
  );
}
