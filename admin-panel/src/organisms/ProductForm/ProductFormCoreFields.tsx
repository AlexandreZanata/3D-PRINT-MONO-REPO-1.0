import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { ProductFormValues } from "./ProductForm.types";

const CATEGORIES = ["Decor", "Lighting", "Tableware", "Games", "Office"] as const;

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors";
const labelCls = "text-sm font-medium";
const errorCls = "text-xs text-destructive mt-0.5";

interface ProductFormCoreFieldsProps {
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}

export function ProductFormCoreFields({ register, errors }: ProductFormCoreFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className={labelCls}>
            Name *
          </label>
          <input
            id="name"
            {...register("name", { required: "Required" })}
            className={cn(inputCls, errors.name && "border-destructive")}
            placeholder="Facet Vase"
          />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="slug" className={labelCls}>
            Slug
          </label>
          <input id="slug" {...register("slug")} className={inputCls} placeholder="facet-vase" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="tagline" className={labelCls}>
          Tagline
        </label>
        <input
          id="tagline"
          {...register("tagline")}
          className={inputCls}
          placeholder="Low-poly silhouette, hand-finished"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="category" className={labelCls}>
            Category *
          </label>
          <select
            id="category"
            {...register("category", { required: "Required" })}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="material" className={labelCls}>
            Material
          </label>
          <input
            id="material"
            {...register("material")}
            className={inputCls}
            placeholder="Matte PLA — Cream"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="dimensions" className={labelCls}>
          Dimensions
        </label>
        <input
          id="dimensions"
          {...register("dimensions")}
          className={inputCls}
          placeholder="18 × 14 × 14 cm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className={labelCls}>
          Description *
        </label>
        <textarea
          id="description"
          {...register("description", { required: "Required" })}
          rows={3}
          className={cn(inputCls, errors.description && "border-destructive")}
        />
        {errors.description && <p className={errorCls}>{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="price" className={labelCls}>
            Price (USD) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price", { valueAsNumber: true, required: "Required" })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="stock" className={labelCls}>
            Stock *
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            {...register("stock", { valueAsNumber: true, required: "Required" })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="whatsappNumber" className={labelCls}>
            WhatsApp *
          </label>
          <input
            id="whatsappNumber"
            {...register("whatsappNumber", { required: "Required" })}
            className={inputCls}
            placeholder="+5511999999999"
          />
        </div>
      </div>
    </>
  );
}
