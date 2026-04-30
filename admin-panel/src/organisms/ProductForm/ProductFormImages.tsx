import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { ImageUrlInputWithUpload } from "@/organisms/ImageUrlInputWithUpload/ImageUrlInputWithUpload";
import type { ProductFormValues } from "./ProductForm.types";

const labelCls = "text-sm font-medium";

interface ProductFormImagesProps {
  control: Control<ProductFormValues>;
  fields: ReadonlyArray<{ id: string }>;
  append: (value: { url: string }) => void;
  remove: (index: number) => void;
}

export function ProductFormImages({ control, fields, append, remove }: ProductFormImagesProps) {
  return (
    <div className="space-y-4">
      <Controller
        name="imageUrl"
        control={control}
        render={({ field }) => (
          <ImageUrlInputWithUpload
            id="product-imageUrl"
            label="Primary image (cover)"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="https://… or upload — first gallery image is used if empty"
          />
        )}
      />

      <div className="space-y-2">
        <p className={labelCls}>Gallery images (ordered — first is primary in storefront)</p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <Controller
                name={`images.${index}.url`}
                control={control}
                render={({ field }) => (
                  <ImageUrlInputWithUpload
                    id={`product-images-${String(index)}`}
                    hideLabel
                    ariaLabel={`Gallery image ${String(index + 1)}`}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 self-start p-2 text-muted-foreground hover:text-destructive transition-colors sm:mt-8"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ url: "" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Add gallery image
        </button>
      </div>
    </div>
  );
}
