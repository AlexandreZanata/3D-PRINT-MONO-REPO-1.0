// @max-lines 200 — this is enforced by the lint pipeline.
import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationDTO = z.infer<typeof PaginationSchema>;
