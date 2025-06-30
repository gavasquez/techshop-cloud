import { Product } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";


export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    async execute( data: {
        name: string;
        description: string;
        price: number;
        category: string;
        stockQuantity: number;
    }): Promise<Product> {
        const product = new Product(
            data.name,
            data.description,
            data.price,
            data.category,
            data.stockQuantity
        );

       return await this.productRepository.save(product);
    }
}