// src/domain/notification/Notification.ts
import { v4 as uuidv4 } from 'uuid';

export enum NotificationType {
  ORDER_STATUS = 'ORDER_STATUS',
  PAYMENT_STATUS = 'PAYMENT_STATUS',
  STOCK_ALERT = 'STOCK_ALERT',
  SECURITY_ALERT = 'SECURITY_ALERT',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

export interface NotificationContent {
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class Notification {
  private readonly _id: string;
  private readonly _userId: string;
  private _type: NotificationType;
  private _channel: NotificationChannel;
  private _content: NotificationContent;
  private _status: NotificationStatus;
  private _sentAt?: Date;
  private _readAt?: Date;
  private _errorMessage?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    content: NotificationContent,
    id?: string
  ) {
    this._id = id ?? ''; // Empty string for new notifications, MongoDB will generate _id
    this._userId = userId;
    this._type = type;
    this._channel = channel;
    this._content = content;
    this._status = NotificationStatus.PENDING;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validateInvariants();
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get type(): NotificationType { return this._type; }
  get channel(): NotificationChannel { return this._channel; }
  get content(): NotificationContent { return { ...this._content }; }
  get status(): NotificationStatus { return this._status; }
  get sentAt(): Date | undefined { return this._sentAt; }
  get readAt(): Date | undefined { return this._readAt; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Logic Methods
  public canBeSent(): boolean {
    return this._status === NotificationStatus.PENDING;
  }

  public canBeRead(): boolean {
    return this._status === NotificationStatus.SENT;
  }

  public markAsSent(): void {
    if (!this.canBeSent()) {
      throw new Error('Notification cannot be marked as sent in current status');
    }

    this._status = NotificationStatus.SENT;
    this._sentAt = new Date();
    this._updatedAt = new Date();
  }

  public markAsFailed(errorMessage: string): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('Notification can only be marked as failed when pending');
    }

    this._status = NotificationStatus.FAILED;
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  public markAsRead(): void {
    if (!this.canBeRead()) {
      throw new Error('Notification cannot be marked as read in current status');
    }

    this._status = NotificationStatus.READ;
    this._readAt = new Date();
    this._updatedAt = new Date();
  }

  public updateContent(content: NotificationContent): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('Notification content can only be updated when pending');
    }

    this._content = content;
    this._updatedAt = new Date();
  }

  public isUrgent(): boolean {
    return [
      NotificationType.SECURITY_ALERT,
      NotificationType.STOCK_ALERT
    ].includes(this._type);
  }

  public getPriority(): 'high' | 'medium' | 'low' {
    if (this.isUrgent()) return 'high';
    if (this._type === NotificationType.ORDER_STATUS) return 'medium';
    return 'low';
  }

  private validateInvariants(): void {
    if (!this._userId || this._userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!this._content.title || this._content.title.trim().length === 0) {
      throw new Error('Notification title is required');
    }

    if (!this._content.message || this._content.message.trim().length === 0) {
      throw new Error('Notification message is required');
    }

    if (this._content.title.length > 100) {
      throw new Error('Notification title cannot exceed 100 characters');
    }

    if (this._content.message.length > 500) {
      throw new Error('Notification message cannot exceed 500 characters');
    }
  }

  // Factory method for reconstruction from persistence
  public static fromPersistence(data: {
    id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    content: NotificationContent;
    status: NotificationStatus;
    sentAt?: Date;
    readAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Notification {
    const notification = new Notification(
      data.userId,
      data.type,
      data.channel,
      data.content,
      data.id
    );
    
    // Override the _id with the MongoDB _id
    (notification as any)._id = data.id;
    notification._status = data.status;
    notification._sentAt = data.sentAt;
    notification._readAt = data.readAt;
    notification._errorMessage = data.errorMessage;
    notification._updatedAt = data.updatedAt;
    
    return notification;
  }

  // Convert to plain object for persistence
  public toPersistence(): {
    id?: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    content: NotificationContent;
    status: NotificationStatus;
    sentAt?: Date;
    readAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    const data: any = {
      userId: this._userId,
      type: this._type,
      channel: this._channel,
      content: this._content,
      status: this._status,
      sentAt: this._sentAt,
      readAt: this._readAt,
      errorMessage: this._errorMessage,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };

    // Only include id if it's not a new notification (has been saved before)
    if (this._id && this._id !== '') {
      data.id = this._id;
    }

    return data;
  }

  // Convert to DTO for API responses
  public toDto(): {
    id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    content: NotificationContent;
    status: NotificationStatus;
    sentAt?: Date;
    readAt?: Date;
    errorMessage?: string;
    isUrgent: boolean;
    priority: 'high' | 'medium' | 'low';
    canBeSent: boolean;
    canBeRead: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      userId: this._userId,
      type: this._type,
      channel: this._channel,
      content: this._content,
      status: this._status,
      sentAt: this._sentAt,
      readAt: this._readAt,
      errorMessage: this._errorMessage,
      isUrgent: this.isUrgent(),
      priority: this.getPriority(),
      canBeSent: this.canBeSent(),
      canBeRead: this.canBeRead(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 