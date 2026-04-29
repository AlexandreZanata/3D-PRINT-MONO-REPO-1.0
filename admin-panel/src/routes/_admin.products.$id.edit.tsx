import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAdminProduct, useUpdateProduct } from "@/features/admin/hooks/useAdminProducts";
import { ProductForm } from "@/organisms/ProductForm";
import type { ProductFormValues } from "@/organisms/ProductForm";

export const Route = createFileRoute("/_admin/products/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Forma Admin" }] }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useAdminProduct(id);
  const updateMutation = useUpdateProduct();

  const handleSubmit = (values: ProductFormValues) => {
    updateMutation.mutate(
      {
        id,
        input: {
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
          isActive: values.isActive,
        },
      },
      {
        onSuccess: () => {
          void navigate({ to: "/products" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-destructive text-sm">Product not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/products"
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">Edit product</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <ProductForm
          defaultValues={{
            name: product.name,
            slug: product.slug,
            tagline: product.tagline,
            category: product.category,
            material: product.material,
            dimensions: product.dimensions,
            description: product.description,
            price: product.price,
            stock: product.stock,
            whatsappNumber: product.whatsappNumber,
            imageUrl: product.imageUrl,
            images: product.images.map((url) => ({ url })),
            isActive: product.isActive,
          }}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          error={updateMutation.isError ? "Failed to save changes." : undefined}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
