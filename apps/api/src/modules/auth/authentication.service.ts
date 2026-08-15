import { UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { comparePassword, hashPassword } from './password.service.js';

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}