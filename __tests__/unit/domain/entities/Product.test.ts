// __tests__/unit/domain/entities/Product.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Product } from '../../../../src/domain/product/Product';

describe('Product Entity', () => {
  let validProductData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
  };

  beforeEach(() => {
    validProductData = {
      name: 'Laptop Gaming',
      description: 'High-performance gaming laptop',
      price: 1299.99,
      category: 'Electronics',
      stockQuantity: 10
    };
  });

  describe('Product Creation', () => {
    it('should create product with correct initial values', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );

      expect(product.id).toBeTruthy();
      expect(typeof product.id).toBe('string');
      expect(product.name).toBe(validProductData.name);
      expect(product.description).toBe(validProductData.description);
      expect(product.price).toBe(validProductData.price);
      expect(product.category).toBe(validProductData.category);
      expect(product.stockQuantity).toBe(validProductData.stockQuantity);
      expect(product.active).toBe(true);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        new Product('', validProductData.description, validProductData.price, 
                   validProductData.category, validProductData.stockQuantity);
      }).toThrow('Product name cannot be empty');
    });

    it('should throw error when description is empty', () => {
      expect(() => {
        new Product(validProductData.name, '', validProductData.price, 
                   validProductData.category, validProductData.stockQuantity);
      }).toThrow('Product description cannot be empty');
    });

    it('should throw error when price is zero or negative', () => {
      expect(() => {
        new Product(validProductData.name, validProductData.description, 0, 
                   validProductData.category, validProductData.stockQuantity);
      }).toThrow('Product price must be positive');

      expect(() => {
        new Product(validProductData.name, validProductData.description, -100, 
                   validProductData.category, validProductData.stockQuantity);
      }).toThrow('Product price must be positive');
    });

    it('should throw error when category is empty', () => {
      expect(() => {
        new Product(validProductData.name, validProductData.description, 
                   validProductData.price, '', validProductData.stockQuantity);
      }).toThrow('Product category cannot be empty');
    });

    it('should throw error when stock quantity is negative', () => {
      expect(() => {
        new Product(validProductData.name, validProductData.description, 
                   validProductData.price, validProductData.category, -1);
      }).toThrow('Stock quantity cannot be negative');
    });

    it('should throw error when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => {
        new Product(longName, validProductData.description, 
                   validProductData.price, validProductData.category, validProductData.stockQuantity);
      }).toThrow('Product name cannot exceed 100 characters');
    });
  });

  describe('Stock Management', () => {
    let product: Product;

    beforeEach(() => {
      product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );
    });

    it('should have stock when quantity is greater than zero', () => {
      expect(product.hasStock()).toBe(true);
    });

    it('should not have stock when quantity is zero', () => {
      const productWithoutStock = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        0
      );
      
      expect(productWithoutStock.hasStock()).toBe(false);
    });

    it('should decrease stock correctly', () => {
      const initialStock = product.stockQuantity;
      const decreaseAmount = 3;
      
      product.decreaseStock(decreaseAmount);
      
      expect(product.stockQuantity).toBe(initialStock - decreaseAmount);
    });

    it('should throw error when decreasing more stock than available', () => {
      expect(() => {
        product.decreaseStock(15); // More than available (10)
      }).toThrow('Insufficient stock');
    });

    it('should throw error when decreasing zero or negative stock', () => {
      expect(() => {
        product.decreaseStock(0);
      }).toThrow('Quantity must be positive');

      expect(() => {
        product.decreaseStock(-5);
      }).toThrow('Quantity must be positive');
    });

    it('should increase stock correctly', () => {
      const initialStock = product.stockQuantity;
      const increaseAmount = 5;
      
      product.increaseStock(increaseAmount);
      
      expect(product.stockQuantity).toBe(initialStock + increaseAmount);
    });

    it('should throw error when increasing zero or negative stock', () => {
      expect(() => {
        product.increaseStock(0);
      }).toThrow('Quantity must be positive');

      expect(() => {
        product.increaseStock(-3);
      }).toThrow('Quantity must be positive');
    });

    it('should correctly identify low stock', () => {
      const lowStockProduct = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        3 // Low stock
      );

      expect(lowStockProduct.isLowStock()).toBe(true);
      expect(product.isLowStock()).toBe(false); // Has 10 units
    });
  });

  describe('Product Updates', () => {
    let product: Product;

    beforeEach(() => {
      product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );
    });

    it('should update price correctly', () => {
      const newPrice = 1499.99;
      
      product.updatePrice(newPrice);
      
      expect(product.price).toBe(newPrice);
    });

    it('should throw error when updating to zero or negative price', () => {
      expect(() => {
        product.updatePrice(0);
      }).toThrow('Price must be positive');

      expect(() => {
        product.updatePrice(-100);
      }).toThrow('Price must be positive');
    });

    it('should update details correctly', () => {
      const newName = 'Updated Laptop';
      const newDescription = 'Updated description';
      
      product.updateDetails(newName, newDescription);
      
      expect(product.name).toBe(newName);
      expect(product.description).toBe(newDescription);
    });

    it('should activate and deactivate product', () => {
      product.deactivate();
      expect(product.active).toBe(false);
      
      product.activate();
      expect(product.active).toBe(true);
    });
  });

  describe('Business Logic Methods', () => {
    let product: Product;

    beforeEach(() => {
      product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );
    });

    it('should calculate discounted price correctly', () => {
      const discount = 20; // 20%
      const expectedPrice = validProductData.price * 0.8;
      
      const discountedPrice = product.calculateDiscountedPrice(discount);
      
      expect(discountedPrice).toBe(expectedPrice);
    });

    it('should throw error for invalid discount percentage', () => {
      expect(() => {
        product.calculateDiscountedPrice(-10);
      }).toThrow('Discount percentage must be between 0 and 100');

      expect(() => {
        product.calculateDiscountedPrice(150);
      }).toThrow('Discount percentage must be between 0 and 100');
    });

    it('should correctly identify expensive products', () => {
      expect(product.isExpensive()).toBe(true); // Price is 1299.99

      const cheapProduct = new Product(
        'Cheap Item',
        'Description',
        50,
        'Category',
        10
      );
      
      expect(cheapProduct.isExpensive()).toBe(false);
    });
  });

  describe('Persistence Methods', () => {
    it('should convert to persistence format correctly', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );

      const persistenceData = product.toPersistence();

      expect(persistenceData.id).toBe(product.id);
      expect(persistenceData.name).toBe(product.name);
      expect(persistenceData.description).toBe(product.description);
      expect(persistenceData.price).toBe(product.price);
      expect(persistenceData.category).toBe(product.category);
      expect(persistenceData.stockQuantity).toBe(product.stockQuantity);
      expect(persistenceData.active).toBe(product.active);
      expect(persistenceData.createdAt).toBe(product.createdAt);
      expect(persistenceData.updatedAt).toBe(product.updatedAt);
    });

    it('should convert to DTO format correctly', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );

      const dto = product.toDto();

      expect(dto.id).toBe(product.id);
      expect(dto.name).toBe(product.name);
      expect(dto.hasStock).toBe(true);
      expect(dto.isLowStock).toBe(false);
      expect(dto.isExpensive).toBe(true);
    });
  });
});