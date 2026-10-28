import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../Assets/logo.png";
import "./Navbar.css";
import { useCart } from "../Context/CartContext";


const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const BasketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9h18l-2 11H5L3 9Z" />
    <path d="m8 9 4-6 4 6" />
    <path d="M9 13v3M15 13v3" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  </svg>
);

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Near Shop home">
          <img src={logo} alt="Near Shop" className="navbar__logo" />
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/shops" className="navbar__link">
            Explore shops
          </NavLink>
          <NavLink to="/how-it-works" className="navbar__link">
            How it works
          </NavLink>
          <NavLink to="/sellers" className="navbar__link">
            For sellers
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/wishlist" className="navbar__icon-link"
            aria-label="Wishlist" title="Wishlist">
            <HeartIcon />
          </Link>

          <Link
            to="/Add_to_card"
            className="navbar__icon-link"
            aria-label={`Shopping basket, ${cartCount} items`}
            title="Shopping basket"
          >
            <BasketIcon />

            {cartCount > 0 && (
              <span className="navbar__cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/signin" className="navbar__signin">
            <UserIcon />
            <span>Sign in</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
