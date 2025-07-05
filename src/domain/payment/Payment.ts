// src/domain/payment/Payment.ts
import { v4 as uuidv4 } from 'uuid';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  gatewayResponse?: any;
}

export class Payment {
  private readonly _id: string;
  private readonly _orderId: string;
  private readonly _customerId: string;
  private _amount: number;
  private _currency: string;
  private _method: PaymentMethod;
  private _status: PaymentStatus;
  private _transactionId?: string;
  private _gatewayResponse?: any;
  private _errorMessage?: string;
  private _description?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    orderId: string,
    customerId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
    description?: string,
    id?: string
  ) {
    this._id = id ?? ''; // Empty string for new payments, MongoDB will generate _id
    this._orderId = orderId;
    this._customerId = customerId;
    this._amount = amount;
    this._currency = currency;
    this._method = method;
    this._status = PaymentStatus.PENDING;
    this._description = description;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  // Getters
  get id(): string { return this._id; }
  get orderId(): string { return this._orderId; }
  get customerId(): string { return this._customerId; }
  get amount(): number { return this._amount; }
  get currency(): string { return this._currency; }
  get method(): PaymentMethod { return this._method; }
  get status(): PaymentStatus { return this._status; }
  get transactionId(): string | undefined { return this._transactionId; }
  get gatewayResponse(): any { return this._gatewayResponse; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get description(): string | undefined { return this._description; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Logic Methods
  public canBeProcessed(): boolean {
    return this._status === PaymentStatus.PENDING;
  }

  public canBeRefunded(): boolean {
    return this._status === PaymentStatus.COMPLETED;
  }

  public canBeCancelled(): boolean {
    return [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this._status);
  }

  public process(): void {
    if (!this.canBeProcessed()) {
      throw new Error('Payment cannot be processed in current status');
    }

    this._status = PaymentStatus.PROCESSING;
    this._updatedAt = new Date();
  }

  public complete(transactionId: string, gatewayResponse?: any): void {
    if (this._status !== PaymentStatus.PROCESSING) {
      throw new Error('Payment can only be completed from PROCESSING status');
    }

    this._status = PaymentStatus.COMPLETED;
    this._transactionId = transactionId;
    this._gatewayResponse = gatewayResponse;
    this._updatedAt = new Date();
  }

  public fail(errorMessage: string, gatewayResponse?: any): void {
    if (![PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this._status)) {
      throw new Error('Payment cannot be failed in current status');
    }

    this._status = PaymentStatus.FAILED;
    this._errorMessage = errorMessage;
    this._gatewayResponse = gatewayResponse;
    this._updatedAt = new Date();
  }

  public cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error('Payment cannot be cancelled in current status');
    }

    this._status = PaymentStatus.CANCELLED;
    this._errorMessage = reason || 'Payment cancelled';
    this._updatedAt = new Date();
  }

  public refund(reason?: string): void {
    if (!this.canBeRefunded()) {
      throw new Error('Payment cannot be refunded in current status');
    }

    this._status = PaymentStatus.REFUNDED;
    this._errorMessage = reason || 'Payment refunded';
    this._updatedAt = new Date();
  }

  public updateAmount(newAmount: number): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error('Payment amount can only be updated when pending');
    }

    if (newAmount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    this._amount = newAmount;
    this._updatedAt = new Date();
  }

  private validateInvariants(): void {
    if (!this._orderId || this._orderId.trim().length === 0) {
      throw new Error('Order ID is required');
    }

    if (!this._customerId || this._customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }

    if (this._amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    if (!this._currency || this._currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    if (this._currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }

  // Factory method for reconstruction from persistence
  public static fromPersistence(data: {
    id: string;
    orderId: string;
    customerId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    gatewayResponse?: any;
    errorMessage?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    const payment = new Payment(
      data.orderId,
      data.customerId,
      data.amount,
      data.currency,
      data.method,
      data.description,
      data.id
    );
    
    // Override the _id with the MongoDB _id
    (payment as any)._id = data.id;
    payment._status = data.status;
    payment._transactionId = data.transactionId;
    payment._gatewayResponse = data.gatewayResponse;
    payment._errorMessage = data.errorMessage;
    payment._updatedAt = data.updatedAt;
    
    return payment;
  }

  // Convert to plain object for persistence
  public toPersistence(): {
    id?: string;
    orderId: string;
    customerId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    gatewayResponse?: any;
    errorMessage?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    const data: any = {
      orderId: this._orderId,
      customerId: this._customerId,
      amount: this._amount,
      currency: this._currency,
      method: this._method,
      status: this._status,
      transactionId: this._transactionId,
      gatewayResponse: this._gatewayResponse,
      errorMessage: this._errorMessage,
      description: this._description,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };

    // Only include id if it's not a new payment (has been saved before)
    if (this._id && this._id !== '') {
      data.id = this._id;
    }

    return data;
  }

  // Convert to DTO for API responses
  public toDto(): {
    id: string;
    orderId: string;
    customerId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    errorMessage?: string;
    description?: string;
    canBeProcessed: boolean;
    canBeRefunded: boolean;
    canBeCancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      orderId: this._orderId,
      customerId: this._customerId,
      amount: this._amount,
      currency: this._currency,
      method: this._method,
      status: this._status,
      transactionId: this._transactionId,
      errorMessage: this._errorMessage,
      description: this._description,
      canBeProcessed: this.canBeProcessed(),
      canBeRefunded: this.canBeRefunded(),
      canBeCancelled: this.canBeCancelled(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 