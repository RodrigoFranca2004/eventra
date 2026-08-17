# Eventra

Eventra is a web application for creating, publishing, and managing events, with support for movie-based events, seat configuration, reservations, tickets, and ticket validation at the entrance.

The project is structured as a pnpm monorepo with a React frontend and an Express/Prisma backend.

## Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* React Router
* html5-qrcode
* qrcode.react
* lucide-react

### Backend

* Node.js
* TypeScript
* Express
* Prisma
* PostgreSQL
* Zod
* JWT
* bcryptjs
* Axios

### Infrastructure and tooling

* Docker
* Docker Compose
* pnpm
* ESLint
* Prettier
* TMDb API

## Architecture

```text
eventra/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   └── web/
│       └── src/
├── packages/
│   └── shared/
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

The application is divided into three workspace packages:

* `apps/api` — REST API and business logic.
* `apps/web` — React web application.
* `packages/shared` — Shared code between applications.

The frontend communicates with the backend through HTTP requests.

```text
React
  ↓
Express API
  ↓
Prisma
  ↓
PostgreSQL
```

For movie-based events, the backend communicates with TMDb:

```text
React
  ↓
Eventra API
  ↓
TMDb API
```

## Requirements

Before running the project, install:

* Node.js
* pnpm
* Docker Desktop

The project uses pnpm `10.0.0`.

## Installation

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd eventra
```

Install the dependencies:

```bash
pnpm install
```

## Environment Variables

Create the environment configuration required by the project.

The API requires the following variables:

```env
POSTGRES_USER=eventra
POSTGRES_PASSWORD=eventra
POSTGRES_DB=eventra
POSTGRES_PORT=5432

DATABASE_URL=postgresql://eventra:eventra@localhost:5432/eventra

JWT_SECRET=change-me
TMDB_API_KEY=your_tmdb_key
VITE_API_URL=http://localhost:3000
```

### Variables

| Variable            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `POSTGRES_USER`     | PostgreSQL username                                  |
| `POSTGRES_PASSWORD` | PostgreSQL password                                  |
| `POSTGRES_DB`       | PostgreSQL database name                             |
| `POSTGRES_PORT`     | Host port used by PostgreSQL                         |
| `DATABASE_URL`      | Prisma connection string                             |
| `JWT_SECRET`        | Secret used for JWT authentication                   |
| `TMDB_API_KEY`      | API key used to access TMDb                          |
| `VITE_API_URL`      | URL used by the frontend to communicate with the API |

Do not use `JWT_SECRET=change-me` or expose a real `TMDB_API_KEY` in a production environment.

## Database

PostgreSQL runs through Docker Compose.

Start the database:

```bash
docker compose up -d
```

The PostgreSQL container is named `eventra-db`.

To stop it:

```bash
docker compose down
```

The database uses a Docker volume named `postgres_data`, so the database data persists between container restarts.

## Prisma

After configuring the database, run the Prisma migrations:

```bash
pnpm --filter @eventra/api prisma migrate dev
```

Generate the Prisma client when necessary:

```bash
pnpm --filter @eventra/api prisma generate
```

The Prisma schema is located at:

```text
apps/api/prisma/schema.prisma
```

## Running the Application

The backend and frontend are separate applications.

### Backend

Start the API in development mode:

```bash
pnpm --filter @eventra/api dev
```

The API uses:

```text
http://localhost:3000
```

### Frontend

In another terminal:

```bash
pnpm --filter @eventra/web dev
```

Vite will display the local URL in the terminal.

## Production Build

Build the backend:

```bash
pnpm --filter @eventra/api build
```

Start the compiled backend:

```bash
pnpm --filter @eventra/api start
```

Build the frontend:

```bash
pnpm --filter @eventra/web build
```

Preview the frontend production build:

```bash
pnpm --filter @eventra/web preview
```

## Code Quality

Run linting for both applications:

```bash
pnpm lint
```

Format the project:

```bash
pnpm format
```

Check formatting without modifying files:

```bash
pnpm format:check
```

## Authentication

The application uses JWT-based authentication.

Users have one of the following roles:

* `ORGANIZER`
* `CUSTOMER`
* `GATEKEEPER`

Protected API routes use authentication middleware and role-based authorization.

Passwords are stored using bcrypt hashing.

## Events

Organizers can create events and configure their seats.

Events support two types:

* `MOVIE`
* `SHOW`

Movie events are created from a movie selected through a TMDb search.

The selected movie provides:

* title;
* description;
* TMDb ID;
* poster information.

The event can then be configured with:

* date and time;
* location;
* ticket price;
* seat rows.

Events have three statuses:

* `DRAFT`
* `PUBLISHED`
* `CANCELLED`

An event is created as a draft and can subsequently be published.

## TMDb Integration

Movie searches are performed by the backend through the TMDb API.

The frontend does not communicate directly with TMDb.

The flow is:

```text
Movie search
    ↓
React frontend
    ↓
GET /movies?query=...
    ↓
Eventra API
    ↓
TMDb API
```

The API key is configured through:

```env
TMDB_API_KEY=your_tmdb_key
```

## Seats

Seats belong to an event and are configured by rows.

Each row can have a different number of seats and seat type.

Supported seat types:

* `STANDARD`
* `PREMIUM`
* `ACCESSIBLE`

For example:

```json
{
  "rows": [
    {
      "name": "A",
      "seats": 20,
      "type": "STANDARD"
    },
    {
      "name": "B",
      "seats": 20,
      "type": "STANDARD"
    },
    {
      "name": "C",
      "seats": 5,
      "type": "PREMIUM"
    }
  ]
}
```

The event capacity is calculated from the configured seats rather than being manually defined by the organizer.

## Reservations and Tickets

The database models reservations and tickets separately.

A reservation belongs to:

* a customer;
* an event.

A reservation can contain multiple tickets, with each ticket associated with a specific seat.

Tickets have the following statuses:

* `ACTIVE`
* `CANCELLED`
* `USED`

Each ticket receives a unique validation code.

## Gatekeeper

The Gatekeeper functionality allows event staff to validate tickets before allowing entry.

The system verifies whether the ticket:

* exists;
* belongs to the selected event;
* is still valid;
* has already been used.

The frontend also supports QR code functionality through:

* `html5-qrcode`
* `qrcode.react`

## Database Model

The main relationships are:

```text
User
 ├── Events
 ├── Reservations
 └── Tickets

Event
 ├── Seats
 └── Reservations

Reservation
 └── Tickets

Seat
 └── Tickets
```

The main entities are:

* `User`
* `Event`
* `Seat`
* `Reservation`
* `Ticket`

## Typical Development Flow

Start PostgreSQL:

```bash
docker compose up -d
```

Install dependencies:

```bash
pnpm install
```

Apply database migrations:

```bash
pnpm --filter @eventra/api prisma migrate dev
```

Start the API:

```bash
pnpm --filter @eventra/api dev
```

Start the frontend in another terminal:

```bash
pnpm --filter @eventra/web dev
```

The application can then be accessed through the URL provided by Vite.

## Useful Commands

| Command                                         | Purpose                        |
| ----------------------------------------------- | ------------------------------ |
| `pnpm install`                                  | Install workspace dependencies |
| `docker compose up -d`                          | Start PostgreSQL               |
| `docker compose down`                           | Stop PostgreSQL                |
| `pnpm --filter @eventra/api dev`                | Start API in development       |
| `pnpm --filter @eventra/web dev`                | Start frontend in development  |
| `pnpm --filter @eventra/api build`              | Build API                      |
| `pnpm --filter @eventra/web build`              | Build frontend                 |
| `pnpm --filter @eventra/api prisma migrate dev` | Run Prisma migrations          |
| `pnpm --filter @eventra/api prisma generate`    | Generate Prisma Client         |
| `pnpm lint`                                     | Run linting                    |
| `pnpm format`                                   | Format the project             |
| `pnpm format:check`                             | Check formatting               |

## License

This project does not currently specify a license.
