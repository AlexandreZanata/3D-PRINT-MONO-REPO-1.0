import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCreateProduct } from "@/features/admin/hooks/useAdminProducts";
import { ProductForm } from "@/organisms/ProductForm";
import type { ProductFormValues } from "@/organisms/ProductForm";

export const Route = createFileRoute("/_admin/products/new")({
  head: () => ({ meta: [{ title: "New Product — Forma Admin" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();

  const handleSubmit = (values: ProductFormValues) => {
    createMutation.mutate(
      {
        name: values.name,
        slug: values.slug ?? null,
        tagline: values.tagline ?? "",
        category: values.category,
        material: values.material ?? "",
        dimensions: values.dimensions ?? "",
        description: values.description,
        price: values.price,
        stock: values.stock,
        whatsappNumber: values.whatsappNumber,
        imageUrl: values.imageUrl ?? null,
        images: values.images?.map((img) => img.url) ?? [],
      },
      {
        onSuccess: () => {
          void navigate({ to: "/products" });
        },
      },
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/products"
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">New product</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          error={createMutation.isError ? "Failed to create product. Please try again." : undefined}
          submitLabel="Create product"
        />
      </div>
    </div>
  );
}
