import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  /** Called with the debounced search value */
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * SearchBar molecule — debounced search input.
 * Calls onSearch with the debounced value after the user stops typing.
 * Pure: receives all data via props, emits via onSearch callback.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search…",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounced = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-background pl-9 pr-9 py-2 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
