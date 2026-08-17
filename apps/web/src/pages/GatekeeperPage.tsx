import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { listPublishedEvents } from '../services/event.service';
import { validateTicket } from '../services/gatekeeper.service';
import type { Event } from '../types/event';

type ValidationResult =
  | 'VALID'
  | 'INVALID'
  | 'ALREADY_USED'
  | 'WRONG_EVENT';

export function GatekeeperPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const data = await listPublishedEvents();

        if (active) {
          setEvents(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load events.',
          );
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

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner?.isScanning) {
      return;
    }

    await scanner.stop();
    scannerRef.current = null;
    setScanning(false);
  }

  async function startScanner() {
    try {
      setError('');
      setResult(null);
      setMessage('');

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          setCode(decodedText);
          setError('');
          setResult(null);
          setMessage('');

          try {
            await stopScanner();
          } catch {
            setError('Unable to stop the camera.');
          }
        },
        () => undefined,
      );
    } catch (error) {
      scannerRef.current = null;
      setScanning(false);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to access the camera.',
      );
    }
  }

  async function handleValidation() {
    if (!eventId || !code.trim()) {
      setError('Select an event and enter the ticket code.');
      return;
    }

    try {
      setValidating(true);
      setError('');
      setResult(null);
      setMessage('');

      const validation = await validateTicket(
        code.trim(),
        eventId,
      );

      setResult(validation.reason ?? 'VALID');
      setMessage(validation.message);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to validate ticket.',
      );
    } finally {
      setValidating(false);
    }
  }

  function resetValidation() {
    setCode('');
    setResult(null);
    setMessage('');
    setError('');
  }

  if (loading) {
    return (
      <section className="page gatekeeper-page">
        <p>Loading events...</p>
      </section>
    );
  }

  return (
    <section className="page gatekeeper-page">
      <Link to="/" className="event-details__back">
        ← Back to events
      </Link>

      <div className="page-header">
        <div>
          <span className="home__eyebrow">Gatekeeper</span>
          <h1>Validate ticket</h1>
          <p>Verify a ticket before allowing entry to the event.</p>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="gatekeeper-card">
        <div className="gatekeeper-field">
          <label htmlFor="gatekeeper-event">
            Event
          </label>

          <select
            id="gatekeeper-event"
            value={eventId}
            onChange={(event) => {
              setEventId(event.target.value);
              resetValidation();
            }}
          >
            <option value="">Select an event</option>

            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="gatekeeper-field">
          <label htmlFor="gatekeeper-code">
            Ticket code
          </label>

          <input
            id="gatekeeper-code"
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setResult(null);
              setMessage('');
              setError('');
            }}
            placeholder="Enter ticket code"
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          onClick={startScanner}
          disabled={scanning || validating}
        >
          {scanning ? 'Scanning...' : 'Scan QR code'}
        </button>

        {scanning && (
          <div className="gatekeeper-scanner">
            <div id="qr-reader" />

            <button
              type="button"
              onClick={() => {
                stopScanner().catch(() => {
                  setError('Unable to stop the camera.');
                });
              }}
            >
              Stop camera
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={!eventId || !code.trim() || validating}
          onClick={handleValidation}
        >
          {validating ? 'Validating...' : 'Validate ticket'}
        </button>

        {result && (
          <div
            className={`gatekeeper-result gatekeeper-result--${result.toLowerCase()}`}
          >
            <strong>{message}</strong>

            {result === 'VALID' && (
              <span>Entry authorized.</span>
            )}

            {result === 'ALREADY_USED' && (
              <span>This ticket has already been used.</span>
            )}

            {result === 'WRONG_EVENT' && (
              <span>This ticket belongs to another event.</span>
            )}

            {result === 'INVALID' && (
              <span>This ticket cannot be accepted.</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}