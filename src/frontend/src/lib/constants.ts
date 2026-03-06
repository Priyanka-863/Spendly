export const EXPENSE_CATEGORIES = [
  { value: "Food", label: "Food", color: "#f97316" },
  { value: "Transport", label: "Transport", color: "#3b82f6" },
  { value: "Utilities", label: "Utilities", color: "#a855f7" },
  { value: "Entertainment", label: "Entertainment", color: "#ec4899" },
  { value: "Healthcare", label: "Healthcare", color: "#ef4444" },
  { value: "Shopping", label: "Shopping", color: "#14b8a6" },
  { value: "Education", label: "Education", color: "#6366f1" },
  { value: "Other", label: "Other", color: "#6b7280" },
] as const;

export const INVESTMENT_TYPES = [
  { value: "Stocks", label: "Stocks", color: "#22c55e" },
  { value: "Mutual Funds", label: "Mutual Funds", color: "#3b82f6" },
  { value: "Crypto", label: "Crypto", color: "#eab308" },
  { value: "Real Estate", label: "Real Estate", color: "#f97316" },
  { value: "Bonds", label: "Bonds", color: "#14b8a6" },
  { value: "Other", label: "Other", color: "#6b7280" },
] as const;

export const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "Online", label: "Online" },
] as const;

export function getCategoryColor(category: string): string {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return cat?.color ?? "#6b7280";
}

export function getInvestmentColor(type: string): string {
  const inv = INVESTMENT_TYPES.find((i) => i.value === type);
  return inv?.color ?? "#6b7280";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthOptions(
  count = 12,
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatMonth(value) });
  }
  return options;
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

export function getShortMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}
