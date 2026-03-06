import { getCategoryColor, getInvestmentColor } from "../lib/constants";

interface CategoryBadgeProps {
  category: string;
  type?: "expense" | "investment";
  size?: "sm" | "md";
}

export function CategoryBadge({
  category,
  type = "expense",
  size = "sm",
}: CategoryBadgeProps) {
  const color =
    type === "expense"
      ? getCategoryColor(category)
      : getInvestmentColor(category);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {category}
    </span>
  );
}
