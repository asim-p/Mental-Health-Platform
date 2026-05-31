import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import therapistRoutes from './routes/therapists.js';
import appointmentRoutes from './routes/appointments.js';
import screeningRoutes from './routes/screening.js';
import chatRoutes from './routes/chat.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setIO } from './socket.js';

import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';

dotenv.config();

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

setIO(io);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_appointment', (appointmentId) => {
    socket.join(`appointment:${appointmentId}`);
    console.log(`Socket ${socket.id} joined appointment:${appointmentId}`);
  });

  socket.on('leave_appointment', (appointmentId) => {
    socket.leave(`appointment:${appointmentId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`appointment:${data.appointmentId}`).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Auto-complete confirmed appointments whose scheduled time + duration has passed
const autoCompleteAppointments = async () => {
  try {
    await Appointment.updateMany(
      {
        status: 'CONFIRMED',
        $expr: {
          $lt: [
            { $add: ['$scheduledAt', { $multiply: [{ $ifNull: ['$duration', 60] }, 60000] }] },
            new Date(),
          ],
        },
      },
      { $set: { status: 'COMPLETED' } }
    );
  } catch (err) {
    console.error('Auto-complete error:', err);
  }
};

// Run once on startup, then every 5 minutes
autoCompleteAppointments();
setInterval(autoCompleteAppointments, 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
