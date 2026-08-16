import cors from 'cors';
import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { catalogRouter } from './modules/catalog/catalog.routes.js';
import { eventRouter } from './modules/events/event.routes.js';
import { reservationRouter } from './modules/reservations/reservation.routes.js';
import { paymentRouter } from './modules/payments/payment.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/catalog', catalogRouter);
app.use('/events', eventRouter);
app.use('/reservations', reservationRouter);
app.use('/payments', paymentRouter);

app.use(errorHandler);