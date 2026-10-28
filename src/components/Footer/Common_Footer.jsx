import React from "react";
import logo from "../../Assets/logo.png"

const quickLinks = [
  { label: "About us", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Help & Support", href: "#support" },
  { label: "Terms of service", href: "#terms" },
  { label: "Privacy policy", href: "#privacy" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { label: "Facebook", icon: "f", href: "https://www.facebook.com/" },
  { label: "Instagram", icon: "◎", href: "https://www.instagram.com/" },
  { label: "YouTube", icon: "▶", href: "https://www.youtube.com/" },
  { label: "LinkedIn", icon: "in", href: "https://www.linkedin.com/" },
];

export default function Common_Footer() {
  return (
    <>
      <style>{`
        .nearshop-footer {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 14px 4%;
          border-top: 1px solid #e4e9e1;
          background: #fff;
          color: #385244;
          font-family: Arial, sans-serif;
        }

        .nearshop-footer-brand img {
          display: block;
          width: 145px;
          max-height: 42px;
          object-fit: contain;
        }

        .nearshop-footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 24px;
          padding-left: 24px;
          border-left: 1px solid #d9e1d8;
        }

        .nearshop-footer a {
          color: inherit;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .nearshop-footer-links a {
          white-space: nowrap;
          font-size: 13px;
        }

        .nearshop-footer a:hover {
          color: #69ad17;
        }

        .nearshop-footer-social {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 24px;
          border-left: 1px solid #d9e1d8;
          border-right: 1px solid #d9e1d8;
        }

        .nearshop-social-icon {
          min-width: 18px;
          color: #123d2c;
          font-size: 17px;
          font-weight: 700;
          line-height: 1;
          text-align: center;
        }

        .nearshop-footer-tagline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #617267;
          font-size: 12px;
          line-height: 1.4;
        }

        .nearshop-footer-leaf {
          color: #70b515;
          font-size: 20px;
        }

        @media (max-width: 900px) {
          .nearshop-footer {
            justify-content: center;
            flex-wrap: wrap;
          }

          .nearshop-footer-links {
            border-left: 0;
            padding-left: 0;
          }

          .nearshop-footer-social {
            border-right: 0;
          }
        }

        @media (max-width: 560px) {
          .nearshop-footer {
            flex-direction: column;
            gap: 16px;
            padding: 20px 5%;
          }

          .nearshop-footer-links {
            gap: 12px 18px;
          }

          .nearshop-footer-social {
            padding: 0;
            border: 0;
          }

          .nearshop-footer-tagline {
            text-align: center;
          }
        }
      `}</style>

      <footer className="nearshop-footer">
        <a className="nearshop-footer-brand" href="/" aria-label="NearShop home">
          <img src={logo} alt="NearShop" />
        </a>

        <nav className="nearshop-footer-links" aria-label="Footer links">
          {quickLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nearshop-footer-social" aria-label="Social media">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
            >
              <span className="nearshop-social-icon" aria-hidden="true">
                {social.icon}
              </span>
            </a>
          ))}
        </div>

        <p className="nearshop-footer-tagline">
          <span>Stronger neighbourhoods<br />through better food</span>
          <span className="nearshop-footer-leaf" aria-hidden="true"></span>
        </p>
      </footer>
    </>
  );
}