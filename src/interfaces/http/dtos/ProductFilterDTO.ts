import { z } from "zod";

export const ProductFilterSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional()
});

export type ProductFilterDTO = z.infer<typeof ProductFilterSchema>;
