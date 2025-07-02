import { ProductMongoRepository } from "../../infrastructure/mongoose/product/ProductMongoRepository";
import { CreateProductUseCase, FindProductsUseCase, GetAllProductsUseCase } from "../../application";

const productRepo = new ProductMongoRepository();

export const ProductModule = {
  createProductUseCase: new CreateProductUseCase(productRepo),
  getAllProductsUseCase: new GetAllProductsUseCase(productRepo),
  findProductsUseCase: new FindProductsUseCase(productRepo),
};
