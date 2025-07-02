import { ProductRepository } from '../../../domain/product/ProductRepository';
import { Product } from '../../../domain/product/Product';
import { ProductModel } from './ProductSchema';
import { ProductFilterDTO } from '../../../interfaces/http/dtos/ProductFilterDTO';

export class ProductMongoRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const doc = await ProductModel.create(product);
    return new Product(doc.name, doc.description, doc.price, doc.category, doc.stockQuantity);
  }

  async findAll(): Promise<Product[]> {
    const docs = await ProductModel.find();
    return docs.map(doc => new Product(doc.name, doc.description, doc.price, doc.category, doc.stockQuantity));
  }

  async findByFilters(filters: ProductFilterDTO): Promise<Product[]> {
    const query: any = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    const docs = await ProductModel.find(query);
    return docs.map(
      doc =>
        new Product(
          doc.name,
          doc.description,
          doc.price,
          doc.category,
          doc.stockQuantity
        )
    );
  }

}
