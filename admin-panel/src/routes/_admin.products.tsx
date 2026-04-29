import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdminProducts, useDeleteProduct } from "@/features/admin/hooks/useAdminProducts";
import { formatCurrency, cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/products")({
  head: () => ({ meta: [{ title: "Products — Forma Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data, isLoading } = useAdminProducts(1, 50);
  const deleteMutation = useDeleteProduct();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} total products</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No products yet.{" "}
          <Link to="/products/new" className="underline underline-offset-4">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    {p.tagline && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{p.tagline}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        p.isActive ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        to="/products/$id/edit"
                        params={{ id: p.id }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
