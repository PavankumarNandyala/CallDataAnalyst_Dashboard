// A tooltip styled like a shadcn card, reused by every Recharts chart.
export function ChartTooltip({ active, payload, label, valueFormatter = (v) => v, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1 font-medium">{labelFormatter ? labelFormatter(label) : label}</p>
      )}
      {payload.map((item) => (
        <div key={item.dataKey ?? item.name} className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: item.color ?? item.payload?.fill }} />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto font-mono font-medium tabular-nums">{valueFormatter(item.value, item)}</span>
        </div>
      ))}
    </div>
  );
}

// Shared axis styling so all charts look consistent and respect light/dark theme.
export const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];
