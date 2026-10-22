import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip, axisProps } from "./ChartTooltip";

const shortDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

// 5.4 Call Activity Timeline: toggle between calls per day and calls per hour of day
export function ActivityTimeline({ perDay, perHour }) {
  const [view, setView] = useState("day");
  const isDay = view === "day";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Activity Timeline</CardTitle>
        <CardDescription>
          {isDay ? "Calls per day, split by outcome" : "Calls by hour of day (UTC)"}
        </CardDescription>
        <CardAction>
          <div className="bg-muted inline-flex rounded-md p-1">
            {["day", "hour"].map((v) => (
              <Button
                key={v}
                size="sm"
                variant={view === v ? "outline" : "ghost"}
                className="h-7 capitalize"
                onClick={() => setView(v)}
              >
                Per {v}
              </Button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {isDay ? (
              <LineChart data={perDay} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip content={<ChartTooltip labelFormatter={shortDate} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="calls" name="All calls" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="successful" name="Successful" stroke="var(--success)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="failed" name="Failed" stroke="var(--destructive)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </LineChart>
            ) : (
              <LineChart data={perHour} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="hour" interval={2} {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="calls" name="Calls" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
