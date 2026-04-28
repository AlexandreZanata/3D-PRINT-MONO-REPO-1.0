import { formatCurrency } from "@/lib/formatCurrency";
import type { Product } from "@/features/products/types";

interface AdminProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * AdminProductTable organism — tabular list of products for the admin panel.
 * Receives data and action callbacks via props — no API calls inside.
 */
export function AdminProductTable({
  products,
  onEdit,
  onDelete,
  isDeleting = false,
}: AdminProductTableProps) {
  if (products.length === 0) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No products yet.</p>;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Price</th>
            <th className="text-left px-4 py-3 font-medium">Stock</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 tabular-nums">{formatCurrency(p.price)}</td>
              <td className="px-4 py-3 tabular-nums">{p.stock}</td>
              <td className="px-4 py-3">
                <span className={p.isActive
                  ? "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                  : "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => onEdit(p.id)}
                    className="text-xs hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(p.id)} disabled={isDeleting}
                    className="text-xs text-destructive hover:underline disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring rounded">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
