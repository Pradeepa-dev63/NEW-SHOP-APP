import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";
import "./Profile.css";

const PROFILE_KEY = "nearshop-profile";
const ADDRESS_KEY = "nearshop_checkout_address";
const ORDERS_KEY = "nearshop-orders";

function readStorage(key, fallback = {}) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || JSON.stringify(fallback)
    );

    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
}

function getInitialProfile() {
  const savedProfile = readStorage(PROFILE_KEY, {});
  const savedAddress = readStorage(ADDRESS_KEY, {});

  return {
    fullName:
      savedProfile.fullName ||
      savedAddress.fullName ||
      "",
    email: savedProfile.email || "",
    phone:
      savedProfile.phone ||
      savedAddress.phone ||
      "",
    gender: savedProfile.gender || "",
    dateOfBirth: savedProfile.dateOfBirth || "",
  };
}

function getInitialAddress() {
  const address = readStorage(ADDRESS_KEY, {});

  return {
    house: address.house || "",
    locality: address.locality || "",
    landmark: address.landmark || "",
    city: address.city || "",
    state: address.state || "Tamil Nadu",
    pincode: address.pincode || "",
  };
}

export default function Profile() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [address, setAddress] = useState(getInitialAddress);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [orderCount, setOrderCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    try {
      const orders = JSON.parse(
        localStorage.getItem(ORDERS_KEY) || "[]"
      );

      if (Array.isArray(orders)) {
        setOrderCount(orders.length);

        setDeliveredCount(
          orders.filter(
            (order) =>
              String(order.status || "").toLowerCase() ===
              "delivered"
          ).length
        );
      }
    } catch {
      setOrderCount(0);
      setDeliveredCount(0);
    }
  }, []);

  function updateProfile(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function updateAddress(event) {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!profile.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (
      profile.phone.trim() &&
      !/^[0-9]{10}$/.test(profile.phone.trim())
    ) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (
      profile.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
      );

      // Keep name and phone consistent with the saved address.
      const savedAddress = readStorage(ADDRESS_KEY, {});

      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify({
          ...savedAddress,
          fullName: profile.fullName,
          phone: profile.phone,
        })
      );

      setEditingProfile(false);
      setMessage("Your profile has been saved successfully.");
    } catch (saveError) {
      console.error("Unable to save profile:", saveError);
      setError("Could not save your profile. Please try again.");
    }
  }

  function saveAddress(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (address.pincode && !/^[0-9]{6}$/.test(address.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    try {
      const existingAddress = readStorage(ADDRESS_KEY, {});

      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify({
          ...existingAddress,
          ...address,
          fullName: profile.fullName,
          phone: profile.phone,
          saveAddress: true,
        })
      );

      setEditingAddress(false);
      setMessage("Your delivery address has been saved.");
    } catch (saveError) {
      console.error("Unable to save address:", saveError);
      setError("Could not save the address. Please try again.");
    }
  }

  return (
    <div className="ns-profile-page">
      <Common_navbar />

      <main className="ns-profile-main">
        {/* Page heading */}
        <header className="ns-profile-header">
          <div>
            <span className="ns-profile-eyebrow">
              YOUR NEARSHOP ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and delivery details.
            </p>
          </div>

          <Link
            to="/customer"
            className="ns-profile-shop-link"
          >
            ← Continue Shopping
          </Link>
        </header>

        {/* Profile message */}
        {message && (
          <div className="ns-profile-success" role="status">
            <span>✓</span> {message}
          </div>
        )}

        {error && (
          <div className="ns-profile-error" role="alert">
            {error}
          </div>
        )}

        <div className="ns-profile-layout">
          {/* Left account navigation */}
          <aside className="ns-profile-sidebar">
            <div className="ns-profile-user">
              <div className="ns-profile-avatar">
                {(profile.fullName || "C")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {profile.fullName || "NearShop Customer"}
                </strong>

                <span>
                  {profile.phone || "Add your phone number"}
                </span>
              </div>
            </div>

            <nav className="ns-profile-nav">
              <Link
                to="/profile"
                className="ns-profile-nav-link active"
              >
                <span>♙</span> My Profile
              </Link>

              <Link
                to="/orders"
                className="ns-profile-nav-link"
              >
                <span>▤</span> My Orders
              </Link>

              <a
                href="#saved-address"
                className="ns-profile-nav-link"
              >
                <span>⌖</span> My Addresses
              </a>

              <Link
                to="/customer"
                className="ns-profile-nav-link"
              >
                <span>♡</span> Continue Shopping
              </Link>
            </nav>

            <div className="ns-profile-help-card">
              <span>♧</span>

              <strong>Shop local. Shop fresh.</strong>

              <p>
                Discover your favourite groceries from nearby shops.
              </p>

              <Link to="/customer">
                Explore Groceries →
              </Link>
            </div>
          </aside>

          {/* Right profile content */}
          <div className="ns-profile-content">
            {/* Account statistics */}
            <section className="ns-profile-stats">
              <article className="ns-profile-stat">
                <span className="ns-profile-stat-icon">▤</span>
                <div>
                  <strong>{orderCount}</strong>
                  <span>Total Orders</span>
                </div>
              </article>

              <article className="ns-profile-stat">
                <span className="ns-profile-stat-icon">✓</span>
                <div>
                  <strong>{deliveredCount}</strong>
                  <span>Delivered Orders</span>
                </div>
              </article>

              <article className="ns-profile-stat">
                <span className="ns-profile-stat-icon">⌖</span>
                <div>
                  <strong>
                    {address.city ? "1" : "0"}
                  </strong>
                  <span>Saved Addresses</span>
                </div>
              </article>
            </section>

            {/* Personal information */}
            <section className="ns-profile-card">
              <div className="ns-profile-card-heading">
                <div>
                  <h2>Personal Information</h2>
                  <p>Your basic account details</p>
                </div>

                {!editingProfile && (
                  <button
                    type="button"
                    className="ns-profile-edit-button"
                    onClick={() => {
                      setEditingProfile(true);
                      setMessage("");
                      setError("");
                    }}
                  >
                    ✎ Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={saveProfile}>
                <div className="ns-profile-form-grid">
                  <label>
                    Full Name
                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={updateProfile}
                      placeholder="Enter your full name"
                      disabled={!editingProfile}
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={profile.phone}
                      onChange={updateProfile}
                      placeholder="10-digit phone number"
                      disabled={!editingProfile}
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={updateProfile}
                      placeholder="Enter your email"
                      disabled={!editingProfile}
                    />
                  </label>

                  <label>
                    Gender
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={updateProfile}
                      disabled={!editingProfile}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label>
                    Date of Birth
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={updateProfile}
                      disabled={!editingProfile}
                    />
                  </label>
                </div>

                {editingProfile && (
                  <div className="ns-profile-form-actions">
                    <button
                      type="button"
                      className="ns-profile-cancel-button"
                      onClick={() => {
                        setProfile(getInitialProfile());
                        setEditingProfile(false);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="ns-profile-save-button"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Saved delivery address */}
            <section
              className="ns-profile-card"
              id="saved-address"
            >
              <div className="ns-profile-card-heading">
                <div>
                  <h2>Saved Delivery Address</h2>
                  <p>Where you want your groceries delivered</p>
                </div>

                {!editingAddress && (
                  <button
                    type="button"
                    className="ns-profile-edit-button"
                    onClick={() => {
                      setAddress(getInitialAddress());
                      setEditingAddress(true);
                      setMessage("");
                      setError("");
                    }}
                  >
                    ✎ Edit Address
                  </button>
                )}
              </div>

              <form onSubmit={saveAddress}>
                <div className="ns-profile-form-grid">
                  <label className="ns-profile-field-wide">
                    House No. / Building
                    <input
                      name="house"
                      value={address.house}
                      onChange={updateAddress}
                      placeholder="House number and building"
                      disabled={!editingAddress}
                    />
                  </label>

                  <label className="ns-profile-field-wide">
                    Area / Locality
                    <input
                      name="locality"
                      value={address.locality}
                      onChange={updateAddress}
                      placeholder="Enter area or locality"
                      disabled={!editingAddress}
                    />
                  </label>

                  <label className="ns-profile-field-wide">
                    Landmark
                    <input
                      name="landmark"
                      value={address.landmark}
                      onChange={updateAddress}
                      placeholder="Optional nearby landmark"
                      disabled={!editingAddress}
                    />
                  </label>

                  <label>
                    City
                    <input
                      name="city"
                      value={address.city}
                      onChange={updateAddress}
                      placeholder="Enter city"
                      disabled={!editingAddress}
                    />
                  </label>

                  <label>
                    State
                    <select
                      name="state"
                      value={address.state}
                      onChange={updateAddress}
                      disabled={!editingAddress}
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Andhra Pradesh">
                        Andhra Pradesh
                      </option>
                      <option value="Telangana">Telangana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label>
                    PIN Code
                    <input
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={address.pincode}
                      onChange={updateAddress}
                      placeholder="6-digit PIN"
                      disabled={!editingAddress}
                    />
                  </label>
                </div>

                {editingAddress && (
                  <div className="ns-profile-form-actions">
                    <button
                      type="button"
                      className="ns-profile-cancel-button"
                      onClick={() => {
                        setAddress(getInitialAddress());
                        setEditingAddress(false);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="ns-profile-save-button"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Account preferences */}
            <section className="ns-profile-security-note">
              <span>✓</span>
              <div>
                <strong>Your information stays in this browser</strong>
                <p>
                  This page stores profile and address details locally.
                  Server-side account synchronisation is not configured here.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Common_Footer />
    </div>
  );
}
