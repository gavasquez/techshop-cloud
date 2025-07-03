// src/domain/product/Product.ts
import { v4 as uuidv4 } from 'uuid';

export class Product {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _price: number;
  private _category: string;
  private _stockQuantity: number;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    name: string,
    description: string,
    price: number,
    category: string,
    stockQuantity: number,
    id?: string
  ) {
    this._id = id ?? uuidv4();
    this._name = name;
    this._description = description;
    this._price = price;
    this._category = category;
    this._stockQuantity = stockQuantity;
    this._active = true;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get price(): number { return this._price; }
  get category(): string { return this._category; }
  get stockQuantity(): number { return this._stockQuantity; }
  get active(): boolean { return this._active; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Logic Methods
  public hasStock(): boolean {
    return this._stockQuantity > 0;
  }

  public decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (this._stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    
    this._stockQuantity -= quantity;
    this._updatedAt = new Date();
  }

  public increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    this._stockQuantity += quantity;
    this._updatedAt = new Date();
  }

  public updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('Price must be positive');
    }
    
    this._price = newPrice;
    this._updatedAt = new Date();
  }

  public updateDetails(name: string, description: string): void {
    this._name = name;
    this._description = description;
    this._updatedAt = new Date();
    
    this.validateInvariants();
  }

  public activate(): void {
    this._active = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._active = false;
    this._updatedAt = new Date();
  }

  public calculateDiscountedPrice(discountPercentage: number): number {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    
    return this._price * (1 - discountPercentage / 100);
  }

  public isExpensive(): boolean {
    return this._price > 1000;
  }

  public isLowStock(): boolean {
    return this._stockQuantity <= 5;
  }

  private validateInvariants(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    
    if (!this._description || this._description.trim().length === 0) {
      throw new Error('Product description cannot be empty');
    }
    
    if (this._price <= 0) {
      throw new Error('Product price must be positive');
    }
    
    if (!this._category || this._category.trim().length === 0) {
      throw new Error('Product category cannot be empty');
    }
    
    if (this._stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    if (this._name.length > 100) {
      throw new Error('Product name cannot exceed 100 characters');
    }

    if (this._description.length > 500) {
      throw new Error('Product description cannot exceed 500 characters');
    }
  }

  // Factory method for reconstruction from persistence
  public static fromPersistence(data: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    const product = new Product(
      data.name,
      data.description,
      data.price,
      data.category,
      data.stockQuantity,
      data.id
    );
    
    product._active = data.active;
    product._updatedAt = data.updatedAt;
    
    return product;
  }

  // Convert to plain object for persistence
  public toPersistence(): {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      category: this._category,
      stockQuantity: this._stockQuantity,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  // Convert to DTO for API responses
  public toDto(): {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    active: boolean;
    hasStock: boolean;
    isLowStock: boolean;
    isExpensive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      category: this._category,
      stockQuantity: this._stockQuantity,
      active: this._active,
      hasStock: this.hasStock(),
      isLowStock: this.isLowStock(),
      isExpensive: this.isExpensive(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}