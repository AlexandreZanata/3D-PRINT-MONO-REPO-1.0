import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUpdateProduct } from "@/features/admin/hooks/useAdminProducts";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import { ProductForm } from "@/organisms/ProductForm/ProductForm";
import type { ProductFormValues } from "@/organisms/ProductForm/ProductForm";

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

  const handleSubmit = (values: ProductFormValues) => {
    updateMutation.mutate(
      {
        id,
        input: {
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
          isActive: values.isActive,
        },
      },
      {
        onSuccess: () => void navigate({ to: "/admin/products" }),
      },
    );
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">Edit product</h1>
      <ProductForm
        defaultValues={product}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.isError ? "Failed to update product." : undefined}
        submitLabel="Save changes"
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
