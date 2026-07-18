import { supabase } from "@/integrations/supabase/client";

export type CategoryId =
  | "bills"
  | "groceries"
  | "transport"
  | "fun"
  | "food"
  | "others";

export interface Expense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  note?: string;
  date: string; // ISO
  createdAt: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  colorVar: string;
}

export const CATEGORIES: Category[] = [
  { id: "bills", label: "Bills", colorVar: "--cat-bills" },
  { id: "groceries", label: "Groceries", colorVar: "--cat-groceries" },
  { id: "transport", label: "Transport", colorVar: "--cat-transport" },
  { id: "fun", label: "Fun", colorVar: "--cat-fun" },
  { id: "food", label: "Food", colorVar: "--cat-food" },
  { id: "others", label: "Others", colorVar: "--cat-others" },
];

export const getCategory = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[5];

const VALID = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

// Migrate legacy category strings from earlier versions.
const LEGACY: Record<string, CategoryId> = {
  shopping: "others",
  entertainment: "fun",
  health: "others",
  other: "others",
};

const toCategoryId = (raw: string): CategoryId => {
  if (VALID.has(raw as CategoryId)) return raw as CategoryId;
  return LEGACY[raw] ?? "others";
};

interface Row {
  id: string;
  amount: number | string;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

const rowToExpense = (r: Row): Expense => ({
  id: r.id,
  amount: typeof r.amount === "string" ? parseFloat(r.amount) : r.amount,
  categoryId: toCategoryId(r.category),
  note: r.note ?? undefined,
  date: r.date,
  createdAt: new Date(r.created_at).getTime(),
});

export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, category, note, date, created_at")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToExpense);
};

export const insertExpense = async (
  e: Omit<Expense, "id" | "createdAt">,
  userId: string,
): Promise<Expense> => {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      amount: e.amount,
      category: e.categoryId,
      note: e.note ?? null,
      date: e.date,
    })
    .select("id, amount, category, note, date, created_at")
    .single();
  if (error) throw error;
  return rowToExpense(data as Row);
};

export const updateExpense = async (e: Expense): Promise<Expense> => {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      amount: e.amount,
      category: e.categoryId,
      note: e.note ?? null,
      date: e.date,
    })
    .eq("id", e.id)
    .select("id, amount, category, note, date, created_at")
    .single();
  if (error) throw error;
  return rowToExpense(data as Row);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatCurrencyDetailed = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
