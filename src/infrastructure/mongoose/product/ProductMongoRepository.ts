import { ProductRepository } from '../../../domain/product/ProductRepository';
import { Product } from '../../../domain/product/Product';
import { ProductModel } from './ProductSchema';
import { ProductFilterDTO } from '../../../interfaces/http/dtos/ProductFilterDTO';

export class ProductMongoRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity
    };

    if (product.id) {
      // Update existing product
      const updated = await ProductModel.findByIdAndUpdate(
        product.id,
        productData,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('Product not found');
      }
      
      return this.mapToProduct(updated);
    } else {
      // Create new product
      const doc = await ProductModel.create(productData);
      return this.mapToProduct(doc);
    }
  }

  async findAll(): Promise<Product[]> {
    const docs = await ProductModel.find();
    return docs.map(doc => new Product(doc.name, doc.description, doc.price, doc.category, doc.stockQuantity, doc.id.toString()));
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await ProductModel.findById(id);
    return doc ? this.mapToProduct(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  private mapToProduct(doc: any): Product {
    const data = doc.toObject ? doc.toObject() : doc;
    return new Product(
      data.name,
      data.description,
      data.price,
      data.category,
      data.stockQuantity,
      data._id.toString()
    );
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
          doc.stockQuantity,
          doc.id.toString(),
        )
    );
  }
}
