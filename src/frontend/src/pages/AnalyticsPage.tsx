import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, DollarSign, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthSelector } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import {
  useAllExpenses,
  useAllInvestments,
  useExpensesByMonth,
  useInvestmentsByMonth,
} from "../hooks/useQueries";
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  getCategoryColor,
  getInvestmentColor,
  getLast6Months,
  getShortMonth,
} from "../lib/constants";

interface AnalyticsPageProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}

function CustomTooltipContent({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-lg p-3 text-xs">
      {label && <p className="font-semibold text-foreground mb-2">{label}</p>}
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage({
  selectedMonth,
  onMonthChange,
}: AnalyticsPageProps) {
  const { data: expenses, isLoading: expLoading } =
    useExpensesByMonth(selectedMonth);
  const { data: investments, isLoading: invLoading } =
    useInvestmentsByMonth(selectedMonth);
  const { data: allExpenses, isLoading: allExpLoading } = useAllExpenses();
  const { data: allInvestments, isLoading: allInvLoading } =
    useAllInvestments();

  const isLoading = expLoading || invLoading;
  const isAllLoading = allExpLoading || allInvLoading;

  const totalSpent = expenses?.reduce((acc, e) => acc + e.amount, 0) ?? 0;
  const totalInvested = investments?.reduce((acc, i) => acc + i.amount, 0) ?? 0;
  const netChange = totalInvested - totalSpent;

  // Category breakdown
  const categoryData = useMemo(() => {
    if (!expenses?.length) return [];
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: getCategoryColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Cash vs Online
  const paymentData = useMemo(() => {
    if (!expenses?.length) return [];
    let cash = 0;
    let online = 0;
    for (const e of expenses) {
      if (e.paymentMode === "Cash") cash += e.amount;
      else online += e.amount;
    }
    return [
      { name: "Cash", value: cash, color: "#22c55e" },
      { name: "Online", value: online, color: "#3b82f6" },
    ].filter((d) => d.value > 0);
  }, [expenses]);

  // Monthly trends
  const last6 = getLast6Months();
  const trendData = useMemo(() => {
    if (!allExpenses || !allInvestments) return [];
    return last6.map((month) => {
      const monthExp = allExpenses.filter((e) => e.month === month);
      const monthInv = allInvestments.filter((i) => i.month === month);
      return {
        month: getShortMonth(month),
        Expenses: Number.parseFloat(
          monthExp.reduce((acc, e) => acc + e.amount, 0).toFixed(2),
        ),
        Investments: Number.parseFloat(
          monthInv.reduce((acc, i) => acc + i.amount, 0).toFixed(2),
        ),
      };
    });
  }, [allExpenses, allInvestments, last6]);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Visualize your financial patterns"
        actions={
          <MonthSelector
            value={selectedMonth}
            onChange={onMonthChange}
            ocid="analytics.month.select"
          />
        }
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
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
            title="Net Change"
            value={netChange}
            icon={ArrowUpRight}
            iconColor={netChange >= 0 ? "text-green-600" : "text-red-500"}
            loading={isLoading}
            variant={netChange >= 0 ? "success" : "danger"}
            index={2}
          />
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Category breakdown */}
          <ChartCard title="Spending by Category" loading={isLoading}>
            {categoryData.length === 0 ? (
              <EmptyChart message="No expenses this month" />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {totalSpent > 0
                          ? `${((item.value / totalSpent) * 100).toFixed(0)}%`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          {/* Cash vs Online */}
          <ChartCard title="Cash vs Online" loading={isLoading}>
            {paymentData.length === 0 ? (
              <EmptyChart message="No expenses this month" />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 w-full">
                  {paymentData.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(item.value)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {totalSpent > 0
                              ? `${((item.value / totalSpent) * 100).toFixed(0)}%`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${totalSpent > 0 ? (item.value / totalSpent) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          {/* Monthly spending trend */}
          <ChartCard title="Monthly Spending Trend" loading={isAllLoading} wide>
            {trendData.every((d) => d.Expenses === 0) ? (
              <EmptyChart message="No expense data available" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={trendData}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.02 160)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.04 160)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.04 160)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Bar
                    dataKey="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Investment vs Expense comparison */}
          <ChartCard
            title="Investments vs Expenses (6 Months)"
            loading={isAllLoading}
            wide
          >
            {trendData.every((d) => d.Expenses === 0 && d.Investments === 0) ? (
              <EmptyChart message="No data available" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={trendData}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.02 160)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.04 160)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.04 160)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar
                    dataKey="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Investments"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </>
  );
}

function ChartCard({
  title,
  children,
  loading,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border p-5 ${wide ? "lg:col-span-1" : ""}`}
    >
      <h3 className="font-semibold text-sm text-foreground mb-4">{title}</h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
      {message}
    </div>
  );
}
