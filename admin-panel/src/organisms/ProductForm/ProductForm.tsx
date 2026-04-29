import { useFieldArray, useForm } from "react-hook-form";
import { ProductFormCoreFields } from "./ProductFormCoreFields";
import { ProductFormImages } from "./ProductFormImages";
import type { ProductFormValues } from "./ProductForm.types";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
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
      images: defaultValues?.images ?? [],
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
      <ProductFormCoreFields register={register} errors={errors} />
      <ProductFormImages register={register} fields={fields} append={append} remove={remove} />

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 rounded border-input"
        />
        <label htmlFor="isActive" className="text-sm">
          Active (visible to customers)
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
