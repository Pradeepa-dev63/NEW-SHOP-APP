import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import groceryImage from "../Assets/seller_img/seller-auth-background.png.jpeg";
import "./Seller_Register.css";

function Seller_Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  // Keep focus on the OTP field without forcing the page to scroll.
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpStep) {
      otpInputRef.current?.focus({ preventScroll: true });
    }
  }, [otpStep]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      terms: "",
    }));

    setMessage("");
  };

  const handleRegister = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (form.shopName.trim().length < 2) {
      nextErrors.shopName = "Enter your shop name.";
    }

    if (form.ownerName.trim().length < 2) {
      nextErrors.ownerName = "Enter the owner's full name.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      nextErrors.password =
        "Include an uppercase letter and a number.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setOtp("");
    setErrors({});
    setOtpStep(true);

    setMessage(
      "Demo verification: enter 123456 to test OTP verification. Real OTP delivery requires a backend."
    );
  };

  const verifyOtp = (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setErrors({
        otp: "Enter the six-digit OTP.",
      });
      return;
    }

    if (otp !== "123456") {
      setErrors({
        otp: "Incorrect demo OTP. Enter 123456.",
      });
      return;
    }

    const profile = {
      shopName: form.shopName.trim(),
      ownerName: form.ownerName.trim(),
      phone: form.phone,
      countryCode: "+91",
      email: form.email.trim().toLowerCase(),
      registrationDemoCompleted: true,
    };

    try {
      localStorage.setItem(
        "nearshopSellerProfile",
        JSON.stringify(profile)
      );

      localStorage.setItem("nearshopSellerRegistered", "true");

      navigate("/seller/store-setup");
    } catch {
      setMessage("Your browser could not save the demo profile.");
    }
  };

  return (
    <main
      className="ns-auth ns-auth--register"
      style={{
        "--ns-auth-background": `url("${groceryImage}")`,
      }}
    >
      {/* Header */}
      <header className="ns-auth-header">
        <Link to="/" className="ns-auth-brand">
          <span className="ns-auth-mark">♥</span>

          <span className="ns-auth-brand-text">
            <strong>
              Near<span>Shop</span>
            </strong>
            <small>Grocery Marketplace</small>
          </span>
        </Link>

        <div className="ns-auth-header-action">
          <span>Already a seller?</span>

          <Link to="/seller/login" className="ns-auth-create">
            ← Sign In
          </Link>
        </div>
      </header>

      {/* Main layout */}
      <div className="ns-auth-layout">
        {/* Left promotional section */}
        <section className="ns-auth-intro">
          <span className="ns-auth-eyebrow">
            JOIN OUR SELLER COMMUNITY
          </span>

          <h1>
            Bring Your Store
            <br />
            Closer to Home
          </h1>

          <p>
            Join NearShop, showcase your grocery products, and connect
            with customers in your neighbourhood.
          </p>

          <div className="ns-auth-benefits">
            <article>
              <span>♧</span>
              <div>
                <h3>Showcase Your Products</h3>
                <p>List your everyday groceries.</p>
              </div>
            </article>

            <article>
              <span>▣</span>
              <div>
                <h3>Reach More Customers</h3>
                <p>Grow your local business online.</p>
              </div>
            </article>

            <article>
              <span>↗</span>
              <div>
                <h3>Manage Your Store</h3>
                <p>Keep store details organised.</p>
              </div>
            </article>

            <article>
              <span>✓</span>
              <div>
                <h3>Start Selling Locally</h3>
                <p>Set up your store after registration.</p>
              </div>
            </article>
          </div>

          <div className="ns-auth-produce">
            <img
              src={groceryImage}
              alt="Fresh vegetables and groceries"
            />
          </div>
        </section>

        {/* Registration and OTP section */}
        <section className="ns-auth-form-area">
          <div className="ns-auth-card">
            <div className="ns-auth-card-brand">
              <span className="ns-auth-mark">♥</span>

              <strong>
                Near<span>Shop</span>
              </strong>
            </div>

            {!otpStep ? (
              <>
                <div className="ns-auth-card-heading">
                  <h2>Create Seller Account</h2>
                  <p>Register your shop to get started</p>
                </div>

                {message && (
                  <div className="ns-auth-message" role="status">
                    {message}
                  </div>
                )}

                <form onSubmit={handleRegister} noValidate>
                  {/* Shop name */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-shop-name">
                      Shop Name
                    </label>

                    <input
                      id="seller-shop-name"
                      name="shopName"
                      type="text"
                      value={form.shopName}
                      onChange={updateField}
                      placeholder="e.g. Green Basket Grocery"
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.shopName)}
                    />

                    {errors.shopName && (
                      <small className="ns-auth-error">
                        {errors.shopName}
                      </small>
                    )}
                  </div>

                  {/* Owner name */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-owner-name">
                      Owner Full Name
                    </label>

                    <input
                      id="seller-owner-name"
                      name="ownerName"
                      type="text"
                      value={form.ownerName}
                      onChange={updateField}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.ownerName)}
                    />

                    {errors.ownerName && (
                      <small className="ns-auth-error">
                        {errors.ownerName}
                      </small>
                    )}
                  </div>

                  {/* Mobile number with +91 prefix */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-register-phone">
                      Mobile Number
                    </label>

                    <div className="ns-auth-phone-control">
                      <span className="ns-auth-country-code">
                        +91
                      </span>

                      <input
                        id="seller-register-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(event) => {
                          const digits = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setForm((previous) => ({
                            ...previous,
                            phone: digits,
                          }));

                          setErrors((previous) => ({
                            ...previous,
                            phone: "",
                          }));

                          setMessage("");
                        }}
                        placeholder="Enter mobile number"
                        autoComplete="tel-national"
                        aria-invalid={Boolean(errors.phone)}
                      />
                    </div>

                    {errors.phone && (
                      <small className="ns-auth-error">
                        {errors.phone}
                      </small>
                    )}
                  </div>

                  {/* Email */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-register-email">
                      Email Address
                    </label>

                    <input
                      id="seller-register-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="seller@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                    />

                    {errors.email && (
                      <small className="ns-auth-error">
                        {errors.email}
                      </small>
                    )}
                  </div>

                  {/* Password */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-register-password">
                      Password
                    </label>

                    <div className="ns-auth-password">
                      <input
                        id="seller-register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={updateField}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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

                  {/* Confirm password */}
                  <div className="ns-auth-field">
                    <label htmlFor="seller-confirm-password">
                      Confirm Password
                    </label>

                    <div className="ns-auth-password">
                      <input
                        id="seller-confirm-password"
                        name="confirmPassword"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        value={form.confirmPassword}
                        onChange={updateField}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.confirmPassword)}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <small className="ns-auth-error">
                        {errors.confirmPassword}
                      </small>
                    )}
                  </div>

                  {/* Terms */}
                  <label className="ns-auth-terms">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => {
                        setAcceptedTerms(event.target.checked);

                        setErrors((previous) => ({
                          ...previous,
                          terms: "",
                        }));
                      }}
                    />

                    <span>
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>

                  {errors.terms && (
                    <small className="ns-auth-error">
                      {errors.terms}
                    </small>
                  )}

                  <button type="submit" className="ns-auth-submit">
                    Create Account <span>→</span>
                  </button>
                </form>

                <div className="ns-auth-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="ns-auth-google"
                  onClick={() =>
                    setMessage(
                      "Google sign-in requires OAuth configuration."
                    )
                  }
                >
                  <strong>G</strong>
                  Continue with Google
                </button>

                <p className="ns-auth-bottom">
                  Already have a seller account?{" "}
                  <Link to="/seller/login">Login</Link>
                </p>
              </>
            ) : (
              <>
                {/* OTP verification screen */}
                <div className="ns-auth-card-heading">
                  <h2>Verify Your Account</h2>
                  <p>Enter the six-digit demo OTP to continue</p>
                </div>

                {message && (
                  <div className="ns-auth-message" role="status">
                    {message}
                  </div>
                )}

                <form onSubmit={verifyOtp} noValidate>
                  <div className="ns-auth-field">
                    <label htmlFor="seller-register-otp">
                      6-Digit OTP
                    </label>

                    <input
                      ref={otpInputRef}
                      id="seller-register-otp"
                      type="text"
                      value={otp}
                      onChange={(event) => {
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        );

                        setErrors({});
                      }}
                      placeholder="Enter 123456 for the demo"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      aria-invalid={Boolean(errors.otp)}
                    />

                    {errors.otp && (
                      <small className="ns-auth-error">
                        {errors.otp}
                      </small>
                    )}
                  </div>

                  <button type="submit" className="ns-auth-submit">
                    Verify &amp; Continue <span>→</span>
                  </button>
                </form>

                <p className="ns-auth-bottom">
                  <button
                    type="button"
                    className="ns-auth-back"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp("");
                      setErrors({});
                      setMessage("");
                    }}
                  >
                    ← Back to registration
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
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

export default Seller_Register;