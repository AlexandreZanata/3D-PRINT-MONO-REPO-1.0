// @max-lines 200 — this is enforced by the lint pipeline.
import { z } from "zod";
import { isPublicImageRef } from "./image-ref.js";
import { PaginationSchema } from "./pagination.schema.js";

const optionalImageUrlField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  })
  .refine((v) => v === undefined || v === null || isPublicImageRef(v), {
    message: "Invalid image URL or upload path",
  });

const optionalImageList = z
  .array(z.string().refine(isPublicImageRef, { message: "Invalid image URL or upload path" }))
  .optional();

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(200).trim().nullable().optional(),
  tagline: z.string().max(300).trim().optional(),
  category: z.string().min(1).max(100).trim().optional(),
  material: z.string().max(200).trim().optional(),
  dimensions: z.string().max(200).trim().optional(),
  description: z.string().min(1).max(2000).trim(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  whatsappNumber: z.string().regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number"),
  imageUrl: optionalImageUrlField,
  images: optionalImageList,
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  slug: z.string().min(1).max(200).trim().nullable().optional(),
  tagline: z.string().max(300).trim().optional(),
  category: z.string().min(1).max(100).trim().optional(),
  material: z.string().max(200).trim().optional(),
  dimensions: z.string().max(200).trim().optional(),
  description: z.string().min(1).max(2000).trim().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number")
    .optional(),
  imageUrl: optionalImageUrlField,
  images: optionalImageList,
  isActive: z.boolean().optional(),
});

export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

export const ListProductsQuerySchema = PaginationSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isActive: z.coerce.boolean().optional(),
  category: z.string().optional(),
});

export type ListProductsQueryDTO = z.infer<typeof ListProductsQuerySchema>;

/** Schema for bulk-updating site settings. */
export const UpdateSiteSettingsSchema = z.object({
  settings: z.record(z.string(), z.string()),
});

export type UpdateSiteSettingsDTO = z.infer<typeof UpdateSiteSettingsSchema>;
