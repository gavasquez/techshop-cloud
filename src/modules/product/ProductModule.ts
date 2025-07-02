import { CreateProductUseCase, GetAllProductsUseCase } from "../../application";
import { ProductMongoRepository } from "../../infrastructure/mongoose/product/ProductMongoRepository";

const productRepo = new ProductMongoRepository();

export const ProductModule = {
  createProductUseCase: new CreateProductUseCase(productRepo),
  getAllProductsUseCase: new GetAllProductsUseCase(productRepo),
};
