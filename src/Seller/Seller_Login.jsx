
import React, { useState } from "react";
import { Link } from "react-router-dom";
import groceryImage from "../Assets/seller_img/seller-auth-background.png.jpeg";
import "./Seller_Login.css";
import logo from "../Assets/logo.png"

function Seller_Login() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    const value = identity.trim();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isMobile = /^[6-9]\d{9}$/.test(value);

    if (!value) {
      nextErrors.identity = "Email or mobile number is required.";
    } else if (!isEmail && !isMobile) {
      nextErrors.identity = "Enter a valid email or 10-digit mobile number.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length === 0) {
      setMessage(
        "Your form is valid. Connect the backend API to sign in securely."
      );
    }
  };

  return (
    <main
      className="ns-auth"
      style={{ "--ns-auth-background": `url("${groceryImage}")` }}
    >
      <header className="ns-auth-header">
        <Link to="/" className="navbar__brand" aria-label="Near Shop home">
          <img src={logo} alt="Near Shop" className="navbar__logo" />
        </Link>

        <div className="ns-auth-header-action">
          <span>New to NearShop?</span>
          <Link to="/seller/register" className="ns-auth-create">
            Create Account →
          </Link>
        </div>
      </header>

      <div className="ns-auth-layout">
        <section className="ns-auth-intro">
          <span className="ns-auth-eyebrow">NEARSHOP SELLER PARTNER</span>

          <h1>
            Grow Your Grocery Store
            <br />
            With NearShop
          </h1>

          <p>
            Reach nearby customers, showcase your products, and
            grow your local grocery business in one place.
          </p>

          <div className="ns-auth-benefits">
            <article>
              <span>♧</span>
              <div>
                <h3>Manage Your Products</h3>
                <p>Keep your grocery catalogue updated.</p>
              </div>
            </article>

            <article>
              <span>▣</span>
              <div>
                <h3>Reach Local Customers</h3>
                <p>Bring your neighbourhood store online.</p>
              </div>
            </article>

            <article>
              <span>↗</span>
              <div>
                <h3>Track Your Orders</h3>
                <p>Manage orders and sales in one place.</p>
              </div>
            </article>

            <article>
              <span>✓</span>
              <div>
                <h3>Built for Local Shops</h3>
                <p>Organise your store's daily activities.</p>
              </div>
            </article>
          </div>

          <div className="ns-auth-produce">
            <img src={groceryImage} alt="Fresh vegetables and groceries" />
          </div>
        </section>

        <section className="ns-auth-form-area">
          <div className="ns-auth-card">
              <img src={logo} alt="Near Shop" className="navbar__logo" />

            <div className="ns-auth-card-heading">
              <h2>Seller Login</h2>
              <p>Sign in to manage your store</p>
            </div>

            {message && (
              <div className="ns-auth-message" role="status">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="ns-auth-field">
                <label htmlFor="seller-identity">
                  Email or Mobile Number
                </label>
                <input
                  id="seller-identity"
                  type="text"
                  value={identity}
                  onChange={(event) => {
                    setIdentity(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      identity: "",
                    }));
                    setMessage("");
                  }}
                  placeholder="Enter email or mobile number"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.identity)}
                />
                {errors.identity && (
                  <small className="ns-auth-error">
                    {errors.identity}
                  </small>
                )}
              </div>

              <div className="ns-auth-field">
                <label htmlFor="seller-password">Password</label>
                <div className="ns-auth-password">
                  <input
                    id="seller-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((previous) => ({
                        ...previous,
                        password: "",
                      }));
                      setMessage("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <small className="ns-auth-error">
                    {errors.password}
                  </small>
                )}
              </div>

              <div className="ns-auth-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Password reset requires a connected authentication backend."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="ns-auth-submit">
                Login <span>→</span>
              </button>
            </form>

            <div className="ns-auth-divider"><span>OR</span></div>

            <button
              type="button"
              className="ns-auth-google"
              onClick={() =>
                setMessage("Google sign-in requires OAuth configuration.")
              }
            >
              <strong>G</strong>
              Continue with Google
            </button>

            <p className="ns-auth-bottom">
              Don't have a seller account?{" "}
              <Link to="/seller/register">Create Account</Link>
            </p>
          </div>
        </section>
      </div>

      <footer className="ns-auth-footer">
        <span>© {new Date().getFullYear()} NearShop</span>
        <span>Local shops, fresh choices.</span>
        <div>
          <span>Privacy Policy</span>
          <span className="ns-footer-separator">·</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </main>
  );
}

export default Seller_Login;
