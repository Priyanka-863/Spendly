import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { formatCurrency } from "../lib/constants";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
  suffix?: string;
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  index?: number;
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-primary/10 border-primary/20",
  success:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  warning:
    "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
  danger: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
};

const variantIconBg = {
  default: "bg-muted",
  primary: "bg-primary/20",
  success: "bg-green-100 dark:bg-green-900/40",
  warning: "bg-amber-100 dark:bg-amber-900/40",
  danger: "bg-red-100 dark:bg-red-900/40",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  loading = false,
  suffix = "",
  description,
  variant = "default",
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={cn(
        "relative rounded-2xl border p-5 card-shine overflow-hidden",
        variantStyles[variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-7 w-28 mb-1" />
          ) : (
            <p className="font-display font-bold text-2xl text-foreground truncate">
              {typeof value === "number" ? formatCurrency(value) : value}
              {suffix && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {suffix}
                </span>
              )}
            </p>
          )}
          {description && !loading && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            variantIconBg[variant],
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
