import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  History,
  LayoutDashboard,
  LogOut,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { AppPage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LayoutProps {
  children: ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems = [
  {
    id: "dashboard" as AppPage,
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    id: "expenses" as AppPage,
    label: "Expenses",
    icon: Receipt,
    ocid: "nav.expenses.link",
  },
  {
    id: "investments" as AppPage,
    label: "Investments",
    icon: TrendingUp,
    ocid: "nav.investments.link",
  },
  {
    id: "analytics" as AppPage,
    label: "Analytics",
    icon: BarChart3,
    ocid: "nav.analytics.link",
  },
  {
    id: "history" as AppPage,
    label: "History",
    icon: History,
    ocid: "nav.history.link",
  },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { clear } = useInternetIdentity();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-64 sidebar-gradient dot-grid-bg fixed inset-y-0 left-0 z-30">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-sidebar-foreground">
              Spendly
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={item.ocid}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-6 border-t border-sidebar-border pt-4">
            <button
              type="button"
              onClick={clear}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {children}
          </motion.div>

          {/* Footer */}
          <footer className="hidden lg:flex items-center justify-center py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
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
        </main>

        {/* Bottom nav — mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 flex">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  ocid?: string;
}

export function MonthSelector({ value, onChange, ocid }: MonthSelectorProps) {
  const options = getMonthOptions(24);

  return (
    <select
      data-ocid={ocid}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function getMonthOptions(count: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }
  return options;
}
