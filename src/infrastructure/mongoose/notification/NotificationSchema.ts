import mongoose from 'mongoose';
import { NotificationType, NotificationStatus, NotificationChannel } from '../../../domain/notification/Notification';

const NotificationContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  channel: { type: String, enum: Object.values(NotificationChannel), required: true },
  content: NotificationContentSchema,
  status: { type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING },
  sentAt: { type: Date },
  readAt: { type: Date },
  errorMessage: { type: String }
}, { timestamps: true });

export const NotificationModel = mongoose.model('Notification', NotificationSchema); 