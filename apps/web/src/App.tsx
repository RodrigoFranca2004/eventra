import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { GatekeeperPage } from './pages/GatekeeperPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrganizerPage } from './pages/OrganizerPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { PaymentPage } from './pages/PaymentPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { SharedTicketPage } from './pages/SharedTicketPage';
import { CreateEventPage } from './pages/CreateEventPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/events/:id/seats" element={<SeatSelectionPage />} />
        <Route path="/payment/:reservationId" element={<PaymentPage />} />

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="/tickets" element={<MyTicketsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        </Route>

        <Route path="/tickets/share/:code" element={<SharedTicketPage />}
        />

        <Route element={<ProtectedRoute roles={['ORGANIZER']} />}>
          <Route path="/organizer" element={<CreateEventPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['GATEKEEPER']} />}>
          <Route path="/gatekeeper" element={<GatekeeperPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}