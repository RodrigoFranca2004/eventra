import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { GatekeeperPage } from './pages/GatekeeperPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrganizerPage } from './pages/OrganizerPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/organizer" element={<OrganizerPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route path="/gatekeeper" element={<GatekeeperPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}