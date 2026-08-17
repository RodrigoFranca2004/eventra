import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setDark((current) => !current)}
      aria-label={dark ? 'Use light theme' : 'Use dark theme'}
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}