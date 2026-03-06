import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InvestmentsPage } from "./pages/InvestmentsPage";
import { LoginPage } from "./pages/LoginPage";

export type AppPage =
  | "dashboard"
  | "expenses"
  | "investments"
  | "analytics"
  | "history";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const navigateTo = (page: AppPage, month?: string) => {
    setCurrentPage(page);
    if (month) setSelectedMonth(month);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onNavigate={navigateTo}
          />
        );
      case "expenses":
        return (
          <ExpensesPage
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        );
      case "investments":
        return (
          <InvestmentsPage
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        );
      case "analytics":
        return (
          <AnalyticsPage
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        );
      case "history":
        return <HistoryPage onNavigate={navigateTo} />;
      default:
        return null;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={navigateTo}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
