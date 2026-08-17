import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublishedEvents } from '../services/event.service';
import type { Event } from '../types/event';

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const data = await listPublishedEvents();

        if (active) {
          setEvents(data);
        }
      } catch {
        if (active) {
          setError('Unable to load events.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <section className="page">
        <p>Loading events...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="home__eyebrow">Discover</span>
          <h1>Find your next event</h1>
          <p>Explore shows and movies available on Eventra.</p>
        </div>

        <input
          className="event-search"
          type="search"
          placeholder="Search events..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="event-card"
            >
              <div className="event-card__image">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} />
                ) : (
                  <div className="event-card__placeholder">
                    No image available
                  </div>
                )}

                <span className="event-card__type">{event.type}</span>
              </div>

              <div className="event-card__content">
                <span className="event-card__type">{event.type}</span>

                <h2>{event.title}</h2>

                <p>{event.location}</p>

                <p>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    dateStyle: 'medium',
                  })}
                </p>

                <strong>
                  {Number(event.price).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}