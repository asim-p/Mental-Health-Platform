import { Router } from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Get all notifications for the authenticated user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = notifications.map(({ _id, __v, ...rest }) => ({
      ...rest,
      id: _id.toString(),
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read — must be declared BEFORE /:id/read to avoid Express
// matching the literal string "read-all" as an :id parameter
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Mark a single notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) throw createError('Notification not found', 404);

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Delete a single notification
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) throw createError('Notification not found', 404);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
