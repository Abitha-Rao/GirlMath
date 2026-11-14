# girlMath: a personal expense tracker

A small web app for logging what you spend and seeing where the month's money went. It is dark, minimal and built for a phone: open it, tap the add button, type an amount, pick a category, done. Amounts are shown in Indian rupees (₹).

**Try it:** https://luxe-cents.lovable.app (sign in with Google, or create an account with an email and password)

## Who it is for

One person tracking their own day-to-day spending by hand, who wants something quicker and calmer than a spreadsheet. It is not a budgeting tool and does not connect to a bank.

## What it does

- **Monthly total up top.** The home screen shows what you have spent this month, with a percentage change against last month once last month has data.
- **Category breakdown.** A ring chart splits this month's spending across six fixed categories: Bills, Groceries, Transport, Fun, Food and Others.
- **Expenses by day.** Every expense is listed under its date, newest first.
- **Fast entry.** The add button opens a sheet with an amount, a row of category icons, an optional note and a date that defaults to today.
- **Edit and delete.** Tap an expense to change it, or delete it.
- **Private accounts.** Each person signs in and sees only their own expenses.
- **Installable on a phone.** From the live site, use your browser's "Add to Home Screen" to get an app icon. If you lose your connection the app tells you, and changes cannot be saved until you are back online.

## What you need

- [Node.js](https://nodejs.org) with npm. I checked the commands below with Node 26; the repo does not pin a version.
- A [Supabase](https://supabase.com) project. Supabase is the hosted service that stores the accounts and the expenses. The app reads three settings to find it: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PROJECT_ID`.

The repo's `.env` file already holds these settings for the project behind the live app, so a local copy talks to that same database. The key in it is the "publishable" kind, which is meant to be visible in a web app; what protects each person's data is the per-user access rule described under Privacy. To use your own database instead, create a Supabase project, apply the file in [supabase/migrations](supabase/migrations), and put your own project's values in `.env`.

## Run it on your computer

```bash
git clone https://github.com/Abitha-Rao/GirlMath.git
```

```bash
cd GirlMath
```

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:8080.

I checked that the app installs, builds and starts this way. I did not check signing in from a local copy. Google sign-in goes through Lovable's hosted sign-in service and may only work on the live site; email and password goes straight to Supabase.

## Privacy

- The one data table, `expenses`, has row-level security turned on. In plain terms, the database itself checks who is asking and only lets a signed-in person read, add, change or delete their own rows.
- The rule is defined in [supabase/migrations](supabase/migrations). It has not been independently security-tested.

## Where things are

| File | What it holds |
| --- | --- |
| [src/routes/_authenticated/index.tsx](src/routes/_authenticated/index.tsx) | The home screen: monthly total, breakdown, expense list |
| [src/routes/auth.tsx](src/routes/auth.tsx) | The sign-in and sign-up screen |
| [src/components/AddExpenseSheet.tsx](src/components/AddExpenseSheet.tsx) | The add and edit sheet |
| [src/components/CategoryBreakdown.tsx](src/components/CategoryBreakdown.tsx) | The category chart |
| [src/lib/expenses.ts](src/lib/expenses.ts) | The categories, and reading and saving expenses |
| [supabase/migrations](supabase/migrations) | The database table and its access rule |

## Status and limits

- A working personal project built with [Lovable](https://lovable.dev), an AI app builder, on React, TanStack Start and Supabase.
- Rupees only. The currency is fixed in the code.
- The six categories are fixed; you cannot add your own.
- No budgets, no recurring expenses, no export, no bank or UPI import. Every expense is typed in by hand.
- The breakdown covers the current month only. Older expenses appear in the list but there is no month-by-month view.
- Nothing can be saved while offline.
- There are no automated tests.
- `AGENTS.md` is a note for AI coding tools. Its one rule matters to people too: this repo syncs with Lovable, so do not rewrite history that is already pushed (no force-push, rebase or amend).
