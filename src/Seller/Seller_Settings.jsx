
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Settings.css";

const STORAGE_KEY = "nearshopSellerSettings";

const defaultSettings = {
  storeName: "Fresh Basket Store",
  ownerName: "",
  email: "",
  phone: "",
  category: "Grocery & Staples",
  address: "",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "",
  deliveryRadius: "5",
  openingTime: "08:00",
  closingTime: "21:00",
  description: "",
  storeStatus: "Open",
  emailNotifications: true,
  orderNotifications: true,
  lowStockNotifications: true,
  promotionalNotifications: false,
};

function readSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return defaultSettings;

    const parsed = JSON.parse(saved);

    return {
      ...defaultSettings,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
  } catch (error) {
    console.error("Could not load seller settings:", error);
    return defaultSettings;
  }
}

export default function Seller_Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [activeTab, setActiveTab] = useState("store");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Seller Settings | NearShop";
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setNotice("");
  }

  function validateSettings() {
    const nextErrors = {};

    if (!settings.storeName.trim()) {
      nextErrors.storeName = "Store name is required.";
    }

    if (
      settings.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      settings.phone &&
      !/^[0-9+\-\s()]{7,20}$/.test(settings.phone)
    ) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (
      settings.pincode &&
      !/^\d{6}$/.test(settings.pincode.trim())
    ) {
      nextErrors.pincode = "Enter a 6-digit Indian PIN code.";
    }

    const radius = Number(settings.deliveryRadius);

    if (
      !Number.isFinite(radius) ||
      radius < 1 ||
      radius > 100
    ) {
      nextErrors.deliveryRadius =
        "Delivery radius must be between 1 and 100 km.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveSettings(event) {
    event.preventDefault();
    setNotice("");

    if (!validateSettings()) {
      setNotice("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const cleanedSettings = {
        ...settings,
        storeName: settings.storeName.trim(),
        ownerName: settings.ownerName.trim(),
        email: settings.email.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
        city: settings.city.trim(),
        state: settings.state.trim(),
        pincode: settings.pincode.trim(),
        description: settings.description.trim(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleanedSettings)
      );

      setSettings(cleanedSettings);
      setNotice("Your settings have been saved successfully.");
    } catch (error) {
      console.error("Could not save seller settings:", error);

      setNotice(
        "Could not save settings. Check your browser storage and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all settings to the default values?"
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(defaultSettings);
      setErrors({});
      setNotice("Settings have been reset.");
    } catch (error) {
      console.error("Could not reset settings:", error);
      setNotice("Could not reset settings.");
    }
  }

  const tabs = [
    { id: "store", label: "Store Profile", icon: "🏪" },
    { id: "delivery", label: "Delivery", icon: "🚚" },
    { id: "notifications", label: "Notifications", icon: "♧" },
    { id: "account", label: "Account", icon: "♙" },
  ];

  return (
    <div className="nss-page">
      <aside className="nss-sidebar">
        <Link to="/seller/dashboard" className="nss-brand">
          <span className="nss-brand-icon">🌿</span>
          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nss-navigation" aria-label="Seller navigation">
          <Link to="/seller/dashboard" className="nss-nav-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link to="/seller/products" className="nss-nav-link">
            <span>▣</span> Products
          </Link>

          <Link to="/seller/orders" className="nss-nav-link">
            <span>🛒</span> Orders
          </Link>

          <Link to="/seller/inventory" className="nss-nav-link">
            <span>▤</span> Inventory
          </Link>

          <Link to="/seller/reports" className="nss-nav-link">
            <span>₹</span> Reports
          </Link>

          <Link to="/seller/settings" className="nss-nav-link active">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nss-promo">
          <span>🏪</span>
          <h3>Your store, your way</h3>
          <p>Keep your shop information accurate for your customers.</p>
          <Link to="/seller/products">Manage Products</Link>
        </div>

        <small className="nss-sidebar-footer">
          © 2026 NearShop
        </small>
      </aside>

      <main className="nss-main">
        <header className="nss-topbar">
          <div className="nss-store-profile">
            <span className="nss-avatar">♙</span>
            <span>
              <strong>{settings.storeName || "Your Store"}</strong>
              <small>Seller account</small>
            </span>
          </div>

          <Link to="/seller/dashboard" className="nss-back-link">
            ← Back to Dashboard
          </Link>
        </header>

        <div className="nss-content">
          <section className="nss-heading">
            <div>
              <p className="nss-eyebrow">PREFERENCES & CONFIGURATION</p>
              <h1>Store Settings</h1>
              <p>
                Manage your store information, delivery preferences, and
                account notifications.
              </p>
            </div>

            <span className="nss-settings-badge">
              ⚙ Settings
            </span>
          </section>

          {notice && (
            <div className="nss-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          <div className="nss-settings-layout">
            <aside className="nss-settings-menu">
              <div className="nss-menu-title">SETTINGS MENU</div>

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`nss-tab-button ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setNotice("");
                  }}
                >
                  <span className="nss-tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="nss-tab-arrow">›</span>
                </button>
              ))}

              <div className="nss-menu-help">
                <span>💡</span>
                <strong>Need help?</strong>
                <p>Keep your contact details and store hours up to date.</p>
              </div>
            </aside>

            <section className="nss-settings-panel">
              <form onSubmit={saveSettings} noValidate>
                {activeTab === "store" && (
                  <>
                    <div className="nss-section-heading">
                      <div className="nss-section-icon">🏪</div>
                      <div>
                        <h2>Store Profile</h2>
                        <p>
                          Set up the basic information about your local shop.
                        </p>
                      </div>
                    </div>

                    <div className="nss-store-preview">
                      <div className="nss-preview-avatar">🌿</div>
                      <div>
                        <strong>{settings.storeName || "Your Store Name"}</strong>
                        <span>
                          {settings.category} · {settings.city || "Your City"}
                        </span>
                        <span
                          className={`nss-store-status ${
                            settings.storeStatus === "Open"
                              ? "open"
                              : "closed"
                          }`}
                        >
                          ● {settings.storeStatus}
                        </span>
                      </div>
                    </div>

                    <div className="nss-form-grid">
                      <div className="nss-field">
                        <label htmlFor="settings-store-name">
                          Store Name <span>*</span>
                        </label>
                        <input
                          id="settings-store-name"
                          name="storeName"
                          value={settings.storeName}
                          onChange={handleChange}
                          placeholder="Enter your store name"
                          maxLength={100}
                          aria-invalid={Boolean(errors.storeName)}
                        />
                        {errors.storeName && (
                          <small className="nss-error">
                            {errors.storeName}
                          </small>
                        )}
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-category">
                          Store Category
                        </label>
                        <select
                          id="settings-category"
                          name="category"
                          value={settings.category}
                          onChange={handleChange}
                        >
                          <option>Grocery & Staples</option>
                          <option>Fruits & Vegetables</option>
                          <option>Dairy & Eggs</option>
                          <option>Bakery & Snacks</option>
                          <option>Beverages</option>
                          <option>Household Essentials</option>
                          <option>Organic Products</option>
                          <option>General Store</option>
                          <option>Others</option>
                        </select>
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-owner">
                          Owner Name
                        </label>
                        <input
                          id="settings-owner"
                          name="ownerName"
                          value={settings.ownerName}
                          onChange={handleChange}
                          placeholder="Enter owner name"
                          maxLength={100}
                        />
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-phone">
                          Contact Number
                        </label>
                        <input
                          id="settings-phone"
                          name="phone"
                          type="tel"
                          value={settings.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          aria-invalid={Boolean(errors.phone)}
                        />
                        {errors.phone && (
                          <small className="nss-error">
                            {errors.phone}
                          </small>
                        )}
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-email">
                          Email Address
                        </label>
                        <input
                          id="settings-email"
                          name="email"
                          type="email"
                          value={settings.email}
                          onChange={handleChange}
                          placeholder="store@example.com"
                          aria-invalid={Boolean(errors.email)}
                        />
                        {errors.email && (
                          <small className="nss-error">
                            {errors.email}
                          </small>
                        )}
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-status">
                          Store Availability
                        </label>
                        <select
                          id="settings-status"
                          name="storeStatus"
                          value={settings.storeStatus}
                          onChange={handleChange}
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div className="nss-field nss-field-full">
                        <label htmlFor="settings-description">
                          Store Description
                        </label>
                        <textarea
                          id="settings-description"
                          name="description"
                          value={settings.description}
                          onChange={handleChange}
                          rows={4}
                          maxLength={500}
                          placeholder="Describe your store and the products you sell..."
                        />
                        <small className="nss-help">
                          {settings.description.length}/500 characters
                        </small>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "delivery" && (
                  <>
                    <div className="nss-section-heading">
                      <div className="nss-section-icon">🚚</div>
                      <div>
                        <h2>Address & Delivery</h2>
                        <p>
                          Configure your store location and local delivery
                          preferences.
                        </p>
                      </div>
                    </div>

                    <div className="nss-form-grid">
                      <div className="nss-field nss-field-full">
                        <label htmlFor="settings-address">
                          Store Address
                        </label>
                        <textarea
                          id="settings-address"
                          name="address"
                          value={settings.address}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Building number, street, area"
                        />
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-city">City</label>
                        <input
                          id="settings-city"
                          name="city"
                          value={settings.city}
                          onChange={handleChange}
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-state">State</label>
                        <input
                          id="settings-state"
                          name="state"
                          value={settings.state}
                          onChange={handleChange}
                          placeholder="Enter state"
                        />
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-pincode">PIN Code</label>
                        <input
                          id="settings-pincode"
                          name="pincode"
                          inputMode="numeric"
                          value={settings.pincode}
                          onChange={handleChange}
                          placeholder="6-digit PIN code"
                          maxLength={6}
                          aria-invalid={Boolean(errors.pincode)}
                        />
                        {errors.pincode && (
                          <small className="nss-error">
                            {errors.pincode}
                          </small>
                        )}
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-radius">
                          Delivery Radius (km)
                        </label>
                        <input
                          id="settings-radius"
                          name="deliveryRadius"
                          type="number"
                          min="1"
                          max="100"
                          value={settings.deliveryRadius}
                          onChange={handleChange}
                          aria-invalid={Boolean(errors.deliveryRadius)}
                        />
                        {errors.deliveryRadius && (
                          <small className="nss-error">
                            {errors.deliveryRadius}
                          </small>
                        )}
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-opening">
                          Opening Time
                        </label>
                        <input
                          id="settings-opening"
                          name="openingTime"
                          type="time"
                          value={settings.openingTime}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="nss-field">
                        <label htmlFor="settings-closing">
                          Closing Time
                        </label>
                        <input
                          id="settings-closing"
                          name="closingTime"
                          type="time"
                          value={settings.closingTime}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="nss-info-box">
                      <span>ⓘ</span>
                      <p>
                        These are saved delivery preferences. Actual delivery
                        availability and distance validation require integration
                        with your order and location services.
                      </p>
                    </div>
                  </>
                )}

                {activeTab === "notifications" && (
                  <>
                    <div className="nss-section-heading">
                      <div className="nss-section-icon">♧</div>
                      <div>
                        <h2>Notification Preferences</h2>
                        <p>
                          Choose which notification preferences to keep enabled.
                        </p>
                      </div>
                    </div>

                    <div className="nss-toggle-list">
                      <label className="nss-toggle-row">
                        <span className="nss-toggle-symbol">✉</span>
                        <span className="nss-toggle-copy">
                          <strong>Email Notifications</strong>
                          <small>
                            Preference for receiving account-related emails.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                        />
                        <span className="nss-toggle-track" />
                      </label>

                      <label className="nss-toggle-row">
                        <span className="nss-toggle-symbol">🛒</span>
                        <span className="nss-toggle-copy">
                          <strong>New Order Notifications</strong>
                          <small>
                            Preference for alerts about new customer orders.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          name="orderNotifications"
                          checked={settings.orderNotifications}
                          onChange={handleChange}
                        />
                        <span className="nss-toggle-track" />
                      </label>

                      <label className="nss-toggle-row">
                        <span className="nss-toggle-symbol">▤</span>
                        <span className="nss-toggle-copy">
                          <strong>Low Stock Alerts</strong>
                          <small>
                            Preference for stock warning notifications.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          name="lowStockNotifications"
                          checked={settings.lowStockNotifications}
                          onChange={handleChange}
                        />
                        <span className="nss-toggle-track" />
                      </label>

                      <label className="nss-toggle-row">
                        <span className="nss-toggle-symbol">✦</span>
                        <span className="nss-toggle-copy">
                          <strong>Offers & Promotions</strong>
                          <small>
                            Preference for updates about NearShop promotions.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          name="promotionalNotifications"
                          checked={settings.promotionalNotifications}
                          onChange={handleChange}
                        />
                        <span className="nss-toggle-track" />
                      </label>
                    </div>

                    <div className="nss-info-box">
                      <span>ⓘ</span>
                      <p>
                        These controls save notification preferences locally.
                        Email, SMS, and push notifications will not be sent
                        until a notification service is connected.
                      </p>
                    </div>
                  </>
                )}

                {activeTab === "account" && (
                  <>
                    <div className="nss-section-heading">
                      <div className="nss-section-icon">♙</div>
                      <div>
                        <h2>Account Preferences</h2>
                        <p>
                          Review the current seller profile and security notes.
                        </p>
                      </div>
                    </div>

                    <div className="nss-account-card">
                      <div className="nss-account-large-avatar">♙</div>
                      <div>
                        <strong>
                          {settings.ownerName || "Store Owner"}
                        </strong>
                        <span>
                          {settings.email || "Email not provided"}
                        </span>
                        <small>
                          {settings.storeName || "NearShop Seller"}
                        </small>
                      </div>
                    </div>

                    <div className="nss-account-info-list">
                      <div>
                        <span>Store Status</span>
                        <strong>{settings.storeStatus}</strong>
                      </div>
                      <div>
                        <span>Contact Number</span>
                        <strong>{settings.phone || "Not provided"}</strong>
                      </div>
                      <div>
                        <span>Store Location</span>
                        <strong>
                          {[settings.city, settings.state]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </strong>
                      </div>
                    </div>

                    <div className="nss-security-box">
                      <span>🔒</span>
                      <div>
                        <strong>Account Security</strong>
                        <p>
                          Password changes, login sessions, and two-factor
                          authentication must be connected to your backend
                          authentication system. This demo page does not change
                          your password.
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/seller/store-setup"
                      className="nss-store-setup-link"
                    >
                      Open Store Setup →
                    </Link>
                  </>
                )}

                <div className="nss-form-actions">
                  <button
                    type="button"
                    className="nss-reset-button"
                    onClick={resetSettings}
                  >
                    Reset Settings
                  </button>

                  <button
                    type="submit"
                    className="nss-save-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "✓ Save Settings"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <footer className="nss-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
