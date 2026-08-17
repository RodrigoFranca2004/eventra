import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link className="header__brand" to="/">
          Eventra
        </Link>

        <nav className="header__nav">
          <Link to="/">Events</Link>
          <Link to="/tickets">My tickets</Link>
          <Link to="/organizer">Organizer</Link>
          <Link to="/gatekeeper">Gatekeeper</Link>
        </nav>

        <div className="header__actions">
          <ThemeToggle />
          <Link className="header__login" to="/login">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}