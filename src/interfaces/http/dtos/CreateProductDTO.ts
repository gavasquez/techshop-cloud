import { z } from "zod";

export const CreateProductSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    category: z.string(),
    stockQuantity: z.number().int().nonnegative()
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
