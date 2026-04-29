// @max-lines 200 — this is enforced by the lint pipeline.
import { z } from "zod";
import { PaginationSchema } from "./pagination.schema.js";

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
  imageUrl: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).optional(),
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
  imageUrl: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).optional(),
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
