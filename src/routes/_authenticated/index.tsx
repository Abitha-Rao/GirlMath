import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, TrendingDown, TrendingUp, LogOut, User, WifiOff } from "lucide-react";
import { useOnline } from "@/lib/use-online";
import { toast } from "sonner";
import {
  formatCurrency,
  fetchExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
  type Expense,
} from "@/lib/expenses";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { ExpenseRow } from "@/components/ExpenseRow";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/")({
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
  const { user } = Route.useRouteContext();
  const online = useOnline();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses()
      .then(setExpenses)
      .catch((e) => toast.error(e.message ?? "Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

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

  const save = async (e: Expense) => {
    try {
      const existing = expenses.find((x) => x.id === e.id);
      if (existing) {
        const updated = await updateExpense(e);
        setExpenses((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await insertExpense(
          {
            amount: e.amount,
            categoryId: e.categoryId,
            note: e.note,
            date: e.date,
          },
          user.id,
        );
        setExpenses((list) => [created, ...list]);
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message ?? "Save failed");
    }
  };

  const remove = async (id: string) => {
    const prev = expenses;
    setExpenses((list) => list.filter((e) => e.id !== id));
    try {
      await deleteExpense(id);
    } catch (err) {
      setExpenses(prev);
      toast.error((err as Error).message ?? "Delete failed");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const monthLabel = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!online && (
        <div className="sticky top-0 z-40 bg-destructive/15 border-b border-destructive/25 text-destructive-foreground text-xs px-4 py-2 flex items-center justify-center gap-2 backdrop-blur">
          <WifiOff size={13} /> You're offline — changes can't be saved right now.
        </div>
      )}
      <div className="mx-auto max-w-md px-5 pt-10 pb-32">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-wide text-muted-foreground">Ledger</div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">{monthLabel}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-foreground/80 transition"
                  >
                    <User size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  <DropdownMenuLabel className="truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut size={14} className="mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
              This month
            </div>
            <div
              className="mt-2 num font-semibold text-primary"
              style={{ fontSize: "clamp(2.75rem, 11vw, 4rem)", lineHeight: 1.05 }}
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

        {loading ? (
          <div className="mt-24 text-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : grouped.length === 0 ? (
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
