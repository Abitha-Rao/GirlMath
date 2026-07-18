import { useRef, useState } from "react";
import type { Expense } from "@/lib/expenses";
import { formatCurrencyDetailed, getCategory } from "@/lib/expenses";
import { CategoryIcon } from "./CategoryIcon";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  expense: Expense;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

const MAX = 160;

export function ExpenseRow({ expense, onEdit, onDelete }: Props) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startOffset = useRef(0);
  const moved = useRef(0);
  const cat = getCategory(expense.categoryId);

  const onStart = (x: number) => {
    startX.current = x;
    startOffset.current = offset;
    moved.current = 0;
  };
  const onMove = (x: number) => {
    if (startX.current === null) return;
    const dx = x - startX.current;
    moved.current = Math.max(moved.current, Math.abs(dx));
    const next = Math.min(0, Math.max(-MAX, startOffset.current + dx));
    setOffset(next);
  };
  const onEnd = () => {
    const wasTap = moved.current < 6;
    startX.current = null;
    setOffset((o) => (o < -MAX / 2 ? -MAX : 0));
    if (wasTap && offset === 0) {
      onEdit(expense);
    }
  };

  const time = new Date(expense.date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl animate-item-in">
      {/* Action layer */}
      <div className="absolute inset-y-0 right-0 flex items-stretch gap-1.5 pr-1.5 py-1.5">
        <button
          onClick={() => {
            setOffset(0);
            onEdit(expense);
          }}
          className="w-16 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-foreground/80 transition"
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="w-16 rounded-xl bg-destructive/90 hover:bg-destructive flex items-center justify-center text-destructive-foreground transition"
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Row */}
      <div
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => e.buttons === 1 && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onDoubleClick={() => setOffset(offset === 0 ? -MAX : 0)}
        className="relative flex items-center gap-3.5 py-2.5 px-2.5 rounded-2xl bg-surface hover:bg-surface-elevated transition-colors select-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${offset}px)`,
          transition:
            startX.current === null ? "transform 0.3s cubic-bezier(0.22,1,0.36,1)" : "none",
        }}
      >
        <CategoryIcon id={cat.id} colorVar={cat.colorVar} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium truncate">
            {expense.note || cat.label}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {cat.label} · {time}
          </div>
        </div>
        <div className="text-[15px] font-semibold num">
          {formatCurrencyDetailed(expense.amount)}
        </div>
      </div>
    </div>
  );
}
