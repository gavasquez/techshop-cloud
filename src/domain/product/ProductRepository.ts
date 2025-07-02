import { ProductFilterDTO } from '../../interfaces/http/dtos/ProductFilterDTO';
import { Product } from './Product';

export interface ProductRepository {
    save(product: Product): Promise<Product>;
    findAll(): Promise<Product[]>;
    findByFilters(filters: ProductFilterDTO): Promise<Product[]>;
}
