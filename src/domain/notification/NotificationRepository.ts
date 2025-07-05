import { Notification } from './Notification';

export interface NotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findByStatus(status: string): Promise<Notification[]>;
  findByType(type: string): Promise<Notification[]>;
  findPendingNotifications(): Promise<Notification[]>;
  findAll(): Promise<Notification[]>;
  delete(id: string): Promise<void>;
} 