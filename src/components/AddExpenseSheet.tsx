import { useEffect, useRef, useState } from "react";
import { CATEGORIES, type CategoryId, type Expense } from "@/lib/expenses";
import { CategoryIcon } from "./CategoryIcon";
import { X, Delete } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (e: Expense) => void;
  editing?: Expense | null;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function AddExpenseSheet({ open, onClose, onSave, editing }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (editing) {
        setAmount(String(editing.amount));
        setCategory(editing.categoryId);
        setNote(editing.note ?? "");
        setDate(editing.date.slice(0, 10));
      } else {
        setAmount("");
        setCategory("food");
        setNote("");
        setDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [open, editing]);

  if (!open) return null;

  const press = (k: string) => {
    if (k === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (k === "." && amount.includes(".")) return;
    if (amount.replace(".", "").length >= 9) return;
    setAmount((a) => (a === "0" && k !== "." ? k : a + k));
  };

  const numeric = parseFloat(amount || "0");
  const canSave = numeric > 0;

  const submit = () => {
    if (!canSave) return;
    const now = new Date();
    const iso = new Date(date + "T" + now.toTimeString().slice(0, 8)).toISOString();
    onSave({
      id: editing?.id ?? crypto.randomUUID(),
      amount: Math.round(numeric * 100) / 100,
      categoryId: category,
      note: note.trim() || undefined,
      date: iso,
      createdAt: editing?.createdAt ?? Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-surface rounded-t-3xl md:rounded-3xl md:mb-6 shadow-lift animate-sheet overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="text-sm text-muted-foreground tracking-wide">
            {editing ? "Edit expense" : "New expense"}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount */}
        <div className="px-6 pt-4 pb-6 text-center">
          <div className="text-5xl md:text-6xl font-semibold num text-foreground min-h-[64px]">
            <span className="text-muted-foreground mr-1 text-3xl align-top">₹</span>
            {amount || "0"}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="mt-4 w-full bg-transparent text-center text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto px-6 pb-5 no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-1.5 shrink-0 transition ${
                  active ? "scale-105" : "opacity-60 hover:opacity-100"
                }`}
              >
                <div
                  className="rounded-2xl transition"
                  style={{
                    boxShadow: active
                      ? `0 0 0 2px var(${c.colorVar})`
                      : undefined,
                  }}
                >
                  <CategoryIcon id={c.id} colorVar={c.colorVar} />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
            <span className="text-sm text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-foreground focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Keypad */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-1.5">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "back" ? "Delete last digit" : `Digit ${k}`}
              className="h-14 rounded-2xl text-xl font-medium num text-foreground hover:bg-white/[0.05] active:scale-[0.97] active:bg-white/[0.08] transition-all"
            >
              {k === "back" ? (
                <Delete size={20} className="mx-auto text-muted-foreground" />
              ) : (
                k
              )}
            </button>
          ))}
        </div>

        <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <button
            onClick={submit}
            disabled={!canSave}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: canSave ? "var(--shadow-accent)" : undefined }}
          >
            {editing ? "Save changes" : "Add expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
