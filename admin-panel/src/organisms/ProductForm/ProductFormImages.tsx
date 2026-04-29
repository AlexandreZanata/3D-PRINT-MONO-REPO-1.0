import type { UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { ProductFormValues } from "./ProductForm.types";

const labelCls = "text-sm font-medium";

interface ProductFormImagesProps {
  register: UseFormRegister<ProductFormValues>;
  fields: ReadonlyArray<{ id: string }>;
  append: (value: { url: string }) => void;
  remove: (index: number) => void;
}

export function ProductFormImages({ register, fields, append, remove }: ProductFormImagesProps) {
  return (
    <div className="space-y-2">
      <p className={labelCls}>Images (ordered — first is primary)</p>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <input
            {...register(`images.${index}.url`)}
            type="url"
            placeholder={`https://example.com/image-${String(index + 1)}.jpg`}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
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
        <Plus className="h-4 w-4" /> Add image URL
      </button>
    </div>
  );
}
