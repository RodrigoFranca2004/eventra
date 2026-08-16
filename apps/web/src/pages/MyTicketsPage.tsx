import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyTickets } from '../services/ticket.service';
import type { Ticket } from '../types/ticket';

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      try {
        const data = await listMyTickets();

        if (active) {
          setTickets(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load tickets.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="page">
        <p>Loading tickets...</p>
      </section>
    );
  }

  return (
    <section className="page tickets-page">
      <div className="page-header">
        <div>
          <span className="home__eyebrow">My tickets</span>
          <h1>Your tickets</h1>
          <p>Manage your reservations and access your tickets.</p>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {!error && tickets.length === 0 && (
        <div className="tickets-empty">
          <h2>No tickets yet</h2>
          <p>You don't have any active tickets.</p>
          <Link to="/">Browse events</Link>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="ticket-card"
            >
              <div className="ticket-card__content">
                <span className="home__eyebrow">
                  {ticket.reservation.event.title}
                </span>

                <h2>{ticket.reservation.event.title}</h2>

                <div className="ticket-card__info">
                  <div>
                    <span>Date</span>
                    <strong>
                      {new Date(
                        ticket.reservation.event.date,
                      ).toLocaleDateString('en-US', {
                        dateStyle: 'medium',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{ticket.reservation.event.location}</strong>
                  </div>

                  <div>
                    <span>Seat</span>
                    <strong>
                      {ticket.seat.row}
                      {ticket.seat.number}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="ticket-card__status">
                <span>Ticket</span>
                <strong>{ticket.status}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}