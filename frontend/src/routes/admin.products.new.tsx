import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateProduct } from "@/features/admin/hooks/useAdminProducts";
import type { CreateProductInput } from "@/features/admin/types";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: "New Product — Forma Admin" }] }),
  component: AdminProductNewPage,
});

function AdminProductNewPage() {
  const createMutation = useCreateProduct();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input: CreateProductInput = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      price: parseFloat(String(form.get("price") ?? "0")),
      stock: parseInt(String(form.get("stock") ?? "0"), 10),
      whatsappNumber: String(form.get("whatsappNumber") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? "") || null,
    };

    createMutation.mutate(input, {
      onSuccess: () => void navigate({ to: "/admin/products" }),
    });
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">New product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductFormFields />
        {createMutation.isError && (
          <p className="text-sm text-destructive">Failed to create product. Please try again.</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Create product"}
          </button>
          <a href="/admin/products" className="rounded-full border border-border px-6 py-2.5 text-sm hover:bg-secondary transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function ProductFormFields() {
  return (
    <>
      {[
        { id: "name", label: "Name", type: "text", required: true },
        { id: "price", label: "Price (USD)", type: "number", required: true },
        { id: "stock", label: "Stock", type: "number", required: true },
        { id: "whatsappNumber", label: "WhatsApp number", type: "text", required: true },
        { id: "imageUrl", label: "Image URL", type: "url", required: false },
      ].map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className="block text-sm mb-1.5">
            {f.label}
          </label>
          <input
            id={f.id}
            name={f.id}
            type={f.type}
            required={f.required}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
      ))}
      <div>
        <label htmlFor="description" className="block text-sm mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground resize-none"
        />
      </div>
    </>
  );
}
