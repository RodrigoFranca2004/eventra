import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwtSecret;
}

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

export function generateToken(userId: string, role: UserRole) {
  return jwt.sign(
    {
      userId,
      role,
    },
    getJwtSecret(),
    {
      expiresIn: '1h', // Using a higher time for tests
    },
  );
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}