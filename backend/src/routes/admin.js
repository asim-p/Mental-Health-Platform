import { Router } from 'express';
import User, { UserRole } from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: UserRole.PATIENT });
    const totalTherapists = await User.countDocuments({ role: UserRole.THERAPIST });
    
    const appointments = await Appointment.find().lean();
    
    const appointmentStats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'PENDING').length,
      paid: appointments.filter(a => a.status === 'PAID').length,
      confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    const completedPayments = await Payment.find({ status: 'COMPLETED' }).lean();
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    res.json({
      success: true,
      data: {
        users: {
          total: totalPatients + totalTherapists,
          patients: totalPatients,
          therapists: totalTherapists
        },
        appointments: appointmentStats,
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
