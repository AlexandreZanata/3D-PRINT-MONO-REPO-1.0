import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/molecules/FormField/FormField";
import type { Product } from "@/features/products/types";

/**
 * Frontend Zod v4 schema mirroring @repo/contracts CreateProductSchema (Zod v3).
 * Defined locally because @repo/contracts uses Zod v3 which is incompatible
 * with the frontend's Zod v4 resolver.
 */
const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  price: z.number().nonnegative("Price must be ≥ 0"),
  stock: z.number().int().nonnegative("Stock must be ≥ 0"),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number (e.g. +5511999999999)"),
  imageUrl: z.string().url("Must be a valid URL").nullable().optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  /** Pre-fill values when editing an existing product */
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
  error?: string;
  submitLabel?: string;
}

/**
 * ProductForm organism — handles both create and edit.
 * Uses React Hook Form + Zod v4 validation.
 * No API calls inside — parent route handles mutations.
 */
export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  error,
  submitLabel = "Save",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      stock: defaultValues?.stock ?? 0,
      whatsappNumber: defaultValues?.whatsappNumber ?? "",
      imageUrl: defaultValues?.imageUrl ?? null,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
      <FormField id="name" label="Name" error={errors.name?.message}
        inputProps={{ ...register("name"), type: "text", placeholder: "Geometric Vase" }} />

      <FormField id="description" label="Description" as="textarea" error={errors.description?.message}
        inputProps={{ ...register("description"), rows: 3, placeholder: "A modern 3D-printed vase…" }} />

      <div className="grid grid-cols-2 gap-4">
        <FormField id="price" label="Price (USD)" error={errors.price?.message}
          inputProps={{ ...register("price", { valueAsNumber: true }), type: "number", step: "0.01", min: "0" }} />

        <FormField id="stock" label="Stock" error={errors.stock?.message}
          inputProps={{ ...register("stock", { valueAsNumber: true }), type: "number", min: "0" }} />
      </div>

      <FormField id="whatsappNumber" label="WhatsApp number" error={errors.whatsappNumber?.message}
        inputProps={{ ...register("whatsappNumber"), type: "text", placeholder: "+5511999999999" }} />

      <FormField id="imageUrl" label="Image URL (optional)" error={errors.imageUrl?.message}
        inputProps={{ ...register("imageUrl"), type: "url", placeholder: "https://example.com/image.jpg" }} />

      <div className="flex items-center gap-2">
        <input id="isActive" type="checkbox" {...register("isActive")}
          className="h-4 w-4 rounded border-border focus-visible:ring-2 focus-visible:ring-ring" />
        <label htmlFor="isActive" className="text-sm">Active (visible to customers)</label>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={isLoading}
        className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring">
        {isLoading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
