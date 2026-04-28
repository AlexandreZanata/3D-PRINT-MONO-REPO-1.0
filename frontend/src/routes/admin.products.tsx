import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminProducts, useDeleteProduct } from "@/features/admin/hooks/useAdminProducts";
import { formatCurrency } from "@/lib/formatCurrency";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Forma Admin" }] }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { data, isLoading } = useAdminProducts();
  const deleteMutation = useDeleteProduct();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading products…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-foreground text-background px-5 py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Add product
        </Link>
      </div>

      {!data || data.items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products yet.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.isActive
                          ? "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                          : "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      }
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3 justify-end">
                    <Link
                      to="/admin/products/$id/edit"
                      params={{ id: p.id }}
                      className="text-xs hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                      className="text-xs text-destructive hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
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
