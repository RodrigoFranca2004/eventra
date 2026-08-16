import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { processPayment } from '../services/payment.service';

export function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <section className="page payment-page">
      <Link to="/" className="payment-page__back">
        ← Back to events
      </Link>

      <div className="payment-page__card">
        <div className="payment-page__header">
          <span className="home__eyebrow">Payment</span>

          <h1>Complete your reservation</h1>

          <p>
            This is a simulated payment. No real payment will be processed.
          </p>
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

