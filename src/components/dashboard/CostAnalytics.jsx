import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { ChartTooltip, axisProps } from "./ChartTooltip";

// 5.3 Call Cost Analytics: total cost by city (top 10, horizontal bars) + average cost per call
export function CostAnalytics({ cityStats, avgCost, totalCost }) {
  const data = [...cityStats].sort((a, b) => b.totalCost - a.totalCost).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Cost by City</CardTitle>
        <CardDescription>Top 10 cities by total spend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Average cost per call</p>
            <p className="text-xl font-semibold tabular-nums">{formatCurrency(avgCost)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Total cost</p>
            <p className="text-xl font-semibold tabular-nums">{formatCurrency(totalCost)}</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tickFormatter={formatCompactCurrency} {...axisProps} />
              <YAxis type="category" dataKey="city" width={110} interval={0} {...axisProps} />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltip
                    valueFormatter={(v, item) =>
                      `${formatCurrency(v)} (${item.payload.calls} call${item.payload.calls > 1 ? "s" : ""})`
                    }
                  />
                }
              />
              <Bar dataKey="totalCost" name="Total cost" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
