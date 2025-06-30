import { Product } from './Product';

export interface ProductRepository {
    save(product: Product): Promise<Product>;
    findAll(): Promise<Product[]>;
}
