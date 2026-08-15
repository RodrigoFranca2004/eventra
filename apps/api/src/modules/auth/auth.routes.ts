import { Router } from 'express';
import {
  authenticateUser,
  registerUser,
} from './authentication.service.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import { generateToken } from './token.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: 'Invalid request data',
      errors: validation.error.issues,
    });
    return;
  }

  try {
    const { name, email, password, role } = validation.data;

    const user = await registerUser(name, email, password, role);

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
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: 'Invalid request data',
      errors: validation.error.issues,
    });
    return;
  }

  try {
    const user = await authenticateUser(
      validation.data.email,
      validation.data.password,
    );

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