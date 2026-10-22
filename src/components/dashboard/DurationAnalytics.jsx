import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { ChartTooltip, axisProps } from "./ChartTooltip";

// 5.2 Call Duration Analytics: longest / shortest / average + distribution bar chart
export function DurationAnalytics({ stats, buckets }) {
  const tiles = [
    { label: "Longest call", value: stats.longest ? formatDuration(stats.longest.duration) : "—", who: stats.longest?.callerName },
    { label: "Shortest call", value: stats.shortest ? formatDuration(stats.shortest.duration) : "—", who: stats.shortest?.callerName },
    { label: "Average", value: formatDuration(stats.average), who: "across all calls" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Duration</CardTitle>
        <CardDescription>How long calls last</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">{t.label}</p>
              <p className="text-xl font-semibold tabular-nums">{t.value}</p>
              <p className="text-muted-foreground truncate text-xs">{t.who}</p>
            </div>
          ))}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="range" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
              <Bar dataKey="calls" name="Calls" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
