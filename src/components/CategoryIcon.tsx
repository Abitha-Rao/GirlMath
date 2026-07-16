import type { CategoryId } from "@/lib/expenses";
import {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Receipt,
  Music,
  HeartPulse,
  Sparkles,
} from "lucide-react";

const MAP = {
  food: UtensilsCrossed,
  transport: Bus,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Music,
  health: HeartPulse,
  other: Sparkles,
} as const;

interface Props {
  id: CategoryId;
  size?: "sm" | "md" | "lg";
  colorVar: string;
}

const SIZE = {
  sm: { box: "h-9 w-9", icon: 16, radius: "rounded-xl" },
  md: { box: "h-11 w-11", icon: 20, radius: "rounded-2xl" },
  lg: { box: "h-14 w-14", icon: 24, radius: "rounded-2xl" },
};

export function CategoryIcon({ id, size = "md", colorVar }: Props) {
  const Icon = MAP[id];
  const s = SIZE[size];
  return (
    <div
      className={`${s.box} ${s.radius} flex items-center justify-center shrink-0 transition-transform`}
      style={{
        backgroundColor: `color-mix(in oklab, var(${colorVar}) 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, var(${colorVar}) 22%, transparent)`,
      }}
    >
      <Icon
        size={s.icon}
        strokeWidth={1.75}
        style={{ color: `var(${colorVar})` }}
      />
    </div>
  );
}
