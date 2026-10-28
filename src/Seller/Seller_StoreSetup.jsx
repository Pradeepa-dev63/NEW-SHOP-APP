
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import groceryImage from "../Assets/seller_img/grocery-login-bg.jpg.png";
import "./Seller_StoreSetup.css";

function Seller_StoreSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("nearshopStoreSetup") || "{}"
      );

      return {
        address: saved.address || "",
        pincode: saved.pincode || "",
        openingHours: saved.openingHours || "",
        deliveryRadius: saved.deliveryRadius || "5",
      };
    } catch {
      return {
        address: "",
        pincode: "",
        openingHours: "",
        deliveryRadius: "5",
      };
    }
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  let sellerProfile = {};

  try {
    sellerProfile = JSON.parse(
      localStorage.getItem("nearshopSellerProfile") || "{}"
    );
  } catch {
    sellerProfile = {};
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (form.address.trim().length < 8) {
      nextErrors.address = "Enter your complete shop address.";
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6-digit PIN code.";
    }

    if (!form.openingHours) {
      nextErrors.openingHours = "Please select your opening hours.";
    }

    const radius = Number(form.deliveryRadius);

    if (!Number.isFinite(radius) || radius < 1 || radius > 50) {
      nextErrors.deliveryRadius =
        "Delivery radius must be between 1 and 50 km.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const storeDetails = {
      ...form,
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      deliveryRadius: Number(form.deliveryRadius),
      storeSetupCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "nearshopStoreSetup",
        JSON.stringify(storeDetails)
      );

      setMessage("Store details saved successfully.");

      // Continue to dashboard after saving.
      navigate("/seller/dashboard");
    } catch {
      setMessage(
        "Could not save your store details. Check your browser storage."
      );
    }
  };

  return (
    <main
      className="ns-store-page"
      style={{ "--ns-store-background": `url("${groceryImage}")` }}
    >
      <header className="ns-store-header">
        <Link to="/" className="ns-store-brand">
          <span className="ns-store-brand-icon">♥</span>

          <span>
            <strong>Near<span>Shop</span></strong>
            <small>Grocery Marketplace</small>
          </span>
        </Link>

        <div className="ns-store-header-right">
          <span>Welcome, {sellerProfile.ownerName || "Seller"}</span>
          <Link to="/seller/login">Sign out</Link>
        </div>
      </header>

      <section className="ns-store-content">
        <div className="ns-store-card">
          <div className="ns-store-card-logo">
            <span className="ns-store-pin-icon">♥</span>
            <strong>Near<span>Shop</span></strong>
          </div>

          <div className="ns-store-heading">
            <span className="ns-store-step-label">SELLER ONBOARDING</span>
            <h1>Set up your store</h1>
            <p>Tell customers where and when you sell.</p>
          </div>

          <div className="ns-store-progress">
            <span className="ns-store-progress-number">1</span>
            <div>
              <strong>Store details</strong>
              <small>Location and opening hours</small>
            </div>
            <span className="ns-store-progress-badge">In progress</span>
          </div>

          {message && (
            <div className="ns-store-message" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="ns-store-field">
              <label htmlFor="store-address">Shop address</label>
              <textarea
                id="store-address"
                name="address"
                rows={3}
                placeholder="Door number, street, area and city"
                value={form.address}
                onChange={handleChange}
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address && (
                <small className="ns-store-error">{errors.address}</small>
              )}
            </div>

            <div className="ns-store-field">
              <label htmlFor="store-pincode">PIN code</label>
              <input
                id="store-pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={form.pincode}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                  }));
                  setErrors((previous) => ({
                    ...previous,
                    pincode: "",
                  }));
                  setMessage("");
                }}
                aria-invalid={Boolean(errors.pincode)}
              />
              {errors.pincode && (
                <small className="ns-store-error">{errors.pincode}</small>
              )}
            </div>

            <div className="ns-store-field">
              <label htmlFor="store-hours">Opening hours</label>
              <select
                id="store-hours"
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                aria-invalid={Boolean(errors.openingHours)}
              >
                <option value="">Select opening hours</option>
                <option value="6:00 AM - 12:00 PM">
                  6:00 AM – 12:00 PM
                </option>
                <option value="8:00 AM - 8:00 PM">
                  8:00 AM – 8:00 PM
                </option>
                <option value="9:00 AM - 9:00 PM">
                  9:00 AM – 9:00 PM
                </option>
                <option value="10:00 AM - 10:00 PM">
                  10:00 AM – 10:00 PM
                </option>
                <option value="24 hours">Open 24 hours</option>
              </select>
              {errors.openingHours && (
                <small className="ns-store-error">
                  {errors.openingHours}
                </small>
              )}
            </div>

            <div className="ns-store-field">
              <label htmlFor="store-radius">Delivery radius (km)</label>
              <select
                id="store-radius"
                name="deliveryRadius"
                value={form.deliveryRadius}
                onChange={handleChange}
                aria-invalid={Boolean(errors.deliveryRadius)}
              >
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="3">3 km</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="20">20 km</option>
                <option value="30">30 km</option>
                <option value="50">50 km</option>
              </select>
              {errors.deliveryRadius && (
                <small className="ns-store-error">
                  {errors.deliveryRadius}
                </small>
              )}
              <small className="ns-store-help">
                Select the distance your store can deliver to customers.
              </small>
            </div>

            <div className="ns-store-actions">
              <Link to="/seller/register" className="ns-store-back">
                ← Back
              </Link>

              <button type="submit" className="ns-store-submit">
                Save store details <span>→</span>
              </button>
            </div>
          </form>

          <div className="ns-store-secure-note">
            <span>✓</span>
            Your store details stay saved in this browser demo.
          </div>
        </div>
      </section>

      <footer className="ns-store-footer">
        <span>© {new Date().getFullYear()} NearShop</span>
        <span>Local shops, fresh choices.</span>
        <div>
          <Link to="/">Home</Link>
          <span>·</span>
          <span>Privacy Policy</span>
          <span>·</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </main>
  );
}

export default Seller_StoreSetup;
