import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { processPayment } from '../services/payment.service';
import { getReservationById } from '../services/reservation.service';
import type { ReservationDetails } from '../types/reservation';

export function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] =
    useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservationId) {
      return;
    }

    const id = reservationId;
    let active = true;

    async function loadReservation() {
      try {
        const data = await getReservationById(id);

        if (active) {
          setReservation(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load reservation.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReservation();

    return () => {
      active = false;
    };
  }, [reservationId]);

  async function handlePayment(approved: boolean) {
    if (!reservationId) {
      setError('Reservation not found.');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const result = await processPayment(reservationId, approved);

      if (result.status === 'CONFIRMED') {
        navigate('/tickets');
        return;
      }

      setError('Payment failed. Your seats have been released.');

      setReservation((current) =>
        current
          ? {
              ...current,
              status: 'PAYMENT_FAILED',
              tickets: current.tickets.map((ticket) => ({
                ...ticket,
                status: 'CANCELLED',
              })),
            }
          : current,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to process payment.',
      );
    } finally {
      setProcessing(false);
    }
  }

  if (!reservationId) {
    return (
      <section className="page">
        <p>Reservation not found.</p>
        <Link to="/" className="event-details__back">
          ← Back to events
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page">
        <p>Loading reservation...</p>
      </section>
    );
  }

  if (error && !reservation) {
    return (
      <section className="page">
        <p>{error}</p>
        <Link to="/" className="event-details__back">
          ← Back to events
        </Link>
      </section>
    );
  }

  if (!reservation) {
    return (
      <section className="page">
        <p>Reservation not found.</p>
        <Link to="/" className="event-details__back">
          ← Back to events
        </Link>
      </section>
    );
  }

  return (
    <section className="page payment-page">
      <Link to="/" className="payment-page__back">
        ← Back to events
      </Link>

      <div className="payment-page__card">
        <div className="payment-page__header">
          <span className="home__eyebrow">Payment</span>

          <h1>Complete your reservation</h1>

          <p>{reservation.event.title}</p>
        </div>

        <div className="payment-page__summary">
          <div className="payment-page__summary-item">
            <span>Date</span>
            <strong>
              {new Date(reservation.event.date).toLocaleDateString('en-US', {
                dateStyle: 'medium',
              })}
            </strong>
          </div>

          <div className="payment-page__summary-item">
            <span>Location</span>
            <strong>{reservation.event.location}</strong>
          </div>

          <div className="payment-page__summary-item">
            <span>Tickets</span>
            <strong>{reservation.quantity}</strong>
          </div>

          <div className="payment-page__summary-item">
            <span>Total</span>
            <strong>
              {Number(reservation.totalAmount).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </strong>
          </div>
        </div>

        {error && <p className="payment-page__error">{error}</p>}

        <div className="payment-page__actions">
          <button
            type="button"
            className="payment-page__button payment-page__button--decline"
            disabled={processing}
            onClick={() => handlePayment(false)}
          >
            Decline payment
          </button>

          <button
            type="button"
            className="payment-page__button payment-page__button--approve"
            disabled={processing}
            onClick={() => handlePayment(true)}
          >
            {processing ? 'Processing...' : 'Approve payment'}
          </button>
        </div>
      </div>
    </section>
  );
}
