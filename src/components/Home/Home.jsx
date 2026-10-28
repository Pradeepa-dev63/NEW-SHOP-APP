import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Home.css";
import Footer_Home from "../Footer/Footer_home";

/* ---------- small inline icons ---------- */

const Icon = ({ children }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const features = [
  {
    title: "Quick local delivery",
    sub: "From nearby shops",
    icon: (
      <Icon>
        <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </Icon>
    ),
  },
  {
    title: "Fresh & quality products",
    sub: "Everyday essentials",
    icon: (
      <Icon>
        <path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" />
        <path d="M5 19c3-5 6-8 10-10" />
      </Icon>
    ),
  },
  {
    title: "Support local businesses",
    sub: "Stronger communities",
    icon: (
      <Icon>
        <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />
      </Icon>
    ),
  },
];

const BasketArt = () => (
  <svg viewBox="0 0 96 96" className="role-card__art" aria-hidden="true">
    <path d="M30 40c-6-14 2-24 14-24 6 0 10 4 10 10" fill="none" stroke="#3a8f3a" strokeWidth="5" strokeLinecap="round" />
    <circle cx="38" cy="36" r="9" fill="#e53935" />
    <rect x="52" y="14" width="14" height="26" rx="4" fill="#f4f7f9" stroke="#9fb4c0" />
    <rect x="52" y="14" width="14" height="6" rx="2" fill="#43a047" />
    <ellipse cx="72" cy="34" rx="6" ry="9" fill="#f9a825" />
    <path d="M10 44h76l-8 38a6 6 0 0 1-6 5H24a6 6 0 0 1-6-5z" fill="#2e7d32" />
    <rect x="26" y="52" width="6" height="28" rx="3" fill="#f9a825" />
    <rect x="45" y="52" width="6" height="28" rx="3" fill="#e57c1f" />
    <rect x="64" y="52" width="6" height="28" rx="3" fill="#8bc34a" />
  </svg>
);

const StoreArt = () => (
  <svg viewBox="0 0 96 96" className="role-card__art" aria-hidden="true">
    <path d="M10 30l6-16h64l6 16z" fill="#e53935" />
    <path d="M22 14l-6 16M40 14l-2 16M58 14l2 16M74 14l6 16" stroke="#fff" strokeWidth="6" />
    <rect x="16" y="30" width="64" height="48" fill="#f6efe2" />
    <rect x="26" y="44" width="16" height="34" rx="2" fill="#2e7d32" />
    <rect x="50" y="44" width="22" height="18" rx="2" fill="#7fc8a9" stroke="#2e7d32" strokeWidth="3" />
    <rect x="12" y="78" width="72" height="6" rx="3" fill="#c8b79a" />
    <circle cx="12" cy="70" r="6" fill="#43a047" />
  </svg>
);

const ShieldArt = () => (
  <svg viewBox="0 0 96 96" className="role-card__art" aria-hidden="true">
    <path d="M48 8l34 12v26c0 20-14 36-34 42C28 82 14 66 14 46V20z" fill="#2e7d32" />
    <path d="M48 14l28 10v22c0 16-11 30-28 36" fill="#43a047" opacity=".5" />
    <circle cx="48" cy="42" r="9" fill="#fff" />
    <path d="M44 48h8l2 18H42z" fill="#fff" />
  </svg>
);

const Home = () => {
  const [area, setArea] = useState("");
  const [activeRole, setActiveRole] = useState("customer");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const value = area.trim();
    if (!value) return;
    navigate(`/shops?location=${encodeURIComponent(value)}`);
  };

  return (
    <div className="home">
      <Navbar />

      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <span>Local shops</span>
            <i />
            <span>Fresh groceries</span>
            <i />
            <span>Quick delivery</span>
          </div>

          <h1 className="hero__title">
            Fresh groceries,
            <br />
            from shops <em>near you.</em>
          </h1>

          <p className="hero__subtitle">
            Shop local, support neighbourhood stores and get fresh groceries
            delivered quickly to your home.
          </p>

          <form className="hero__search" onSubmit={handleSearch}>
            <span className="hero__search-icon">
              <PinIcon />
            </span>
            <input
              type="text"
              placeholder="Enter your area or PIN code"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="Area or PIN code"
            />
            <button type="submit">
              <SearchIcon />
              <span>Find nearby shops</span>
            </button>
          </form>

          <ul className="hero__features">
            {features.map((f) => (
              <li key={f.title}>
                <span className="hero__feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <small>{f.sub}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- ROLE CARDS ---------------- */}

      <section className="roles">
        <h2>How would you like to use Near Shop?</h2>
        <p className="roles__sub">
          Choose the option that best describes you. Get started in just a few
          clicks.
        </p>

        <div className="roles__grid">
          <article
            className={`role-card ${activeRole === "customer" ? "role-card--active" : ""}`}
            onClick={() => setActiveRole("customer")}
            onMouseEnter={() => setActiveRole("customer")}
          >
            <div className="role-card__top">
              <BasketArt />
              <div>
                <h3>I’m shopping</h3>
                <p>Find groceries and order from nearby shops.</p>
              </div>
            </div>
            <Link to="/customer" className="role-btn">
              Browse as customer <ArrowIcon />
            </Link>
          </article>

          <article
            className={`role-card ${activeRole === "seller" ? "role-card--active" : ""}`}
            onClick={() => setActiveRole("seller")}
            onMouseEnter={() => setActiveRole("seller")}
          >
            <div className="role-card__top">
              <StoreArt />
              <div>
                <h3>I run a shop</h3>
                <p>List products and manage local orders.</p>
              </div>
            </div>
            <Link to="/seller" className="role-btn">
              Start selling <ArrowIcon />
            </Link>
          </article>

        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer">
        <Footer_Home />
      </footer>
    </div>
  );
};

export default Home;