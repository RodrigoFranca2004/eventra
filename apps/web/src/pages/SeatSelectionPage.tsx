import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listEventSeats } from '../services/event.service';
import { createReservation } from '../services/reservation.service';
import type { Seat } from '../types/seat';
import { ApiError } from '../services/api.service';

export function SeatSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const eventId = id;

    const token = localStorage.getItem('token');

    if (!token) {
      navigate(`/login?redirect=/events/${eventId}/seats`, {
        replace: true,
      });
      return;
    }

    let active = true;

    async function loadSeats() {
      try {
        const data = await listEventSeats(eventId);

        if (active) {
          setSeats(data);
        }
      } catch (error) {
          if (!active) {
            return;
          }

          if (error instanceof ApiError && error.status === 401) {
            navigate(`/login?redirect=/events/${id}/seats`, {
              replace: true,
            });
            return;
          }

          setError('Unable to load seats.');
        } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSeats();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const rows = useMemo(() => {
    return seats.reduce<Record<string, Seat[]>>((accumulator, seat) => {
      if (!accumulator[seat.row]) {
        accumulator[seat.row] = [];
      }

      accumulator[seat.row].push(seat);

      return accumulator;
    }, {});
  }, [seats]);

  function toggleSeat(seat: Seat) {
    if (!seat.available) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seat.id)
        ? current.filter((id) => id !== seat.id)
        : [...current, seat.id],
    );
  }

  async function handleReservation() {
    if (!id || selectedSeats.length === 0) {
      return;
    }

    try {
      setReserving(true);
      setError('');

      const reservation = await createReservation({
        eventId: id,
        seatIds: selectedSeats,
      });

      navigate(`/payment/${reservation.reservation.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to complete reservation.',
      );
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <p>Loading seats...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <Link to={`/events/${id}`} className="event-details__back">
        ← Back to event
      </Link>

      <div className="page-header">
        <div>
          <span className="home__eyebrow">Reservation</span>
          <h1>Select your seats</h1>
          <p>Choose the seats you want to reserve.</p>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="seat-selection">
        <div className="seat-selection__screen">SCREEN</div>

        <div className="seat-map">
          {Object.entries(rows).map(([row, rowSeats]) => (
            <div className="seat-row" key={row}>
              <span className="seat-row__label">{row}</span>

              <div className="seat-row__seats">
                {rowSeats.map((seat) => {
                  const selected = selectedSeats.includes(seat.id);

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!seat.available}
                      className={`seat seat--${seat.type.toLowerCase()} ${
                        selected ? 'seat--selected' : ''
                      } ${!seat.available ? 'seat--occupied' : ''}`}
                      onClick={() => toggleSeat(seat)}
                      aria-label={`Row ${seat.row}, seat ${seat.number}`}
                      aria-pressed={selected}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="seat-selection__summary">
          <span>
            {selectedSeats.length}{' '}
            {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
          </span>

          <button
            type="button"
            disabled={selectedSeats.length === 0 || reserving}
            onClick={handleReservation}
          >
            {reserving ? 'Reserving...' : 'Reserve tickets'}
          </button>
        </div>
      </div>
    </section>
  );
}