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
  colorVar: string; // css variable name
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

const STORAGE_KEY = "expenses.v1";

export const loadExpenses = (): Expense[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  } catch {
    return [];
  }
};

export const saveExpenses = (list: Expense[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
