import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

export async function createNotification({ userId, type, title, message, appointmentId }) {
  const notification = await Notification.create({ userId, type, title, message, appointmentId });

  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification.toJSON());
  }

  return notification;
}
