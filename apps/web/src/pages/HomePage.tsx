export function HomePage() {
  return (
    <section>
      <div className="home__hero">
        <span className="home__eyebrow">Discover what is happening</span>
        <h1>Find your next experience.</h1>
        <p>
          Discover events, choose your seats and get your ticket in a few
          simple steps.
        </p>
      </div>

      <div className="home__section">
        <div>
          <span className="home__eyebrow">Explore</span>
          <h2>Upcoming events</h2>
        </div>

        <p className="home__empty">Events will appear here.</p>
      </div>
    </section>
  );
}