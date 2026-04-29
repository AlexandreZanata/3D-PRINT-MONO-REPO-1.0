import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateProduct } from "@/features/admin/hooks/useAdminProducts";
import { ProductForm } from "@/organisms/ProductForm/ProductForm";
import type { ProductFormValues } from "@/organisms/ProductForm/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: "New Product — Forma Admin" }] }),
  component: AdminProductNewPage,
});

function AdminProductNewPage() {
  const createMutation = useCreateProduct();
  const navigate = useNavigate();

  const handleSubmit = (values: ProductFormValues) => {
    createMutation.mutate(
      {
        name: values.name,
        slug: values.slug ?? null,
        tagline: values.tagline,
        category: values.category,
        material: values.material,
        dimensions: values.dimensions,
        description: values.description,
        price: values.price,
        stock: values.stock,
        whatsappNumber: values.whatsappNumber,
        imageUrl: values.imageUrl ?? null,
        images: values.images?.map((img) => img.url) ?? [],
      },
      {
        onSuccess: () => void navigate({ to: "/admin/products" }),
      },
    );
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">New product</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? "Failed to create product. Please try again." : undefined}
        submitLabel="Create product"
      />
      <a
        href="/admin/products"
        className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to products
      </a>
    </div>
  );
}
