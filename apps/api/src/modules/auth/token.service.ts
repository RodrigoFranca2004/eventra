import jwt, { type JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwtSecret;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export function generateToken(userId: string, role: UserRole): string {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    getJwtSecret(),
    {
      expiresIn: '1h', // Using a higher expire time for testing
    },
  );
}

export function verifyToken(token: string): AuthTokenPayload {
  const decodedToken = jwt.verify(token, getJwtSecret());

  if (typeof decodedToken === 'string' || !decodedToken.sub || !decodedToken.role) {
    throw new Error('Invalid token payload');
  }

  return {
    ...decodedToken,
    sub: decodedToken.sub,
    role: decodedToken.role as UserRole,
  };
}