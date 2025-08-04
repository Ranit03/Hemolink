import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { CustomError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { cacheService } from '../config/redis';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  role: Joi.string().valid('PATIENT', 'DONOR', 'HEALTHCARE_PROVIDER').required(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0].message, 400);
  }

  const { email, password, firstName, lastName, phone, role, dateOfBirth, gender } = value;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new CustomError('User with this email or phone already exists', 400);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  // Log registration
  logger.info(`New user registered: ${email} with role ${role}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0].message, 400);
  }

  const { email, password } = value;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      patientProfile: true,
      donorProfile: true,
      providerProfile: true,
    },
  });

  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new CustomError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user.id);

  // Cache user session
  await cacheService.set(`user_session:${user.id}`, JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    lastLogin: new Date().toISOString(),
  }), 7 * 24 * 60 * 60); // 7 days

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Log login
  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      profilePicture: true,
      address: true,
      emergencyContact: true,
      createdAt: true,
      updatedAt: true,
      patientProfile: true,
      donorProfile: true,
      providerProfile: true,
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
}));

// Change password
router.put('/change-password', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0].message, 400);
  }

  const { currentPassword, newPassword } = value;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new CustomError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedNewPassword },
  });

  // Clear user session cache
  await cacheService.del(`user_session:${req.user!.id}`);

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

// Logout
router.post('/logout', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Clear user session cache
  await cacheService.del(`user_session:${req.user!.id}`);

  logger.info(`User logged out: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export default router;
