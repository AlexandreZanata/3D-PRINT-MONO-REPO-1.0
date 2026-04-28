import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * PaginationBar molecule — prev/next + page indicator.
 * Pure: receives all data via props, emits via onPageChange callback.
 */
export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="text-sm tabular-nums text-muted-foreground min-w-[5rem] text-center">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
