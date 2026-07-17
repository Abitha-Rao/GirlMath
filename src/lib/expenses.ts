import { supabase } from "@/integrations/supabase/client";

export type CategoryId =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "other";

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
  { id: "food", label: "Food", colorVar: "--cat-food" },
  { id: "transport", label: "Transport", colorVar: "--cat-transport" },
  { id: "shopping", label: "Shopping", colorVar: "--cat-shopping" },
  { id: "bills", label: "Bills", colorVar: "--cat-bills" },
  { id: "entertainment", label: "Fun", colorVar: "--cat-entertainment" },
  { id: "health", label: "Health", colorVar: "--cat-health" },
  { id: "other", label: "Other", colorVar: "--cat-other" },
];

export const getCategory = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[6];

const VALID = new Set<CategoryId>(CATEGORIES.map((c) => c.id));
const toCategoryId = (raw: string): CategoryId =>
  (VALID.has(raw as CategoryId) ? (raw as CategoryId) : "other");

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
