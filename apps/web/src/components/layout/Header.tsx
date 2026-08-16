import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header>
      <nav>
        <Link to="/">Eventra</Link>
        <Link to="/tickets">My tickets</Link>
        <Link to="/organizer">Organizer</Link>
        <Link to="/gatekeeper">Gatekeeper</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}