// @max-lines 200 — this is enforced by the lint pipeline.
import { z } from "zod";
import { PaginationSchema } from "./pagination.schema.js";

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(2000).trim(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number"),
  imageUrl: z.string().url().nullable().optional(),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).max(2000).trim().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Must be a valid E.164 phone number")
    .optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

export const ListProductsQuerySchema = PaginationSchema.extend({
  name: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ListProductsQueryDTO = z.infer<typeof ListProductsQuerySchema>;
