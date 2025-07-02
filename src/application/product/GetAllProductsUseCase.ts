import { Product } from '../../domain/product/Product';
import { ProductRepository } from '../../domain/product/ProductRepository';

export class GetAllProductsUseCase {
    constructor(private readonly productRepo: ProductRepository) { }

    async execute(): Promise<Product[]> {
        return await this.productRepo.findAll();
    }
}
