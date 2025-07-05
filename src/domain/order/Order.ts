// src/domain/order/Order.ts
import { v4 as uuidv4 } from 'uuid';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderHistory {
  status: OrderStatus;
  timestamp: Date;
  notes?: string;
}

export class Order {
  private readonly _id: string;
  private readonly _customerId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _total: number;
  private _shippingAddress: ShippingAddress;
  private _paymentMethod: PaymentMethod;
  private _trackingNumber?: string;
  private _orderHistory: OrderHistory[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    customerId: string,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod,
    id?: string
  ) {
    this._id = id ?? ''; // Empty string for new orders, MongoDB will generate _id
    this._customerId = customerId;
    this._items = items;
    this._shippingAddress = shippingAddress;
    this._paymentMethod = paymentMethod;
    this._status = OrderStatus.PENDING;
    this._total = this.calculateTotal();
    this._orderHistory = [{
      status: OrderStatus.PENDING,
      timestamp: new Date()
    }];
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  // Getters
  get id(): string { return this._id; }
  get customerId(): string { return this._customerId; }
  get items(): OrderItem[] { return [...this._items]; }
  get status(): OrderStatus { return this._status; }
  get total(): number { return this._total; }
  get shippingAddress(): ShippingAddress { return { ...this._shippingAddress }; }
  get paymentMethod(): PaymentMethod { return this._paymentMethod; }
  get trackingNumber(): string | undefined { return this._trackingNumber; }
  get orderHistory(): OrderHistory[] { return [...this._orderHistory]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Logic Methods
  public canBeModified(): boolean {
    return this._status === OrderStatus.PENDING;
  }

  public canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this._status);
  }

  public addItem(item: OrderItem): void {
    if (!this.canBeModified()) {
      throw new Error('Order cannot be modified in current status');
    }

    const existingItemIndex = this._items.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      this._items[existingItemIndex].quantity += item.quantity;
      this._items[existingItemIndex].subtotal = this._items[existingItemIndex].quantity * this._items[existingItemIndex].unitPrice;
    } else {
      // Add new item
      this._items.push(item);
    }

    this._total = this.calculateTotal();
    this._updatedAt = new Date();
  }

  public removeItem(productId: string): void {
    if (!this.canBeModified()) {
      throw new Error('Order cannot be modified in current status');
    }

    this._items = this._items.filter(item => item.productId !== productId);
    
    if (this._items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    this._total = this.calculateTotal();
    this._updatedAt = new Date();
  }

  public updateItemQuantity(productId: string, quantity: number): void {
    if (!this.canBeModified()) {
      throw new Error('Order cannot be modified in current status');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    const item = this._items.find(i => i.productId === productId);
    if (!item) {
      throw new Error('Item not found in order');
    }

    item.quantity = quantity;
    item.subtotal = quantity * item.unitPrice;
    this._total = this.calculateTotal();
    this._updatedAt = new Date();
  }

  public confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Order can only be confirmed from PENDING status');
    }

    this._status = OrderStatus.CONFIRMED;
    this.addToHistory(OrderStatus.CONFIRMED, 'Order confirmed');
    this._updatedAt = new Date();
  }

  public process(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Order can only be processed from CONFIRMED status');
    }

    this._status = OrderStatus.PROCESSING;
    this.addToHistory(OrderStatus.PROCESSING, 'Order being processed');
    this._updatedAt = new Date();
  }

  public ship(trackingNumber: string): void {
    if (this._status !== OrderStatus.PROCESSING) {
      throw new Error('Order can only be shipped from PROCESSING status');
    }

    this._status = OrderStatus.SHIPPED;
    this._trackingNumber = trackingNumber;
    this.addToHistory(OrderStatus.SHIPPED, `Order shipped with tracking: ${trackingNumber}`);
    this._updatedAt = new Date();
  }

  public deliver(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error('Order can only be delivered from SHIPPED status');
    }

    this._status = OrderStatus.DELIVERED;
    this.addToHistory(OrderStatus.DELIVERED, 'Order delivered successfully');
    this._updatedAt = new Date();
  }

  public cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in current status');
    }

    this._status = OrderStatus.CANCELLED;
    this.addToHistory(OrderStatus.CANCELLED, reason || 'Order cancelled');
    this._updatedAt = new Date();
  }

  public updateShippingAddress(address: ShippingAddress): void {
    if (!this.canBeModified()) {
      throw new Error('Order cannot be modified in current status');
    }

    this._shippingAddress = address;
    this._updatedAt = new Date();
  }

  public updatePaymentMethod(method: PaymentMethod): void {
    if (!this.canBeModified()) {
      throw new Error('Order cannot be modified in current status');
    }

    this._paymentMethod = method;
    this._updatedAt = new Date();
  }

  private calculateTotal(): number {
    return this._items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  private addToHistory(status: OrderStatus, notes?: string): void {
    this._orderHistory.push({
      status,
      timestamp: new Date(),
      notes
    });
  }

  private validateInvariants(): void {
    if (!this._customerId || this._customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }

    if (!this._items || this._items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    if (!this._shippingAddress) {
      throw new Error('Shipping address is required');
    }

    if (!this._shippingAddress.street || !this._shippingAddress.city || 
        !this._shippingAddress.state || !this._shippingAddress.zipCode || 
        !this._shippingAddress.country) {
      throw new Error('Complete shipping address is required');
    }

    if (this._total <= 0) {
      throw new Error('Order total must be positive');
    }
  }

    // Factory method for reconstruction from persistence
  public static fromPersistence(data: {
    id: string;
    customerId: string;
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    trackingNumber?: string;
    orderHistory: OrderHistory[];
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    const order = new Order(
      data.customerId,
      data.items,
      data.shippingAddress,
      data.paymentMethod,
      data.id
    );

    // Override the _id with the MongoDB _id
    (order as any)._id = data.id;
    order._status = data.status;
    order._total = data.total;
    order._trackingNumber = data.trackingNumber;
    order._orderHistory = data.orderHistory;
    order._updatedAt = data.updatedAt;

    return order;
  }

  // Convert to plain object for persistence
  public toPersistence(): {
    id?: string;
    customerId: string;
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    trackingNumber?: string;
    orderHistory: OrderHistory[];
    createdAt: Date;
    updatedAt: Date;
  } {
    const data: any = {
      customerId: this._customerId,
      items: this._items,
      status: this._status,
      total: this._total,
      shippingAddress: this._shippingAddress,
      paymentMethod: this._paymentMethod,
      trackingNumber: this._trackingNumber,
      orderHistory: this._orderHistory,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };

    // Only include id if it's not a new order (has been saved before)
    if (this._id && this._id !== '') {
      data.id = this._id;
    }

    return data;
  }

  // Convert to DTO for API responses
  public toDto(): {
    id: string;
    customerId: string;
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    trackingNumber?: string;
    orderHistory: OrderHistory[];
    canBeModified: boolean;
    canBeCancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      customerId: this._customerId,
      items: this._items,
      status: this._status,
      total: this._total,
      shippingAddress: this._shippingAddress,
      paymentMethod: this._paymentMethod,
      trackingNumber: this._trackingNumber,
      orderHistory: this._orderHistory,
      canBeModified: this.canBeModified(),
      canBeCancelled: this.canBeCancelled(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 