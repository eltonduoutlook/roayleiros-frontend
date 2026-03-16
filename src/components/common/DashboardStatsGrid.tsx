import { ReactNode } from "react";

type DashboardStatsGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
};

const columnsMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

export function DashboardStatsGrid({
  children,
  className = "",
  columns = 4,
}: DashboardStatsGridProps) {
  return (
    <div
      className={`grid gap-4 ${columnsMap[columns]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}