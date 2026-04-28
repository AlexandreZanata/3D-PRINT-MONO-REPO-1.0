import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PRODUCTS, formatPrice } from "@/lib/products";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 6);
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No results</p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 p-3 hover:bg-secondary transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-14 w-14 rounded-md object-cover bg-surface"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                    </div>
                    <p className="text-sm tabular-nums">{formatPrice(p.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
