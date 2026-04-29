import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { FormField } from "@/molecules/FormField/FormField";
import type { Product } from "@/features/products/types";

const CATEGORIES = ["Decor", "Lighting", "Tableware", "Games", "Office"] as const;

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().max(200).nullable().optional(),
  tagline: z.string().max(300).optional(),
  category: z.string().min(1, "Category is required"),
  material: z.string().max(200).optional(),
  dimensions: z.string().max(200).optional(),
  description: z.string().min(1, "Description is required").max(2000),
  price: z.number().nonnegative("Price must be ≥ 0"),
  stock: z.number().int().nonnegative("Stock must be ≥ 0"),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number (e.g. +5511999999999)"),
  imageUrl: z.string().url("Must be a valid URL").nullable().optional(),
  images: z.array(z.object({ url: z.string().url("Must be a valid URL") })).optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
  error?: string;
  submitLabel?: string;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  error,
  submitLabel = "Save",
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? null,
      tagline: defaultValues?.tagline ?? "",
      category: defaultValues?.category ?? "Decor",
      material: defaultValues?.material ?? "",
      dimensions: defaultValues?.dimensions ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      stock: defaultValues?.stock ?? 0,
      whatsappNumber: defaultValues?.whatsappNumber ?? "",
      imageUrl: defaultValues?.imageUrl ?? null,
      images: (defaultValues?.images ?? []).map((url) => ({ url })),
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="name" label="Name *" error={errors.name?.message}
          inputProps={{ ...register("name"), type: "text", placeholder: "Facet Vase" }} />
        <FormField id="slug" label="Slug (URL)" error={errors.slug?.message}
          inputProps={{ ...register("slug"), type: "text", placeholder: "facet-vase" }} />
      </div>

      <FormField id="tagline" label="Tagline" error={errors.tagline?.message}
        inputProps={{ ...register("tagline"), type: "text", placeholder: "Low-poly silhouette, hand-finished" }} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">Category *</label>
          <select id="category" {...register("category")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <FormField id="material" label="Material" error={errors.material?.message}
          inputProps={{ ...register("material"), type: "text", placeholder: "Matte PLA — Cream" }} />
      </div>

      <FormField id="dimensions" label="Dimensions" error={errors.dimensions?.message}
        inputProps={{ ...register("dimensions"), type: "text", placeholder: "18 × 14 × 14 cm" }} />

      <FormField id="description" label="Description *" as="textarea" error={errors.description?.message}
        inputProps={{ ...register("description"), rows: 3, placeholder: "A sculpted vessel…" }} />

      <div className="grid grid-cols-2 gap-4">
        <FormField id="price" label="Price (USD) *" error={errors.price?.message}
          inputProps={{ ...register("price", { valueAsNumber: true }), type: "number", step: "0.01", min: "0" }} />
        <FormField id="stock" label="Stock *" error={errors.stock?.message}
          inputProps={{ ...register("stock", { valueAsNumber: true }), type: "number", min: "0" }} />
      </div>

      <FormField id="whatsappNumber" label="WhatsApp number *" error={errors.whatsappNumber?.message}
        inputProps={{ ...register("whatsappNumber"), type: "text", placeholder: "+5511999999999" }} />

      {/* Images array */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Product images (ordered — first is primary)</p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`images.${index}.url`)}
              type="url"
              placeholder={`https://example.com/image-${index + 1}.jpg`}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button type="button" onClick={() => remove(index)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              aria-label="Remove image">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {errors.images && <p className="text-xs text-destructive">One or more image URLs are invalid</p>}
        <button type="button" onClick={() => append({ url: "" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="h-4 w-4" /> Add image URL
        </button>
      </div>

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
