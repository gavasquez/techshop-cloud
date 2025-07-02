import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().min(3, 'El nombre es obligatorio y debe tener al menos 3 caracteres'),
    description: z.string().min(10),
    price: z.number().positive('El precio debe ser mayor a 0'),
    category: z.string().min(2),
    stockQuantity: z.number().int().nonnegative()
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
