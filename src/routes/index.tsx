import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  loadExpenses,
  saveExpenses,
  type Expense,
} from "@/lib/expenses";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { ExpenseRow } from "@/components/ExpenseRow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledger — A calmer expense tracker" },
      {
        name: "description",
        content:
          "Log expenses in seconds. A minimal, premium personal expense tracker with a focused dark aesthetic.",
      },
      { property: "og:title", content: "Ledger — A calmer expense tracker" },
      {
        property: "og:description",
        content:
          "Log expenses in seconds. A minimal, premium personal expense tracker.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function groupByDay(list: Expense[]) {
  const byDay = new Map<string, Expense[]>();
  for (const e of list) {
    const key = e.date.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(e);
    byDay.set(key, arr);
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({
      day,
      items: items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }));
}

function dayLabel(day: string) {
  const d = new Date(day + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveExpenses(expenses);
  }, [expenses, mounted]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthly = useMemo(() => {
    let curr = 0;
    let prev = 0;
    for (const e of expenses) {
      const d = new Date(e.date);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) curr += e.amount;
      else {
        const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        if (d.getFullYear() === prevYear && d.getMonth() === prevMonth)
          prev += e.amount;
      }
    }
    const change = prev === 0 ? null : ((curr - prev) / prev) * 100;
    return { curr, prev, change };
  }, [expenses, thisMonth, thisYear]);

  const grouped = useMemo(() => groupByDay(expenses), [expenses]);

  const save = (e: Expense) => {
    setExpenses((list) => {
      const idx = list.findIndex((x) => x.id === e.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = e;
        return copy;
      }
      return [e, ...list];
    });
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    setExpenses((list) => list.filter((e) => e.id !== id));
  };

  const monthLabel = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-5 pt-10 pb-32">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-wide text-muted-foreground">
              Ledger
            </div>
            <div className="text-xs text-muted-foreground">{monthLabel}</div>
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
              This month
            </div>
            <div
              className="mt-2 num font-semibold text-primary"
              style={{
                fontSize: "clamp(2.75rem, 11vw, 4rem)",
                lineHeight: 1.05,
              }}
            >
              {formatCurrency(monthly.curr)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              {monthly.change === null ? (
                <span>No comparison yet</span>
              ) : (
                <>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      monthly.change <= 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {monthly.change <= 0 ? (
                      <TrendingDown size={12} />
                    ) : (
                      <TrendingUp size={12} />
                    )}
                    {Math.abs(monthly.change).toFixed(0)}%
                  </span>
                  <span>vs last month · {formatCurrency(monthly.prev)}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* List */}
        {grouped.length === 0 ? (
          <div className="mt-24 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <Plus className="text-muted-foreground" size={22} />
            </div>
            <div className="text-sm text-foreground">Nothing logged yet</div>
            <div className="text-xs text-muted-foreground mt-1">
              Tap the button to add your first expense.
            </div>
          </div>
        ) : (
          <div className="space-y-7">
            {grouped.map(({ day, items }) => {
              const total = items.reduce((s, e) => s + e.amount, 0);
              return (
                <section key={day}>
                  <div className="flex items-baseline justify-between mb-2 px-1">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {dayLabel(day)}
                    </div>
                    <div className="text-xs text-muted-foreground num">
                      {formatCurrency(total)}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((e) => (
                      <ExpenseRow
                        key={e.id}
                        expense={e}
                        onEdit={(x) => {
                          setEditing(x);
                          setOpen(true);
                        }}
                        onDelete={remove}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        aria-label="Add expense"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-1/2 translate-x-[min(50vw-1.5rem-28px,208px)] md:right-8 md:translate-x-0 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all active:scale-90 hover:scale-105 animate-pop"
        style={{ boxShadow: "var(--shadow-accent)" }}
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>

      <AddExpenseSheet
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSave={save}
        editing={editing}
      />
    </div>
  );
}
