import { ProductFilterDTO } from '../../interfaces/http/dtos/ProductFilterDTO';
import { Product } from './Product';

export interface ProductRepository {
    save(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    findByFilters(filters: ProductFilterDTO): Promise<Product[]>;
    delete(id: string): Promise<void>;
}
