// Pure functions that turn raw call records into numbers and chart-ready arrays.
// No React here -> easy to test and reason about.

const sum = (arr, pick) => arr.reduce((total, item) => total + pick(item), 0);
const round = (n, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

/** 5.1 KPI summary */
export function getKpis(calls) {
  const totalCalls = calls.length;
  const totalCost = sum(calls, (c) => c.cost);
  const totalDuration = sum(calls, (c) => c.duration);
  const successfulCalls = calls.filter((c) => c.isSuccessful).length;
  const failedCalls = totalCalls - successfulCalls;

  return {
    totalCalls,
    totalCost,
    avgDuration: totalCalls ? totalDuration / totalCalls : 0,
    avgCost: totalCalls ? totalCost / totalCalls : 0,
    successfulCalls,
    failedCalls,
    successRate: totalCalls ? (successfulCalls / totalCalls) * 100 : 0,
    inboundCalls: calls.filter((c) => c.isInbound).length,
  };
}

/** 5.2 Duration stats: longest, shortest, average */
export function getDurationStats(calls) {
  if (!calls.length) return { longest: null, shortest: null, average: 0 };
  const sorted = [...calls].sort((a, b) => a.duration - b.duration);
  return {
    shortest: sorted[0],
    longest: sorted[sorted.length - 1],
    average: sum(calls, (c) => c.duration) / calls.length,
  };
}

/** 5.2 Group calls into duration buckets for a histogram-style bar chart */
export function getDurationBuckets(calls) {
  const buckets = [
    { label: "0–10s", min: 0, max: 10 },
    { label: "11–20s", min: 11, max: 20 },
    { label: "21–30s", min: 21, max: 30 },
    { label: "31–45s", min: 31, max: 45 },
    { label: "46–60s", min: 46, max: 60 },
    { label: "60s+", min: 61, max: Infinity },
  ];
  return buckets.map((b) => ({
    range: b.label,
    calls: calls.filter((c) => c.duration >= b.min && c.duration <= b.max).length,
  }));
}

/** Group by city: number of calls, total cost, average cost. Sorted by calls desc. */
export function getCityStats(calls) {
  const map = new Map();
  for (const c of calls) {
    const entry = map.get(c.city) ?? { city: c.city, calls: 0, totalCost: 0 };
    entry.calls += 1;
    entry.totalCost += c.cost;
    map.set(c.city, entry);
  }
  return [...map.values()]
    .map((e) => ({ ...e, totalCost: round(e.totalCost), avgCost: round(e.totalCost / e.calls) }))
    .sort((a, b) => b.calls - a.calls || b.totalCost - a.totalCost);
}

/** Keep the top N items and fold the rest into an "Other" slice (for the pie chart). */
export function topNWithOther(items, n, key = "calls", label = "city") {
  if (items.length <= n) return items;
  const top = items.slice(0, n);
  const rest = items.slice(n);
  return [...top, { [label]: "Other", [key]: sum(rest, (i) => i[key]) }];
}

/** 5.4 Calls per day (YYYY-MM-DD), sorted chronologically. Includes success/fail split. */
export function getCallsPerDay(calls) {
  const map = new Map();
  for (const c of calls) {
    if (Number.isNaN(c.startTime.getTime())) continue;
    const key = c.startTime.toISOString().slice(0, 10);
    const entry = map.get(key) ?? { date: key, calls: 0, successful: 0, failed: 0, cost: 0 };
    entry.calls += 1;
    entry[c.isSuccessful ? "successful" : "failed"] += 1;
    entry.cost += c.cost;
    map.set(key, entry);
  }
  return [...map.values()]
    .map((e) => ({ ...e, cost: round(e.cost) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 5.4 Calls per hour of day (0–23), always returns all 24 hours. Uses UTC to match the API. */
export function getCallsPerHour(calls) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    calls: 0,
  }));
  for (const c of calls) {
    if (Number.isNaN(c.startTime.getTime())) continue;
    hours[c.startTime.getUTCHours()].calls += 1;
  }
  return hours;
}
