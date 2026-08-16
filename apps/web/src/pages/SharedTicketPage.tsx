import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSharedTicket } from '../services/ticket.service';
import type { SharedTicket } from '../types/ticket';

export function SharedTicketPage() {
  const { code } = useParams<{ code: string }>();

  const [ticket, setTicket] = useState<SharedTicket | null>(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      return;
    }

    const ticketCode = code;
    let active = true;

    async function loadTicket() {
      try {
        const data = await getSharedTicket(ticketCode);

        if (active) {
          setTicket(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load ticket.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      active = false;
    };
  }, [code]);

  if (loading) {
    return (
      <section className="page shared-ticket">
        <p>Loading ticket...</p>
      </section>
    );
  }

  if (error || !ticket) {
    return (
      <section className="page shared-ticket">
        <div className="shared-ticket__card">
          <span className="home__eyebrow">Ticket</span>
          <h1>Ticket unavailable</h1>
          <p>{error || 'This ticket could not be found.'}</p>
          <Link to="/">Back to events</Link>
        </div>
      </section>
    );
  }

  const event = ticket.reservation.event;

  return (
    <section className="page shared-ticket">
      <div className="shared-ticket__card">
        <div className="shared-ticket__header">
          <div>
            <span className="home__eyebrow">Eventra Ticket</span>
            <h1>{event.title}</h1>
          </div>

          <span className="ticket-details__status">
            VALID
          </span>
        </div>

        <div className="shared-ticket__info">
          <div>
            <span>Date</span>
            <strong>
              {new Date(event.date).toLocaleDateString('en-US', {
                dateStyle: 'full',
              })}
            </strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{event.location}</strong>
          </div>

          <div>
            <span>Seat</span>
            <strong>
              Row {ticket.seat.row}, Seat {ticket.seat.number}
            </strong>
          </div>

          <div>
            <span>Seat type</span>
            <strong>{ticket.seat.type}</strong>
          </div>
        </div>

        <div className="shared-ticket__qr">
          <span>Ticket verified</span>
        </div>
      </div>
    </section>
  );
}
