import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  authenticateUser,
  registerUser,
} from './authentication.service.js';
import { generateToken } from './token.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await registerUser(
      name,
      email,
      password,
      role as UserRole,
    );

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      res.status(409).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});