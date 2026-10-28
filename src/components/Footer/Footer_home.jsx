import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer_Home.css";
import logoImage from "../../Assets/logo.png";


const quickLinks = [
  ["About us", "/about"],
  ["Blog", "/blog"],
  ["Help & Support", "/help"],
  ["Terms of service", "/terms"],
  ["Privacy policy", "/privacy"],
  ["Contact", "/contact"],
];

const shopLinks = [
  ["Fruits & vegetables", "/categories/produce"],
  ["Dairy & bakery", "/categories/dairy-bakery"],
  ["Pantry essentials", "/categories/pantry"],
  ["Local shops", "/shops"],
];

const careLinks = [
  ["Contact us", "/contact"],
  ["Delivery information", "/delivery"],
  ["Returns & refunds", "/returns"],
  ["FAQs", "/help"],
];

function SocialIcon({ type }) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="footer-instagram-dot" cx="17.5" cy="6.5" r="1" />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM2.5 9h3v12h-3zM9 9h2.9v1.7h.1c.4-.8 1.4-1.9 3.2-1.9 3.4 0 4 2.2 4 5.2V21h-3v-6.1c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H9z" />
    </svg>
  );
}

function LinkColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {links.map(([label, path]) => (
        <Link to={path} key={label}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer({ logo }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand" aria-label="NearShop home">
            <img src={logoImage} alt="NearShop" />
          </Link>

          <p className="footer-brand-tagline">
            Fresh food. Stronger neighbourhoods.
          </p>


        </div>

        <LinkColumn title="Quick Links" links={quickLinks} />
        <LinkColumn title="Shop" links={shopLinks} />

        <div className="footer-column footer-care-column">
          <h3>Customer Care</h3>
          {careLinks.map(([label, path]) => (
            <Link to={path} key={label}>
              {label}
            </Link>
          ))}
          
          <a className="footer-contact" href="tel:+919876543210">
            <span>☎</span> +91 876 543 210
          </a>
          <a className="footer-contact" href="mailto:support@nearshop.in">
            <span>✉</span> support@nearshop.in
          </a>
        </div>

        <div className="footer-newsletter-column">
          <h3>Follow NearShop</h3>

          <div className="footer-socials footer-socials-large" aria-label="Follow NearShop">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <SocialIcon type="facebook" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <SocialIcon type="instagram" />
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
              <SocialIcon type="youtube" />
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <SocialIcon type="linkedin" />
            </a>
          </div>

          <div className="footer-newsletter">
            <h4>Get fresh updates</h4>
            <p>Recipes, local stories and exclusive offers, straight to your inbox.</p>

            {subscribed && (
              <p className="footer-success" role="status">
                Thanks for subscribing!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NearShop. All rights reserved.</span>
        <span>
          Made for your neighbourhood <b> ♥ </b>
        </span>
      </div>
    </footer>
  );
}