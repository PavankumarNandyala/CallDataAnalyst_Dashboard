import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { topNWithOther } from "@/lib/analytics";
import { CHART_COLORS, ChartTooltip } from "./ChartTooltip";

// 5.5 Calls by City: donut chart of the top 5 cities + "Other", with a ranked legend
export function CallsByCity({ cityStats, totalCalls }) {
  const data = topNWithOther(cityStats, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calls by City</CardTitle>
        <CardDescription>{cityStats.length} cities in total</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="calls" nameKey="city" innerRadius="55%" outerRadius="90%" paddingAngle={2} stroke="var(--card)">
                {data.map((d, i) => (
                  <Cell key={d.city} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} calls`} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d, i) => (
            <li key={d.city} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="truncate">{d.city}</span>
              <span className="text-muted-foreground ml-auto tabular-nums">
                {d.calls} · {totalCalls ? ((d.calls / totalCalls) * 100).toFixed(0) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
