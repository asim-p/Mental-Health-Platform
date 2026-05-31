import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
import User from './src/models/User.js';
import PatientProfile from './src/models/PatientProfile.js';
import TherapistProfile from './src/models/TherapistProfile.js';
import Availability from './src/models/Availability.js';
import Appointment from './src/models/Appointment.js';
import Payment from './src/models/Payment.js';
import ScreeningResult from './src/models/ScreeningResult.js';
import Notification from './src/models/Notification.js';
import ChatMessage from './src/models/ChatMessage.js';

// ── Connect ───────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.DATABASE_URL);
console.log('Connected to MongoDB');

// ── Clear all collections ────────────────────────────────────────────────────
await Promise.all([
  User.deleteMany({}),
  PatientProfile.deleteMany({}),
  TherapistProfile.deleteMany({}),
  Availability.deleteMany({}),
  Appointment.deleteMany({}),
  Payment.deleteMany({}),
  ScreeningResult.deleteMany({}),
  Notification.deleteMany({}),
  ChatMessage.deleteMany({}),
]);
console.log('All collections cleared');

const hash = (pw) => bcrypt.hash(pw, 12);

// ── Admin ─────────────────────────────────────────────────────────────────────
const adminUser = await User.create({
  email: 'admin@mhp.com',
  password: await hash('Admin@1234'),
  firstName: 'System',
  lastName: 'Admin',
  role: 'ADMIN',
});
console.log('Admin created');

// ── Therapists ────────────────────────────────────────────────────────────────
const therapistData = [
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@mhp.com',
    phone: '9841000001',
    profile: {
      specialization: ['Depression', 'Anxiety'],
      qualifications: ['MA Clinical Psychology', 'PhD Counselling'],
      yearsOfExperience: 8,
      bio: 'I specialize in cognitive-behavioral therapy for depression and anxiety disorders. My approach is empathetic and solution-focused, helping clients develop practical coping strategies for lasting change.',
      hourlyRate: 2000,
      gender: 'Female',
      languages: ['Nepali', 'English'],
      licenseNumber: 'NPC-2016-0042',
      isVerified: true,
    },
  },
  {
    firstName: 'Rohan',
    lastName: 'Shrestha',
    email: 'rohan.shrestha@mhp.com',
    phone: '9841000002',
    profile: {
      specialization: ['Stress', 'Bipolar'],
      qualifications: ['MSc Psychology', 'Certificate in DBT'],
      yearsOfExperience: 6,
      bio: 'I work with clients experiencing high stress and mood disorders including bipolar disorder. I use dialectical behavior therapy and mindfulness techniques to help individuals regulate emotions and improve relationships.',
      hourlyRate: 1500,
      gender: 'Male',
      languages: ['Nepali', 'English', 'Newari'],
      licenseNumber: 'NPC-2018-0087',
      isVerified: true,
    },
  },
  {
    firstName: 'Sunita',
    lastName: 'Tamang',
    email: 'sunita.tamang@mhp.com',
    phone: '9841000003',
    profile: {
      specialization: ['Anxiety', 'Personality disorder'],
      qualifications: ['MA Counselling Psychology', 'Trauma-Informed Care Certification'],
      yearsOfExperience: 10,
      bio: 'With over a decade of experience, I focus on anxiety disorders and personality-related concerns. I create a safe, non-judgmental space where clients can explore their thoughts and develop healthier patterns of behavior.',
      hourlyRate: 2500,
      gender: 'Female',
      languages: ['Nepali', 'English'],
      licenseNumber: 'NPC-2014-0019',
      isVerified: true,
    },
  },
  {
    firstName: 'Bikash',
    lastName: 'Adhikari',
    email: 'bikash.adhikari@mhp.com',
    phone: '9841000004',
    profile: {
      specialization: ['Depression', 'Suicidal', 'General Consultation'],
      qualifications: ['MBBS', 'MD Psychiatry'],
      yearsOfExperience: 12,
      bio: 'As a trained psychiatrist, I handle complex cases including severe depression and suicidal ideation. I combine pharmacological and psychotherapeutic approaches, prioritizing patient safety and long-term recovery.',
      hourlyRate: 1800,
      gender: 'Male',
      languages: ['Nepali', 'English'],
      licenseNumber: 'NMC-2012-0331',
      isVerified: true,
    },
  },
  {
    firstName: 'Anjali',
    lastName: 'Gurung',
    email: 'anjali.gurung@mhp.com',
    phone: '9841000005',
    profile: {
      specialization: ['General Consultation', 'Stress'],
      qualifications: ['BSc Psychology', 'MA Counselling'],
      yearsOfExperience: 4,
      bio: 'I offer general mental health consultations and stress management counselling. I believe in a holistic approach, addressing the physical, emotional, and social aspects of a person\'s well-being.',
      hourlyRate: 1200,
      gender: 'Female',
      languages: ['Nepali', 'Newari', 'English'],
      licenseNumber: 'NPC-2020-0156',
      isVerified: true,
    },
  },
];

const therapistPw = await hash('Therapist@1234');
const therapistProfiles = [];

for (const t of therapistData) {
  const user = await User.create({
    email: t.email,
    password: therapistPw,
    firstName: t.firstName,
    lastName: t.lastName,
    phone: t.phone,
    role: 'THERAPIST',
  });

  const profile = await TherapistProfile.create({ user: user._id, ...t.profile });
  therapistProfiles.push({ user, profile });
}
console.log('Therapists created');

// ── Availability (Mon–Fri, 9:00–16:00 in 1-hr slots) ─────────────────────────
const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const weekdays = [1, 2, 3, 4, 5]; // Mon–Fri

const availabilityDocs = [];
for (const { profile } of therapistProfiles) {
  for (const day of weekdays) {
    for (const time of timeSlots) {
      availabilityDocs.push({ therapistId: profile._id, dayOfWeek: day, time, isAvailable: true });
    }
  }
}
await Availability.insertMany(availabilityDocs);
console.log('Availability created');

// ── Patients ──────────────────────────────────────────────────────────────────
const patientData = [
  { firstName: 'Aarav',  lastName: 'Poudel', email: 'aarav.poudel@mhp.com',  phone: '9851000001', gender: 'Male',   preferredLanguage: 'Nepali' },
  { firstName: 'Sita',   lastName: 'Rai',    email: 'sita.rai@mhp.com',       phone: '9851000002', gender: 'Female', preferredLanguage: 'English' },
  { firstName: 'Kiran',  lastName: 'Thapa',  email: 'kiran.thapa@mhp.com',    phone: '9851000003', gender: 'Male',   preferredLanguage: 'Nepali' },
  { firstName: 'Maya',   lastName: 'Karki',  email: 'maya.karki@mhp.com',     phone: '9851000004', gender: 'Female', preferredLanguage: 'Nepali' },
  { firstName: 'Dipesh', lastName: 'Magar',  email: 'dipesh.magar@mhp.com',   phone: '9851000005', gender: 'Male',   preferredLanguage: 'English' },
];

const patientPw = await hash('Patient@1234');
const patientProfiles = [];

for (const p of patientData) {
  const user = await User.create({
    email: p.email,
    password: patientPw,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    role: 'PATIENT',
  });

  const profile = await PatientProfile.create({
    user: user._id,
    gender: p.gender,
    preferredLanguage: p.preferredLanguage,
    lastScreeningAt: new Date(),
  });
  patientProfiles.push({ user, profile });
}
console.log('Patients created');

// ── Appointments & Payments ───────────────────────────────────────────────────
const now = new Date();

const cleanDate = (daysFromNow, hour) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const appointmentSeeds = [
  // Confirmed upcoming sessions
  {
    patientIdx: 0,
    therapistIdx: 0,
    scheduledAt: cleanDate(2, 10),
    status: 'PAID',
    aiPrediction: 'Anxiety',
  },
  {
    patientIdx: 1,
    therapistIdx: 2,
    scheduledAt: cleanDate(4, 14),
    status: 'PAID',
    aiPrediction: 'Anxiety',
  },
  {
    patientIdx: 2,
    therapistIdx: 1,
    scheduledAt: cleanDate(6, 11),
    status: 'PAID',
    aiPrediction: 'Stress',
  },
  // Paid (awaiting therapist confirmation)
  {
    patientIdx: 3,
    therapistIdx: 3,
    scheduledAt: cleanDate(3, 9),
    status: 'PAID',
    aiPrediction: 'Depression',
  },
  {
    patientIdx: 4,
    therapistIdx: 4,
    scheduledAt: cleanDate(5, 15),
    status: 'PAID',
    aiPrediction: 'Stress',
  },
  // Pending (not yet paid)
  {
    patientIdx: 0,
    therapistIdx: 1,
    scheduledAt: cleanDate(9, 10),
    status: 'PENDING',
    aiPrediction: 'Anxiety',
  },
  // Completed past sessions
  {
    patientIdx: 0,
    therapistIdx: 0,
    scheduledAt: cleanDate(-7, 10),
    status: 'COMPLETED',
    aiPrediction: 'Anxiety',
    therapistNote: 'Patient demonstrated significant improvement in recognizing anxiety triggers. Recommended daily mindfulness exercises and journaling. Follow-up in 2 weeks to assess progress.',
  },
  {
    patientIdx: 1,
    therapistIdx: 2,
    scheduledAt: cleanDate(-14, 14),
    status: 'COMPLETED',
    aiPrediction: 'Anxiety',
    therapistNote: 'First session. Patient presented with generalised anxiety. Discussed CBT framework and assigned thought-monitoring homework.',
  },
  {
    patientIdx: 2,
    therapistIdx: 1,
    scheduledAt: cleanDate(-5, 11),
    status: 'COMPLETED',
    aiPrediction: 'Stress',
    therapistNote: 'Work-related stress is the primary concern. Introduced progressive muscle relaxation techniques. Patient responded positively.',
  },
  {
    patientIdx: 4,
    therapistIdx: 3,
    scheduledAt: cleanDate(-10, 9),
    status: 'COMPLETED',
    aiPrediction: 'Depression',
    therapistNote: 'Patient shows moderate depressive symptoms. Started structured activity scheduling. Discussed sleep hygiene improvement strategies.',
  },
  // Cancelled
  {
    patientIdx: 3,
    therapistIdx: 4,
    scheduledAt: cleanDate(1, 16),
    status: 'CANCELLED',
    aiPrediction: 'Stress',
    notes: 'Cancellation reason: Patient unavailable due to emergency',
  },
];

for (const seed of appointmentSeeds) {
  const patient = patientProfiles[seed.patientIdx];
  const therapist = therapistProfiles[seed.therapistIdx];
  const amount = therapist.profile.hourlyRate;

  // Create appointment first (no paymentId yet)
  const appt = await Appointment.create({
    patientId: patient.profile._id,
    therapistId: therapist.profile._id,
    scheduledAt: seed.scheduledAt,
    duration: 60,
    status: seed.status,
    aiPrediction: seed.aiPrediction,
    notes: seed.notes || undefined,
    therapistNote: seed.therapistNote || undefined,
    zoomJoinUrl: seed.zoomJoinUrl || undefined,
    zoomMeetingUrl: seed.zoomMeetingUrl || undefined,
  });

  // Create payment linked to appointment
  const payment = await Payment.create({
    appointmentId: appt._id,
    amount,
    paymentMethod: 'esewa',
    transactionId: `MHP${Date.now()}${Math.floor(Math.random() * 9999)}`,
    status: ['CONFIRMED', 'COMPLETED', 'PAID'].includes(seed.status) ? 'COMPLETED' : 'PENDING',
    esewaRefId: ['CONFIRMED', 'COMPLETED'].includes(seed.status) ? `ESW${Date.now()}` : undefined,
  });

  // Link payment back to appointment
  await Appointment.findByIdAndUpdate(appt._id, { paymentId: payment._id });
}
console.log('Appointments & payments created');

// ── Screening Results ─────────────────────────────────────────────────────────
const screeningSeeds = [
  { patientIdx: 0, text: 'I suffer from severe anxiety and panic attacks almost every day. I feel anxious and panicked for no clear reason.', category: 'Anxiety', confidence: 0.91 },
  { patientIdx: 1, text: 'I have not felt like myself in months. I have no energy, no motivation, and no interest in anything I used to love.', category: 'Depression', confidence: 0.88 },
  { patientIdx: 2, text: 'Work pressure is overwhelming me. I cannot stop thinking about deadlines and I feel exhausted all the time.', category: 'Stress', confidence: 0.84 },
  { patientIdx: 3, text: 'I have been feeling very low and hopeless. Everything feels pointless and I struggle to get through the day.', category: 'Depression', confidence: 0.79 },
  { patientIdx: 4, text: 'My mood swings are extreme. I go from feeling on top of the world to completely devastated within days.', category: 'Bipolar', confidence: 0.76 },
  { patientIdx: 0, text: 'I feel constantly worried about everything. My heart races and I have trouble sleeping at night.', category: 'Anxiety', confidence: 0.85 },
];

for (const s of screeningSeeds) {
  const patient = patientProfiles[s.patientIdx];
  await ScreeningResult.create({
    patientId: patient.profile._id,
    inputText: s.text,
    predictedCategory: s.category,
    confidence: s.confidence,
  });
}
console.log('Screening results created');

// ── Notifications ─────────────────────────────────────────────────────────────
const notifSeeds = [
  {
    userIdx: 0, // patient Aarav
    isPatient: true,
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Session Confirmed',
    message: 'Your session with Dr. Priya Sharma on ' + new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' is confirmed. Your Zoom link is ready.',
    isRead: false,
  },
  {
    userIdx: 1, // patient Sita
    isPatient: true,
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Session Confirmed',
    message: 'Your session with Dr. Sunita Tamang is confirmed. Your Zoom link is ready.',
    isRead: false,
  },
  {
    userIdx: 0, // therapist Priya
    isPatient: false,
    type: 'APPOINTMENT_BOOKED',
    title: 'New Appointment Request',
    message: 'A patient has booked a session scheduled for ' + new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + '.',
    isRead: false,
  },
  {
    userIdx: 1, // therapist Rohan
    isPatient: false,
    type: 'PAYMENT_RECEIVED',
    title: 'Session Confirmed',
    message: 'Payment received for the session on ' + new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + '. Your Zoom link is ready.',
    isRead: true,
  },
];

for (const n of notifSeeds) {
  const targetUser = n.isPatient
    ? patientProfiles[n.userIdx].user
    : therapistProfiles[n.userIdx].user;

  await Notification.create({
    userId: targetUser._id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
  });
}
console.log('Notifications created');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log('  SEED COMPLETE — LOGIN CREDENTIALS');
console.log('═══════════════════════════════════════════════════════');
console.log('\n  ADMIN');
console.log('  Email:    admin@mhp.com');
console.log('  Password: Admin@1234');
console.log('\n  THERAPISTS  (Password for all: Therapist@1234)');
therapistData.forEach((t, i) => {
  console.log(`  ${i + 1}. Dr. ${t.firstName} ${t.lastName.padEnd(12)} ${t.email}`);
});
console.log('\n  PATIENTS  (Password for all: Patient@1234)');
patientData.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.firstName} ${p.lastName.padEnd(12)} ${p.email}`);
});
console.log('\n═══════════════════════════════════════════════════════\n');

await mongoose.disconnect();
