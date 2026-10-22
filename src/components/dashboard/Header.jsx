import { Moon, PhoneCall, RefreshCw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export function Header({ onRefresh, loading, lastUpdated, dark, onToggleTheme }) {
  return (
    <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-lg">
          <PhoneCall className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">Call Analytics</h1>
          <p className="text-muted-foreground truncate text-xs">
            CDR dashboard{lastUpdated && ` · updated ${formatDateTime(lastUpdated)}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {dark ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
