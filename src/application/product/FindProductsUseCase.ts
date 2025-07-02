import { ProductRepository } from "../../domain/product/ProductRepository";
import { Product } from "../../domain/product/Product";
import { ProductFilterDTO } from "../../interfaces/http/dtos/ProductFilterDTO";

export class FindProductsUseCase {
    constructor(private readonly productRepo: ProductRepository) { }

    async execute(filters: ProductFilterDTO): Promise<Product[]> {
        return await this.productRepo.findByFilters(filters);
    }
}
