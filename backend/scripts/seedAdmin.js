import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/mhp_db';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const password = 'password';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      email,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    });

    await adminUser.save();
    console.log('Admin user seeded successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();
