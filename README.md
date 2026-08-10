# Girl Math

Build a personal expense tracker web app with a premium, minimal aesthetic — think Linear meets a modern fintech app (Cash App, Copilot Money). Not generic Material Design.

Design direction:

Dark mode by default, with a rich near-black background (not pure black) — something like deep charcoal or midnight navy

One confident accent color (e.g., a warm coral or electric lime) used sparingly — for the add button, active states, and the monthly total number

Generous whitespace, large type for numbers (the amount should feel like the hero of every screen), smaller/muted type for metadata (dates, categories)

Rounded corners, soft shadows, subtle depth — avoid flat/basic card layouts

Micro-interactions: smooth transitions when adding an expense, a satisfying tap animation on the add button, list items that gently slide/fade in

Custom category icons (not default icon-library look) — simple, consistent line-style icons in a soft rounded container with a faint tint of a category color

Core functionality:

Home screen: Large monthly total at top (e.g., "₹24,500 this month"), small trend indicator if possible, then a chronological list of expenses grouped by day with date headers

Add expense: A floating action button (bottom right) opens a fast-entry view — amount input (numeric keypad, large font), a horizontal scrollable row of category icons to tap, optional note field, defaults to today's date. Should be completable in 2 taps + amount entry.

Categories: Food, Transport, Shopping, Bills, Entertainment, Health, Other — each with a distinct icon and color

Edit/delete: Swipe left on any expense to reveal edit/delete actions

Data should persist (use local storage or Supabase if you set up backend)

Vibe: Feels expensive, calm, and fast — not cluttered, not playful/cartoonish. The kind of app where opening it to log a coffee purchase feels satisfying rather than like a chore.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://luxe-cents.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97fb5bab-c6b4-4df4-b567-a6331cf7f2fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
