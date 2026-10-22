import { CheckCircle2, Clock, DollarSign, PhoneCall, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/format";

// 5.1 KPI Summary Cards
export function KpiCards({ kpis }) {
  const items = [
    {
      title: "Total Calls",
      value: formatNumber(kpis.totalCalls),
      hint: `${formatNumber(kpis.inboundCalls)} inbound · ${formatNumber(kpis.totalCalls - kpis.inboundCalls)} outbound`,
      icon: PhoneCall,
      tone: "text-primary bg-primary/10",
    },
    {
      title: "Total Call Cost",
      value: formatCurrency(kpis.totalCost),
      hint: `${formatCurrency(kpis.avgCost)} avg per call`,
      icon: DollarSign,
      tone: "text-chart-3 bg-chart-3/10",
    },
    {
      title: "Average Duration",
      value: formatDuration(kpis.avgDuration),
      hint: "per call",
      icon: Clock,
      tone: "text-chart-2 bg-chart-2/10",
    },
    {
      title: "Successful Calls",
      value: formatNumber(kpis.successfulCalls),
      hint: `${kpis.successRate.toFixed(1)}% success rate`,
      icon: CheckCircle2,
      tone: "text-success bg-success/10",
    },
    {
      title: "Failed Calls",
      value: formatNumber(kpis.failedCalls),
      hint: `${(100 - kpis.successRate).toFixed(1)}% of all calls`,
      icon: XCircle,
      tone: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(({ title, value, hint, icon: Icon, tone }) => (
        <Card key={title} className="gap-3 py-5">
          <CardHeader className="flex flex-row items-center justify-between px-5">
            <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
            <span className={`grid size-8 place-items-center rounded-md ${tone}`}>
              <Icon className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="px-5">
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
