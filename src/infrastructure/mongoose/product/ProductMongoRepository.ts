import { ProductRepository } from '../../../domain/product/ProductRepository';
import { Product } from '../../../domain/product/Product';
import { ProductModel } from './ProductSchema';

export class ProductMongoRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const doc = await ProductModel.create(product);
    return new Product(doc.name, doc.description, doc.price, doc.category, doc.stockQuantity);
  }

  async findAll(): Promise<Product[]> {
    const docs = await ProductModel.find();
    return docs.map(doc => new Product(doc.name, doc.description, doc.price, doc.category, doc.stockQuantity));
  }
}
