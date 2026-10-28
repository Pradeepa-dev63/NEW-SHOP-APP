import React, { useState } from "react";
import { Link } from "react-router-dom";
import Seller_Sidebar from "./Seller_Sidebar";
import "./Seller_Profile.css";

const PROFILE_KEY = "nearshopSellerProfile";
const SETTINGS_KEY = "nearshopSellerSettings";

const getInitialProfile = () => {
  const defaults = {
    fullName: "",
    email: "",
    phone: "",
    role: "Seller / Store Owner",
    storeName: "",
    category: "Fruits & Vegetables",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    bio: "",
    avatar: "",
  };

  try {
    const savedProfile = JSON.parse(
      localStorage.getItem(PROFILE_KEY) || "null"
    );

    const savedSettings = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "null"
    );

    return {
      ...defaults,
      ...(savedSettings
        ? {
            fullName:
              savedSettings.owner ||
              savedSettings.ownerName ||
              defaults.fullName,
            email: savedSettings.email || defaults.email,
            phone: savedSettings.phone || defaults.phone,
            storeName:
              savedSettings.storeName || defaults.storeName,
            category:
              savedSettings.category || defaults.category,
            address: savedSettings.address || defaults.address,
            city: savedSettings.city || defaults.city,
            state: savedSettings.state || defaults.state,
            pincode: savedSettings.pincode || defaults.pincode,
            bio: savedSettings.description || defaults.bio,
          }
        : {}),
      ...(savedProfile || {}),
    };
  } catch {
    return defaults;
  }
};

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Bakery & Snacks",
  "Beverages",
  "Household Essentials",
  "Personal Care",
  "Grains & Pulses",
  "Frozen Foods",
  "Organic Products",
  "Other",
];

function Seller_Profile() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    setAvatarError("");
    setMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          setAvatarError("Unable to process this image.");
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        setProfile((previous) => ({
          ...previous,
          avatar: canvas.toDataURL("image/jpeg", 0.75),
        }));
      };

      image.onerror = () => {
        setAvatarError("Unable to open this image.");
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      setAvatarError("Unable to read this file.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!profile.fullName.trim()) {
      nextErrors.fullName = "Enter the seller's full name.";
    }

    if (!profile.email.trim()) {
      nextErrors.email = "Enter an email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    const phoneDigits = profile.phone.replace(/\D/g, "");

    if (!profile.phone.trim()) {
      nextErrors.phone = "Enter a phone number.";
    } else if (
      phoneDigits.length !== 10 &&
      !(phoneDigits.length === 12 && phoneDigits.startsWith("91"))
    ) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!profile.storeName.trim()) {
      nextErrors.storeName = "Enter your store name.";
    }

    if (
      profile.pincode.trim() &&
      !/^\d{6}$/.test(profile.pincode.trim())
    ) {
      nextErrors.pincode = "PIN code must contain 6 digits.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      setMessage("Please correct the highlighted fields.");
      return;
    }

    const cleanProfile = {
      ...profile,
      fullName: profile.fullName.trim(),
      email: profile.email.trim().toLowerCase(),
      phone: profile.phone.trim(),
      storeName: profile.storeName.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      state: profile.state.trim(),
      pincode: profile.pincode.trim(),
      bio: profile.bio.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(cleanProfile)
      );

      // Keep shared store details consistent with Seller Settings.
      const existingSettings = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || "{}"
      );

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          ...existingSettings,
          owner: cleanProfile.fullName,
          email: cleanProfile.email,
          phone: cleanProfile.phone,
          storeName: cleanProfile.storeName,
          category: cleanProfile.category,
          address: cleanProfile.address,
          city: cleanProfile.city,
          state: cleanProfile.state,
          pincode: cleanProfile.pincode,
          description: cleanProfile.bio,
        })
      );

      setProfile(cleanProfile);
      setErrors({});
      setMessage("Your seller profile has been saved successfully.");
    } catch (error) {
      console.error("Profile save failed:", error);
      setMessage(
        "Could not save your profile. Your browser storage may be full."
      );
    }
  };

  const handleDiscard = () => {
    setProfile(getInitialProfile());
    setErrors({});
    setAvatarError("");
    setMessage("Unsaved changes have been discarded.");
  };

  const initials = profile.fullName.trim()
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "NS";

  return (
    <div className="seller-home-layout seller-profile-layout">
      <Seller_Sidebar />

      <main className="seller-profile-main">
        <div className="seller-profile-topbar">
          <div>
            <span className="seller-profile-breadcrumb">
              Seller Portal / My Profile
            </span>
            <h1>My Profile</h1>
            <p>Manage your personal and store information.</p>
          </div>

          <Link
            to="/seller/settings"
            className="seller-profile-settings-link"
          >
            ⚙ Settings
          </Link>
        </div>

        {message && (
          <div
            className={`seller-profile-message ${
              message.startsWith("Your seller")
                ? "success"
                : "info"
            }`}
            role="status"
          >
            {message}
          </div>
        )}

        <div className="seller-profile-grid">
          <aside className="seller-profile-summary">
            <div className="seller-profile-summary-top">
              <span className="seller-profile-leaf">N</span>
              <span>NEARSHOP SELLER</span>
            </div>

            <div className="seller-profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Seller profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <h2>{profile.fullName || "Your Name"}</h2>

            <p className="seller-profile-summary-store">
              {profile.storeName || "Your Store Name"}
            </p>

            <span className="seller-profile-role">
              {profile.role}
            </span>

            <div className="seller-profile-summary-divider" />

            <div className="seller-profile-summary-detail">
              <span>✉</span>
              <p>{profile.email || "Email not added"}</p>
            </div>

            <div className="seller-profile-summary-detail">
              <span>☎</span>
              <p>{profile.phone || "Phone not added"}</p>
            </div>

            <div className="seller-profile-summary-detail">
              <span>⌖</span>
              <p>
                {[profile.city, profile.state]
                  .filter(Boolean)
                  .join(", ") || "Location not added"}
              </p>
            </div>

            <div className="seller-profile-tip">
              <span>💡</span>
              <div>
                <strong>Keep your profile updated</strong>
                <p>
                  Accurate contact and store details help you manage
                  your marketplace presence.
                </p>
              </div>
            </div>
          </aside>

          <section className="seller-profile-form-card">
            <div className="seller-profile-card-heading">
              <div>
                <h2>Profile information</h2>
                <p>Update your account and store details below.</p>
              </div>
              <span className="seller-profile-edit-icon">✎</span>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="seller-profile-photo-row">
                <div className="seller-profile-photo">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Selected seller profile"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="seller-profile-photo-controls">
                  <strong>Profile photo</strong>
                  <p>Choose a clear image, up to 5 MB.</p>

                  <label className="seller-profile-upload-btn">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>

                  {profile.avatar && (
                    <button
                      type="button"
                      className="seller-profile-remove-photo"
                      onClick={() =>
                        setProfile((previous) => ({
                          ...previous,
                          avatar: "",
                        }))
                      }
                    >
                      Remove photo
                    </button>
                  )}

                  {avatarError && (
                    <span className="seller-profile-error">
                      {avatarError}
                    </span>
                  )}
                </div>
              </div>

              <div className="seller-profile-form-section">
                <h3>Personal details</h3>

                <div className="seller-profile-fields">
                  <div className="seller-profile-field">
                    <label htmlFor="seller-fullName">
                      Full name <span>*</span>
                    </label>
                    <input
                      id="seller-fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <small className="seller-profile-error">
                        {errors.fullName}
                      </small>
                    )}
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-role">Role</label>
                    <input
                      id="seller-role"
                      value={profile.role}
                      readOnly
                    />
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-email">
                      Email address <span>*</span>
                    </label>
                    <input
                      id="seller-email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <small className="seller-profile-error">
                        {errors.email}
                      </small>
                    )}
                  </div>

                  <div className="ns-auth-field">
  <label htmlFor="seller-register-phone">
    Mobile Number
  </label>

  <div className="ns-auth-phone-control">
    <span className="ns-auth-country-code">+91</span>

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
                </div>
              </div>

              <div className="seller-profile-form-section">
                <h3>Store information</h3>

                <div className="seller-profile-fields">
                  <div className="seller-profile-field">
                    <label htmlFor="seller-storeName">
                      Store name <span>*</span>
                    </label>
                    <input
                      id="seller-storeName"
                      name="storeName"
                      value={profile.storeName}
                      onChange={handleChange}
                      placeholder="Enter your store name"
                    />
                    {errors.storeName && (
                      <small className="seller-profile-error">
                        {errors.storeName}
                      </small>
                    )}
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-category">
                      Store category
                    </label>
                    <select
                      id="seller-category"
                      name="category"
                      value={profile.category}
                      onChange={handleChange}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="seller-profile-field full-width">
                    <label htmlFor="seller-bio">
                      About your store
                    </label>
                    <textarea
                      id="seller-bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      placeholder="Tell customers about your store and products..."
                      rows={4}
                      maxLength={500}
                    />
                    <small className="seller-profile-character-count">
                      {profile.bio.length}/500 characters
                    </small>
                  </div>
                </div>
              </div>

              <div className="seller-profile-form-section">
                <h3>Store address</h3>

                <div className="seller-profile-fields">
                  <div className="seller-profile-field full-width">
                    <label htmlFor="seller-address">
                      Street address
                    </label>
                    <input
                      id="seller-address"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      placeholder="Door number, street, area"
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-city">City</label>
                    <input
                      id="seller-city"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      autoComplete="address-level2"
                    />
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-state">State</label>
                    <input
                      id="seller-state"
                      name="state"
                      value={profile.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      autoComplete="address-level1"
                    />
                  </div>

                  <div className="seller-profile-field">
                    <label htmlFor="seller-pincode">PIN code</label>
                    <input
                      id="seller-pincode"
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={profile.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      autoComplete="postal-code"
                    />
                    {errors.pincode && (
                      <small className="seller-profile-error">
                        {errors.pincode}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="seller-profile-form-actions">
                <button
                  type="button"
                  className="seller-profile-discard-btn"
                  onClick={handleDiscard}
                >
                  Discard changes
                </button>

                <button
                  type="submit"
                  className="seller-profile-save-btn"
                >
                  Save profile
                </button>
              </div>
            </form>
          </section>
        </div>

        <footer className="seller-profile-footer">
          © {new Date().getFullYear()} NearShop Marketplace
          <span>Seller Profile</span>
        </footer>
      </main>
    </div>
  );
}

export default Seller_Profile;