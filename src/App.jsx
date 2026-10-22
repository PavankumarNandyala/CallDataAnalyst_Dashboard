import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/dashboard/Header";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DurationAnalytics } from "@/components/dashboard/DurationAnalytics";
import { CostAnalytics } from "@/components/dashboard/CostAnalytics";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CallsByCity } from "@/components/dashboard/CallsByCity";
import { CallLogsTable } from "@/components/dashboard/CallLogsTable";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useCallData } from "@/hooks/useCallData";
import {
  getCallsPerDay,
  getCallsPerHour,
  getCityStats,
  getDurationBuckets,
  getDurationStats,
  getKpis,
} from "@/lib/analytics";

export default function App() {
  const { calls, loading, error, refetch, lastUpdated } = useCallData();

  // Dark mode: remember the choice in localStorage
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* storage unavailable – ignore */
    }
  }, [dark]);

  // Derive all analytics once per data load (not on every render)
  const analytics = useMemo(
    () => ({
      kpis: getKpis(calls),
      durationStats: getDurationStats(calls),
      durationBuckets: getDurationBuckets(calls),
      cityStats: getCityStats(calls),
      perDay: getCallsPerDay(calls),
      perHour: getCallsPerHour(calls),
    }),
    [calls]
  );

  return (
    <div className="min-h-screen">
      <Header
        onRefresh={refetch}
        loading={loading}
        lastUpdated={lastUpdated}
        dark={dark}
        onToggleTheme={() => setDark((d) => !d)}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {error ? (
          <Card className="border-destructive/40">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertTriangle className="text-destructive size-8" />
              <p className="font-medium">Could not load call data</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button onClick={refetch}>Try again</Button>
            </CardContent>
          </Card>
        ) : loading && !calls.length ? (
          <DashboardSkeleton />
        ) : (
          <>
            <KpiCards kpis={analytics.kpis} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityTimeline perDay={analytics.perDay} perHour={analytics.perHour} />
              </div>
              <CallsByCity cityStats={analytics.cityStats} totalCalls={analytics.kpis.totalCalls} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DurationAnalytics stats={analytics.durationStats} buckets={analytics.durationBuckets} />
              <CostAnalytics
                cityStats={analytics.cityStats}
                avgCost={analytics.kpis.avgCost}
                totalCost={analytics.kpis.totalCost}
              />
            </div>

            <CallLogsTable calls={calls} />
          </>
        )}
      </main>

      <footer className="text-muted-foreground py-6 text-center text-xs">
        Built with React, Vite, Tailwind CSS, shadcn/ui and Recharts
      </footer>
    </div>
  );
}
