import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORIES, formatCurrency, type Expense } from "@/lib/expenses";

interface Props {
  expenses: Expense[];
}

export function CategoryBreakdown({ expenses }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const { data, total } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) {
      totals.set(e.categoryId, (totals.get(e.categoryId) ?? 0) + e.amount);
    }
    const sum = expenses.reduce((s, e) => s + e.amount, 0);
    const rows = CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      colorVar: c.colorVar,
      value: totals.get(c.id) ?? 0,
    })).filter((r) => r.value > 0);
    return { data: rows, total: sum };
  }, [expenses]);

  if (data.length === 0) return null;

  const activeRow = data.find((d) => d.id === active) ?? null;
  const displayLabel = activeRow ? activeRow.label : "This month";
  const displayValue = activeRow ? activeRow.value : total;
  const displayPct = activeRow ? (activeRow.value / total) * 100 : 100;

  return (
    <section className="mt-2 mb-8 rounded-3xl bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Breakdown
        </div>
        {activeRow && (
          <div className="text-xs text-muted-foreground">
            {displayPct.toFixed(0)}%
          </div>
        )}
      </div>

      <div className="relative">
        <div className="h-52 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="none"
                onMouseEnter={(_, i) => setActive(data[i].id)}
                onMouseLeave={() => setActive(null)}
                onClick={(_, i) => setActive((cur) => (cur === data[i].id ? null : data[i].id))}
              >
                {data.map((d) => (
                  <Cell
                    key={d.id}
                    fill={`var(${d.colorVar})`}
                    opacity={active === null || active === d.id ? 1 : 0.35}
                    style={{ transition: "opacity 0.2s", cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
              <Tooltip content={() => null} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {displayLabel}
          </div>
          <div className="num font-semibold text-foreground text-2xl mt-1">
            {formatCurrency(displayValue)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((d) => {
            const pct = (d.value / total) * 100;
            const dim = active !== null && active !== d.id;
            return (
              <button
                key={d.id}
                onMouseEnter={() => setActive(d.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((cur) => (cur === d.id ? null : d.id))}
                className="flex items-center gap-2 text-left transition"
                style={{ opacity: dim ? 0.4 : 1 }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: `var(${d.colorVar})` }}
                />
                <span className="text-xs text-foreground/90 truncate flex-1">
                  {d.label}
                </span>
                <span className="text-xs text-muted-foreground num">
                  {pct.toFixed(0)}%
                </span>
              </button>
            );
          })}
      </div>
    </section>
  );
}
