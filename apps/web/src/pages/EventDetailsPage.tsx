import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEventById } from '../services/event.service';
import type { Event } from '../types/event';

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const eventId = id;
    let active = true;

    async function loadEvent() {
      try {
        const data = await getEventById(eventId);

        if (active) {
          setEvent(data);
        }
      } catch {
        if (active) {
          setError('Unable to load event.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      active = false;
    };
  }, [id]);

  if (!id) {
    return (
      <section className="page">
        <p>Event not found.</p>
        <Link to="/">Back to events</Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page">
        <p>Loading event...</p>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section className="page">
        <p>{error || 'Event not found.'}</p>
        <Link to="/">Back to events</Link>
      </section>
    );
  }

  function handleReserveTickets() {
    if (!id) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      navigate(`/login?redirect=/events/${id}/seats`);
      return;
    }

    navigate(`/events/${id}/seats`);
  }

  return (
    <section className="page event-details">
      <Link to="/" className="event-details__back">
        ← Back to events
      </Link>

      <div className="event-details__hero">
        <div className="event-details__image">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} />
          ) : (
            <div className="event-details__placeholder">
              No image available
            </div>
          )}
        </div>

        <div className="event-details__content">
          <span className="home__eyebrow">{event.type}</span>

          <h1>{event.title}</h1>

          {event.description && (
            <p className="event-details__description">{event.description}</p>
          )}

          <div className="event-details__info">
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
              <span>Price</span>
              <strong>
                {Number(event.price).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </strong>
            </div>

            <div>
              <span>Capacity</span>
              <strong>{event.capacity} seats</strong>
            </div>
          </div>

          <button
            type="button"
            className="event-details__reserve"
            onClick={handleReserveTickets}
          >
            Reserve tickets
          </button>
        </div>
      </div>
    </section>
  );
}