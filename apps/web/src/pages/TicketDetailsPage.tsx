import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getTicketById,
  getTicketShareLink,
} from '../services/ticket.service';
import type { Ticket } from '../types/ticket';
import { QRCodeSVG } from 'qrcode.react';

export function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!id) {
        return;
    }

    const ticketId = id;
    let active = true;

    async function loadTicket() {
        try {
        const data = await getTicketById(ticketId);

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
    }, [id]);

  async function handleShare() {
    if (!id) {
      return;
    }

    try {
      setSharing(true);
      setError('');

      const result = await getTicketShareLink(id);

      const url = `${window.location.origin}${result.url}`;

      setShareUrl(url);

      await navigator.clipboard.writeText(url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to generate share link.',
      );
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <p>Loading ticket...</p>
      </section>
    );
  }

  if (error || !ticket) {
    return (
      <section className="page">
        <p>{error || 'Ticket not found.'}</p>
        <Link to="/tickets">Back to my tickets</Link>
      </section>
    );
  }

  return (
    <section className="page ticket-details">
      <Link to="/tickets" className="event-details__back">
        ← Back to my tickets
      </Link>

      <div className="ticket-details__card">
        <div className="ticket-details__header">
          <div>
            <span className="home__eyebrow">Ticket</span>
            <h1>{ticket.reservation.event.title}</h1>
          </div>

          <span className="ticket-details__status">
            {ticket.status}
          </span>
        </div>

        <div className="ticket-details__info">
          <div>
            <span>Date</span>
            <strong>
              {new Date(
                ticket.reservation.event.date,
              ).toLocaleDateString('en-US', {
                dateStyle: 'full',
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
              Row {ticket.seat.row}, Seat {ticket.seat.number}
            </strong>
          </div>

          <div>
            <span>Seat type</span>
            <strong>{ticket.seat.type}</strong>
          </div>

          <div>
            <span>Ticket code</span>
            <strong className="ticket-details__code">
              {ticket.code}
            </strong>
          </div>
        </div>

        <div className="ticket-details__actions">
          <button
            type="button"
            disabled={sharing}
            onClick={handleShare}
          >
            {sharing ? 'Generating...' : 'Share ticket'}
          </button>
        </div>

        {shareUrl && (
          <div className="ticket-details__share">
            <span>Share link</span>
            <input
              type="text"
              value={shareUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
            <p>Link copied to clipboard.</p>
          </div>
        )}

        <div className="ticket-details__qr">
            <span>Ticket QR code</span>

            <QRCodeSVG
                value={`${window.location.origin}/tickets/share/${ticket.code}`}
                size={220}
                level="H"
            />

            <p>
                Scan this QR code to view the shared ticket.
            </p>
        </div>
      </div>
    </section>
  );
}
