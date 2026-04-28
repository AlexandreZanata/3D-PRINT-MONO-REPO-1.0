import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUpdateProduct } from "@/features/admin/hooks/useAdminProducts";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import type { UpdateProductInput } from "@/features/admin/types";

export const Route = createFileRoute("/admin/products/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Forma Admin" }] }),
  component: AdminProductEditPage,
});

function AdminProductEditPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProductDetail(id);
  const updateMutation = useUpdateProduct();
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading product…</p>;
  }

  if (!product) {
    return <p className="text-destructive text-sm">Product not found.</p>;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input: UpdateProductInput = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      price: parseFloat(String(form.get("price") ?? "0")),
      stock: parseInt(String(form.get("stock") ?? "0"), 10),
      whatsappNumber: String(form.get("whatsappNumber") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? "") || null,
    };

    updateMutation.mutate(
      { id, input },
      { onSuccess: () => void navigate({ to: "/admin/products" }) },
    );
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">Edit product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: "name", label: "Name", type: "text", defaultValue: product.name },
          { id: "price", label: "Price (USD)", type: "number", defaultValue: String(product.price) },
          { id: "stock", label: "Stock", type: "number", defaultValue: String(product.stock) },
          { id: "whatsappNumber", label: "WhatsApp number", type: "text", defaultValue: product.whatsappNumber },
          { id: "imageUrl", label: "Image URL", type: "url", defaultValue: product.imageUrl ?? "" },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-sm mb-1.5">{f.label}</label>
            <input
              id={f.id}
              name={f.id}
              type={f.type}
              defaultValue={f.defaultValue}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
        ))}
        <div>
          <label htmlFor="description" className="block text-sm mb-1.5">Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={product.description}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground resize-none"
          />
        </div>
        {updateMutation.isError && (
          <p className="text-sm text-destructive">Failed to update product.</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </button>
          <a href="/admin/products" className="rounded-full border border-border px-6 py-2.5 text-sm hover:bg-secondary transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
