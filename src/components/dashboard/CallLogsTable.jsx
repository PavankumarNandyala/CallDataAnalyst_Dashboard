import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";

const PAGE_SIZE = 10;

// 5.6 Recent Call Logs Table: newest first, searchable, paginated
export function CallLogsTable({ calls }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...calls].sort((a, b) => b.startTime - a.startTime);
    if (!q) return sorted;
    return sorted.filter((c) =>
      [c.callerName, c.callerNumber, c.receiverNumber, c.city].some((f) => f.toLowerCase().includes(q))
    );
  }, [calls, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Call Logs</CardTitle>
        <CardDescription>{filtered.length} records</CardDescription>
        <CardAction>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search name, number, city…"
              className="w-44 pl-8 sm:w-64"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller Name</TableHead>
              <TableHead>Caller Number</TableHead>
              <TableHead>Receiver Number</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Start Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-10 text-center">
                  No calls match “{query}”.
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.callerName}</TableCell>
                <TableCell className="font-mono text-xs">{c.callerNumber}</TableCell>
                <TableCell className="font-mono text-xs">{c.receiverNumber}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {c.isInbound ? <ArrowDownLeft /> : <ArrowUpRight />}
                    {c.isInbound ? "Inbound" : "Outbound"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={c.isSuccessful ? "success" : "destructive"}>
                    {c.isSuccessful ? "Successful" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatDuration(c.duration)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(c.cost)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(c.startTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {current + 1} of {pageCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
