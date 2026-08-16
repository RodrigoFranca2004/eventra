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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/events/:id/seats" element={<SeatSelectionPage />} />

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="/tickets" element={<MyTicketsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['ORGANIZER']} />}>
          <Route path="/organizer" element={<OrganizerPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['GATEKEEPER']} />}>
          <Route path="/gatekeeper" element={<GatekeeperPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}