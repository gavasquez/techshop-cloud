import { Product } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";

export class ProductUseCase {

    constructor(
        private readonly productRepository: ProductRepository
    ) { }

    async createProduct(data: {
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

    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.findAll();
    }

    async findProducts(filters: any): Promise<Product[]> {
        return await this.productRepository.findByFilters(filters);
    }
}