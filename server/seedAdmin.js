import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@freelancehub.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: 'adminpassword123',
      role: 'admin',
      isVerified: true,
    });

    await adminUser.save();
    console.log('Admin user seeded successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: adminpassword123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
