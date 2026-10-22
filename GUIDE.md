# Step-by-Step Build Guide – Call Analytics Dashboard

This guide explains **how the project was set up, what every file does, and which skills you use** at each step. Follow it in order and you can rebuild the whole project from an empty folder.

---

## 0. Skills used in this project

| Skill | Where it is used |
|-------|------------------|
| **JavaScript (ES6+)** – arrow functions, destructuring, spread, `map/filter/reduce`, `Map`, `async/await` | `lib/analytics.js`, `lib/api.js` |
| **Consuming REST APIs** – `fetch`, status checks, JSON, `AbortController` | `lib/api.js`, `hooks/useCallData.js` |
| **Data transformation** – cleaning types, grouping, aggregating, sorting | `lib/api.js` (normalise), `lib/analytics.js` |
| **React** – components, props, `useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks, conditional rendering, lists & keys | every `.jsx` file |
| **Tailwind CSS** – utility classes, responsive grid (`sm: lg:`), dark mode, CSS variables | all components, `index.css` |
| **shadcn/ui** – copy-in component library, `cn()` helper, variants with `cva` | `components/ui/*` |
| **Data visualisation (Recharts)** – Bar, Line, Pie, tooltips, axes | `components/dashboard/*` |
| **UX states** – loading skeletons, error + retry, empty search results | `App.jsx`, `DashboardSkeleton.jsx`, `CallLogsTable.jsx` |
| **Tooling** – npm, Vite, path aliases, Git, GitHub, Vercel | config files, deployment |

---

## Step 1 – Create the Vite + React project

```bash
npm create vite@latest cdr-dashboard -- --template react
cd cdr-dashboard
npm install
```

Vite gives you a dev server with instant hot reload and a fast production build.
Delete the demo files you don't need: `src/App.css`, `src/assets/react.svg`.

## Step 2 – Install the libraries

```bash
# Tailwind CSS v4 (+ the Vite plugin) and shadcn's animation helpers
npm install -D tailwindcss @tailwindcss/vite tw-animate-css

# Charts, icons and helpers used by shadcn components
npm install recharts lucide-react clsx tailwind-merge class-variance-authority
```

| Package | Why |
|---------|-----|
| `tailwindcss`, `@tailwindcss/vite` | Tailwind v4 is configured via a Vite plugin – no `tailwind.config.js` needed |
| `recharts` | React chart components |
| `lucide-react` | Icons (shadcn's default icon set) |
| `clsx` + `tailwind-merge` | Combine class names and resolve Tailwind conflicts (`cn()` helper) |
| `class-variance-authority` | Define component *variants* (e.g. `Badge variant="success"`) |

## Step 3 – Configure Vite and the `@` path alias

**`vite.config.js`** – registers React + Tailwind plugins and makes `@/` mean `src/`:

```js
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

**`jsconfig.json`** – tells VS Code about the same alias so auto-import and Ctrl+click work:

```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```

Now you can write `import { Card } from "@/components/ui/card"` instead of `../../components/ui/card`.

## Step 4 – Set up shadcn/ui

shadcn/ui is **not an npm package** – it copies component source code into your project so you own and can edit it.

```bash
npx shadcn@latest init          # creates components.json, lib/utils.js, theme CSS
npx shadcn@latest add card table badge button input skeleton
```

- **`components.json`** – shadcn's settings (JS not TS, where to put components, CSS file, aliases).
- **`src/lib/utils.js`** – the `cn()` helper every component uses:

```js
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

- **`src/components/ui/*.jsx`** – the generated components (Card, Table, Badge, Button, Input, Skeleton). They are plain React + Tailwind. `badge.jsx` was extended with `success` and `destructive` variants for call status.

## Step 5 – Theme in `src/index.css`

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
```

1. `:root { --background: …; --primary: …; --chart-1: … }` – light theme colours as CSS variables.
2. `.dark { … }` – same variable names, dark values. Toggling the `dark` class on `<html>` switches the theme.
3. `@theme inline { --color-card: var(--card); … }` – exposes the variables to Tailwind, which is why classes like `bg-card`, `text-muted-foreground`, `text-chart-3` work.
4. Charts use the same variables (`fill="var(--chart-2)"`) so they also follow dark mode.

## Step 6 – Fetch and clean the API data (`src/lib/api.js`)

The raw API record has awkward types: `callCost` is a **string** (`"140.38"`), booleans mean inbound/successful, dates are strings. We convert them **once** so the rest of the app is simple:

```js
export async function fetchCalls(signal) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  const raw = await res.json();
  return raw.map(normalizeCall);
}

export function normalizeCall(c) {
  return {
    id: String(c.id),
    callerName: c.callerName ?? "Unknown",
    city: c.city ?? "Unknown",
    isInbound: toBool(c.callDirection),     // true = inbound
    isSuccessful: toBool(c.callStatus),     // true = successful
    duration: Number(c.callDuration) || 0,  // seconds
    cost: Number.parseFloat(c.callCost) || 0,
    startTime: new Date(c.callStartTime),
    endTime: new Date(c.callEndTime),
    // …caller/receiver numbers
  };
}
```

`API_URL` reads `import.meta.env.VITE_API_URL` first, so you can switch APIs with a `.env` file without touching code.

## Step 7 – A custom hook for loading state (`src/hooks/useCallData.js`)

Keeps all fetching logic out of the UI. Returns `{ calls, loading, error, refetch, lastUpdated }`.

```js
useEffect(() => {
  const controller = new AbortController();
  setLoading(true); setError(null);
  fetchCalls(controller.signal)
    .then((data) => { setCalls(data); setLastUpdated(new Date()); })
    .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
    .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  return () => controller.abort();          // cleanup on unmount / refetch
}, [reloadKey]);

const refetch = useCallback(() => setReloadKey((k) => k + 1), []);
```

**Why `reloadKey`?** Changing it re-runs the effect → that's how the Refresh button works.

## Step 8 – Turn records into analytics (`src/lib/analytics.js`)

Pure functions (input array → output) – no React, easy to test.

| Function | Produces | Used by |
|----------|----------|---------|
| `getKpis(calls)` | total calls, total/avg cost, avg duration, success/fail counts, success rate | KPI cards (5.1) |
| `getDurationStats(calls)` | longest, shortest, average call | Duration tiles (5.2) |
| `getDurationBuckets(calls)` | `[{ range: "0–10s", calls: 14 }, …]` | Duration bar chart (5.2) |
| `getCityStats(calls)` | `[{ city, calls, totalCost, avgCost }]` sorted | Cost chart (5.3), City pie (5.5) |
| `topNWithOther(items, 5)` | top 5 + "Other" slice | City pie (5.5) |
| `getCallsPerDay(calls)` | `[{ date, calls, successful, failed }]` | Timeline (5.4) |
| `getCallsPerHour(calls)` | 24 entries `{ hour: "09:00", calls }` | Timeline (5.4) |

Key pattern – **group with a `Map`, then convert to an array**:

```js
export function getCityStats(calls) {
  const map = new Map();
  for (const c of calls) {
    const entry = map.get(c.city) ?? { city: c.city, calls: 0, totalCost: 0 };
    entry.calls += 1;
    entry.totalCost += c.cost;
    map.set(c.city, entry);
  }
  return [...map.values()]
    .map((e) => ({ ...e, avgCost: e.totalCost / e.calls }))
    .sort((a, b) => b.calls - a.calls);
}
```

KPI example – `reduce` for sums, `filter` for counts:

```js
const totalCost = calls.reduce((t, c) => t + c.cost, 0);
const successfulCalls = calls.filter((c) => c.isSuccessful).length;
```

## Step 9 – Formatting helpers (`src/lib/format.js`)

`Intl.NumberFormat` for `$4,321.00` and `$4.3K`; `formatDuration(95)` → `"1m 35s"`; `formatDateTime(date)` → `"12 Mar 2026, 00:43"`.

## Step 10 – Build each dashboard section (`src/components/dashboard/`)

| File | Assignment section | What to look at |
|------|--------------------|-----------------|
| `Header.jsx` | – | Sticky header, Refresh button (spinning icon while loading), dark-mode toggle |
| `KpiCards.jsx` | **5.1** | An array of card configs → `.map()` renders 5 shadcn `Card`s; responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` |
| `DurationAnalytics.jsx` | **5.2** | 3 stat tiles + `<BarChart>` of duration buckets |
| `CostAnalytics.jsx` | **5.3** | Horizontal `<BarChart layout="vertical">` of cost by city + avg cost tile |
| `ActivityTimeline.jsx` | **5.4** | `useState("day")` toggle switches between per-day and per-hour `<LineChart>` |
| `CallsByCity.jsx` | **5.5** | Donut `<PieChart>` (`innerRadius`) with `<Cell>` colours + custom legend |
| `CallLogsTable.jsx` | **5.6** | shadcn `Table`; `useMemo` for sort + search; pagination with `slice()` |
| `ChartTooltip.jsx` | shared | One tooltip + axis style reused by all charts |
| `DashboardSkeleton.jsx` | shared | Grey pulsing placeholders while loading |

**Recharts pattern** (same in every chart):

```jsx
<ResponsiveContainer width="100%" height="100%">   {/* parent needs a height, e.g. h-64 */}
  <BarChart data={buckets}>
    <CartesianGrid vertical={false} stroke="var(--border)" />
    <XAxis dataKey="range" />
    <YAxis allowDecimals={false} />
    <Tooltip content={<ChartTooltip />} />
    <Bar dataKey="calls" name="Calls" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

`data` is an array of objects; `dataKey` says which property to plot.

**Table search + pagination**:

```js
const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  const sorted = [...calls].sort((a, b) => b.startTime - a.startTime);   // newest first
  return q ? sorted.filter((c) =>
    [c.callerName, c.callerNumber, c.receiverNumber, c.city]
      .some((f) => f.toLowerCase().includes(q))) : sorted;
}, [calls, query]);

const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
```

## Step 11 – Put it together (`src/App.jsx`)

Data flow: **API → `useCallData` → `analytics.js` (inside `useMemo`) → components via props**.

```jsx
const { calls, loading, error, refetch, lastUpdated } = useCallData();

const analytics = useMemo(() => ({
  kpis: getKpis(calls),
  durationStats: getDurationStats(calls),
  durationBuckets: getDurationBuckets(calls),
  cityStats: getCityStats(calls),
  perDay: getCallsPerDay(calls),
  perHour: getCallsPerHour(calls),
}), [calls]);          // recalculated only when the data changes
```

Then three render states: **error** card with "Try again" → **loading** skeleton → the **dashboard** grid.
Dark mode toggles `document.documentElement.classList.toggle("dark", dark)` and is remembered in `localStorage`.

`src/main.jsx` mounts `<App />` and imports `index.css`. `index.html` loads the Inter font and sets the page title.

## Step 12 – Run, build, push, deploy

```bash
npm run dev        # develop at http://localhost:5173
npm run build      # check the production build has no errors

git init
git add .
git commit -m "Call analytics dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cdr-dashboard.git
git push -u origin main
```

**Vercel:** vercel.com → *Add New → Project* → import the repo → preset **Vite** → *Deploy*.
`vercel.json` rewrites all routes to `index.html` (safe default for single-page apps).
Put the live URL and screenshots into `README.md` – those are the required deliverables.

---

## Final file tree

```
cdr-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json
├── components.json
├── vercel.json
├── README.md
├── GUIDE.md
├── screenshots/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── hooks/useCallData.js
    ├── lib/{api.js, analytics.js, format.js, utils.js}
    └── components/
        ├── ui/{card, table, badge, button, input, skeleton}.jsx
        └── dashboard/{Header, KpiCards, DurationAnalytics, CostAnalytics,
                       ActivityTimeline, CallsByCity, CallLogsTable,
                       ChartTooltip, DashboardSkeleton}.jsx
```

## Interview-style questions you should be able to answer

1. Why normalise data in `api.js` instead of inside each component?
2. What does `useMemo` save us in `App.jsx`?
3. Why does the effect return `() => controller.abort()`?
4. How does shadcn/ui differ from a library like Material UI?
5. Why does `ResponsiveContainer` need a parent with a fixed height?
