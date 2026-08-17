import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createEvent,
  createEventSeats,
  publishEvent,
} from '../services/event.service';
import {
  searchMovies,
  type TmdbMovie,
} from '../services/catalog.service';

type SeatType = 'STANDARD' | 'PREMIUM' | 'ACCESSIBLE';

type SeatRow = {
  name: string;
  seats: number;
  type: SeatType;
};

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const emptyRow: SeatRow = {
  name: '',
  seats: 1,
  type: 'STANDARD',
};

export function CreateEventPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [selectedMovie, setSelectedMovie] =
    useState<TmdbMovie | null>(null);

  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const [rows, setRows] = useState<SeatRow[]>([
    { name: 'A', seats: 10, type: 'STANDARD' },
  ]);

  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSearching(true);
        setError('');

        const results = await searchMovies(query.trim());
        setMovies(results);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to search movies.',
        );
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  const capacity = rows.reduce(
    (total, row) => total + row.seats,
    0,
  );

  function selectMovie(movie: TmdbMovie) {
    setSelectedMovie(movie);
    setQuery(movie.title);
    setMovies([]);
    setError('');
  }

  function addRow() {
    const nextRowName = String.fromCharCode(
      65 + rows.length,
    );

    setRows((current) => [
      ...current,
      {
        ...emptyRow,
        name: nextRowName,
      },
    ]);
  }

  function updateRow(
    index: number,
    field: keyof SeatRow,
    value: string | number,
  ) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function removeRow(index: number) {
    setRows((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedMovie) {
      setError('Select a movie.');
      return;
    }

    if (!date || !location.trim() || !price) {
      setError('Fill in all event fields.');
      return;
    }

    if (!rows.length) {
      setError('Add at least one seat row.');
      return;
    }

    if (
      rows.some(
        (row) =>
          !row.name.trim() ||
          row.seats < 1 ||
          row.seats > 100,
      )
    ) {
      setError('Check the seat row configuration.');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const event = await createEvent({
        title: selectedMovie.title,
        description: selectedMovie.overview || undefined,
        type: 'MOVIE',
        externalId: String(selectedMovie.id),
        date: new Date(date).toISOString(),
        location: location.trim(),
        capacity,
        price: Number(price),
      });

      await createEventSeats(event.id, rows);

      await publishEvent(event.id);

      navigate(`/events/${event.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create event.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="page create-event-page">
      <Link to="/" className="event-details__back">
        ← Back to events
      </Link>

      <div className="create-event-page__header">
        <span className="home__eyebrow">Organizer</span>
        <h1>Create event</h1>
        <p>
          Select a movie and configure the event and its seats.
        </p>
      </div>

      {error && (
        <p className="create-event-page__error">
          {error}
        </p>
      )}

      <form
        className="create-event-page__form"
        onSubmit={handleSubmit}
      >
        <section className="create-event-section">
          <div className="create-event-section__header">
            <h2>Movie</h2>
            <p>
              Search and select the movie for this event.
            </p>
          </div>

          <div className="create-event-field">
            <label htmlFor="movie-search">
              Search movie
            </label>

            <input
              id="movie-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedMovie(null);
              }}
              placeholder="Search by movie title"
              autoComplete="off"
            />
          </div>

          {searching && (
            <p className="create-event-page__muted">
              Searching movies...
            </p>
          )}

          {movies.length > 0 && (
            <div className="movie-search-results">
              {movies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  className="movie-search-result"
                  onClick={() => selectMovie(movie)}
                >
                  <div className="movie-search-result__image">
                    {movie.poster_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={movie.title}
                      />
                    ) : (
                      <span>No poster</span>
                    )}
                  </div>

                  <div className="movie-search-result__content">
                    <strong>{movie.title}</strong>

                    {movie.release_date && (
                      <span>
                        {movie.release_date.slice(0, 4)}
                      </span>
                    )}

                    {movie.overview && (
                      <p>{movie.overview}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedMovie && (
            <div className="selected-movie">
              <div className="selected-movie__image">
                {selectedMovie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                  />
                ) : (
                  <span>No poster</span>
                )}
              </div>

              <div className="selected-movie__content">
                <span className="home__eyebrow">
                  Selected movie
                </span>

                <h3>{selectedMovie.title}</h3>

                {selectedMovie.release_date && (
                  <span>
                    {selectedMovie.release_date.slice(0, 4)}
                  </span>
                )}

                <p>
                  {selectedMovie.overview ||
                    'No description available.'}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="create-event-section">
          <div className="create-event-section__header">
            <h2>Event details</h2>
            <p>Configure when and where the event will happen.</p>
          </div>

          <div className="create-event-fields">
            <div className="create-event-field">
              <label htmlFor="event-date">
                Date and time
              </label>

              <input
                id="event-date"
                type="datetime-local"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="event-location">
                Location
              </label>

              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Event location"
                maxLength={300}
                required
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="event-price">
                Price
              </label>

              <input
                id="event-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </section>

        <section className="create-event-section">
          <div className="create-event-section__header">
            <div>
              <h2>Seats</h2>
              <p>
                Configure each row independently.
              </p>
            </div>

            <strong className="create-event-capacity">
              Capacity: {capacity}
            </strong>
          </div>

          <div className="seat-row-editor">
            {rows.map((row, index) => (
              <div
                className="seat-row-editor__item"
                key={`${row.name}-${index}`}
              >
                <div className="create-event-field">
                  <label htmlFor={`row-name-${index}`}>
                    Row
                  </label>

                  <input
                    id={`row-name-${index}`}
                    type="text"
                    value={row.name}
                    onChange={(event) =>
                      updateRow(
                        index,
                        'name',
                        event.target.value.toUpperCase(),
                      )
                    }
                    maxLength={5}
                    required
                  />
                </div>

                <div className="create-event-field">
                  <label htmlFor={`row-seats-${index}`}>
                    Seats
                  </label>

                  <input
                    id={`row-seats-${index}`}
                    type="number"
                    min="1"
                    max="100"
                    value={row.seats}
                    onChange={(event) =>
                      updateRow(
                        index,
                        'seats',
                        Number(event.target.value),
                      )
                    }
                    required
                  />
                </div>

                <div className="create-event-field">
                  <label htmlFor={`row-type-${index}`}>
                    Type
                  </label>

                  <select
                    id={`row-type-${index}`}
                    value={row.type}
                    onChange={(event) =>
                      updateRow(
                        index,
                        'type',
                        event.target.value as SeatType,
                      )
                    }
                  >
                    <option value="STANDARD">
                      Standard
                    </option>
                    <option value="PREMIUM">
                      Premium
                    </option>
                    <option value="ACCESSIBLE">
                      Accessible
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  className="create-event-row-remove"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                  aria-label={`Remove row ${row.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="create-event-add-row"
            onClick={addRow}
          >
            + Add row
          </button>
        </section>

        <div className="create-event-actions">
          <Link
            to="/"
            className="create-event-actions__cancel"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="create-event-actions__submit"
            disabled={
              creating ||
              !selectedMovie ||
              !date ||
              !location.trim() ||
              !price
            }
          >
            {creating ? 'Creating event...' : 'Create event'}
          </button>
        </div>
      </form>
    </section>
  );
}
