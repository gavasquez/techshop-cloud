import { NotificationRepository } from '../../../domain/notification/NotificationRepository';
import { Notification } from '../../../domain/notification/Notification';
import { NotificationModel } from './NotificationSchema';

export class NotificationMongoRepository implements NotificationRepository {
  async save(notification: Notification): Promise<Notification> {
    const notificationData = notification.toPersistence();
    
    if (notificationData.id) {
      // Update existing notification using MongoDB _id
      const updated = await NotificationModel.findByIdAndUpdate(
        notificationData.id,
        notificationData,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('Notification not found');
      }
      
      return this.mapToNotification(updated);
    } else {
      // Create new notification - MongoDB will generate _id automatically
      const { id, ...notificationDataWithoutId } = notificationData; // Remove id field for new notifications
      const created = await NotificationModel.create(notificationDataWithoutId);
      return this.mapToNotification(created);
    }
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await NotificationModel.findById(id);
    return notification ? this.mapToNotification(notification) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async findByStatus(status: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ status }).sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async findByType(type: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ type }).sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async findPendingNotifications(): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async findAll(): Promise<Notification[]> {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async delete(id: string): Promise<void> {
    await NotificationModel.findByIdAndDelete(id);
  }

  private mapToNotification(doc: any): Notification {
    const data = doc.toObject();
    return Notification.fromPersistence({
      id: data._id.toString(), // MongoDB ObjectId converted to string
      userId: data.userId,
      type: data.type,
      channel: data.channel,
      content: data.content,
      status: data.status,
      sentAt: data.sentAt,
      readAt: data.readAt,
      errorMessage: data.errorMessage,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
} 