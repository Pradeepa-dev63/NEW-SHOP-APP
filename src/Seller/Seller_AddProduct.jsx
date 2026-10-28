
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Seller_AddProduct.css";

const STORAGE_KEY = "nearshopSellerProducts";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Bakery & Snacks",
  "Grocery & Staples",
  "Beverages",
  "Household Essentials",
  "Personal Care",
  "Grains & Pulses",
  "Frozen Foods",
  "Organic Products",
  "Baby Care",
  "Others",
];

const initialForm = {
  name: "",
  category: "Fruits & Vegetables",
  price: "",
  stock: "",
  unit: "kg",
  description: "",
  status: "Active",
};

function readProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Saved product data is not a valid list.");
    }

    return parsed;
  } catch (error) {
    console.error("Unable to read products:", error);
    throw new Error(
      "Could not read existing products. Please check browser storage."
    );
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Choose an image smaller than 5 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Unable to read the image."));
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        reject(new Error("This image could not be opened."));
      };

      image.onload = () => {
        try {
          const maxDimension = 600;
          const scale = Math.min(
            1,
            maxDimension / image.width,
            maxDimension / image.height
          );

          const canvas = document.createElement("canvas");

          canvas.width = Math.max(
            1,
            Math.round(image.width * scale)
          );

          canvas.height = Math.max(
            1,
            Math.round(image.height * scale)
          );

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to process the image."));
            return;
          }

          // White background supports images with transparency.
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const compressed = canvas.toDataURL(
            "image/jpeg",
            0.65
          );

          resolve(compressed);
        } catch (error) {
          reject(new Error("Image compression failed."));
        }
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function Seller_AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setNotice("");
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setNotice("");
    setErrors((current) => ({
      ...current,
      image: "",
    }));

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch (error) {
      setImagePreview("");
      setErrors((current) => ({
        ...current,
        image: error.message || "Unable to upload this image.",
      }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Product name is required.";
    }

    if (!form.category) {
      nextErrors.category = "Please choose a category.";
    }

    const price = Number(form.price);

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      nextErrors.price = "Enter a price greater than ₹0.";
    }

    const stock = Number(form.stock);

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      nextErrors.stock = "Enter a whole number of 0 or more.";
    }

    if (!form.unit) {
      nextErrors.unit = "Please choose a selling unit.";
    }

    if (errors.image) {
      nextErrors.image = errors.image;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (!validateForm()) {
      setNotice("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const existingProducts = readProducts();

      const productId =
        "NSP" + Date.now().toString();

      const newProduct = {
        id: productId,
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        unit: form.unit,
        description: form.description.trim(),
        image: imagePreview,
        sold: 0,
        status: form.status,
        createdAt: new Date().toISOString(),
      };

      const updatedProducts = [
        ...existingProducts,
        newProduct,
      ];

      // Save the entire product list under the shared key.
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProducts)
      );

      // Verify that the product was written successfully.
      const savedProducts = readProducts();

      const productExists = savedProducts.some(
        (product) => product.id === productId
      );

      if (!productExists) {
        throw new Error("Product verification failed.");
      }

      // Navigate only after successfully saving the product.
      navigate("/seller/products", {
        replace: true,
        state: {
          notice: "Product added successfully!",
        },
      });
    } catch (error) {
      console.error("Product save failed:", error);

      setNotice(
        error.message ||
          "Unable to save the product. Try a smaller image or check browser storage."
      );

      setSaving(false);
    }
  }

  return (
    <div className="ns-add-page">
      <aside className="ns-add-sidebar">
        <Link
          to="/seller/dashboard"
          className="ns-add-brand"
        >
          <span className="ns-add-logo-icon">🌿</span>

          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav
          className="ns-add-navigation"
          aria-label="Seller navigation"
        >
          <Link
            to="/seller/dashboard"
            className="ns-add-nav-link"
          >
            <span>⌂</span> Dashboard
          </Link>

          <Link
            to="/seller/products"
            className="ns-add-nav-link active"
          >
            <span>▣</span> Products
          </Link>

          <Link
            to="/seller/orders"
            className="ns-add-nav-link"
          >
            <span>🛒</span> Orders
          </Link>

          <Link
            to="/seller/inventory"
            className="ns-add-nav-link"
          >
            <span>▤</span> Inventory
          </Link>

          <Link
            to="/seller/reports"
            className="ns-add-nav-link"
          >
            <span>₹</span> Earnings
          </Link>

          <Link
            to="/seller/settings"
            className="ns-add-nav-link"
          >
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="ns-add-sidebar-promo">
          <span>🏪</span>
          <h3>Grow your business with NearShop</h3>
          <p>Manage your local store in one place.</p>

          <Link to="/seller/settings">
            Store Settings
          </Link>
        </div>

        <small className="ns-add-sidebar-footer">
          © 2026 NearShop
        </small>
      </aside>

      <main className="ns-add-main">
        <header className="ns-add-topbar">
          <div className="ns-add-topbar-copy">
            <span className="ns-add-topbar-icon">
              🛍️
            </span>

            <span>
              <strong>Fresh Basket Store</strong>
              <small>Seller account</small>
            </span>
          </div>

          <Link
            to="/seller/products"
            className="ns-add-back-link"
          >
            ← Back to Products
          </Link>
        </header>

        <div className="ns-add-content">
          <div className="ns-add-heading">
            <div>
              <p className="ns-add-eyebrow">
                PRODUCT MANAGEMENT
              </p>

              <h1>Add New Product</h1>

              <p>
                Add a product to your store and make it ready
                for customers.
              </p>
            </div>

            <div className="ns-add-heading-badge">
              ＋ New Listing
            </div>
          </div>

          {notice && (
            <div
              className="ns-add-notice"
              role="alert"
            >
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="ns-add-layout">
              <div className="ns-add-form-column">
                <section className="ns-add-card">
                  <div className="ns-add-section-heading">
                    <span className="ns-add-section-icon">
                      ▤
                    </span>

                    <div>
                      <h2>Basic Information</h2>
                      <p>
                        Enter the product details customers
                        will see.
                      </p>
                    </div>
                  </div>

                  <div className="ns-add-field">
                    <label htmlFor="product-name">
                      Product Name <span>*</span>
                    </label>

                    <input
                      id="product-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Fresh Organic Tomatoes"
                      maxLength={100}
                      aria-invalid={Boolean(errors.name)}
                    />

                    {errors.name && (
                      <small className="ns-add-error">
                        {errors.name}
                      </small>
                    )}
                  </div>

                  <div className="ns-add-two-columns">
                    <div className="ns-add-field">
                      <label htmlFor="product-category">
                        Category <span>*</span>
                      </label>

                      <select
                        id="product-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      >
                        {categories.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ns-add-field">
                      <label htmlFor="product-unit">
                        Selling Unit
                      </label>

                      <select
                        id="product-unit"
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                      >
                        <option value="piece">Piece</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="litre">Litre</option>
                        <option value="ml">Millilitre (ml)</option>
                        <option value="pack">Pack</option>
                        <option value="dozen">Dozen</option>
                      </select>
                    </div>
                  </div>

                  <div className="ns-add-field">
                    <label htmlFor="product-description">
                      Product Description
                    </label>

                    <textarea
                      id="product-description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe freshness, quality, origin, or packaging..."
                      rows={4}
                      maxLength={1000}
                    />

                    <small className="ns-add-help">
                      {form.description.length}/1000 characters
                    </small>
                  </div>
                </section>

                <section className="ns-add-card">
                  <div className="ns-add-section-heading">
                    <span className="ns-add-section-icon">
                      ₹
                    </span>

                    <div>
                      <h2>Pricing & Inventory</h2>
                      <p>
                        Set your selling price and available
                        quantity.
                      </p>
                    </div>
                  </div>

                  <div className="ns-add-two-columns">
                    <div className="ns-add-field">
                      <label htmlFor="product-price">
                        Selling Price (₹) <span>*</span>
                      </label>

                      <div className="ns-add-input-prefix">
                        <span>₹</span>

                        <input
                          id="product-price"
                          name="price"
                          type="number"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          aria-invalid={Boolean(errors.price)}
                        />
                      </div>

                      {errors.price && (
                        <small className="ns-add-error">
                          {errors.price}
                        </small>
                      )}
                    </div>

                    <div className="ns-add-field">
                      <label htmlFor="product-stock">
                        Available Stock <span>*</span>
                      </label>

                      <input
                        id="product-stock"
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                        min="0"
                        step="1"
                        aria-invalid={Boolean(errors.stock)}
                      />

                      {errors.stock && (
                        <small className="ns-add-error">
                          {errors.stock}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="ns-add-stock-tip">
                    <span>ⓘ</span>
                    Set stock to zero if the product is
                    currently unavailable.
                  </div>
                </section>

                <section className="ns-add-card">
                  <div className="ns-add-section-heading">
                    <span className="ns-add-section-icon">
                      ✓
                    </span>

                    <div>
                      <h2>Product Availability</h2>
                      <p>
                        Choose whether the product is
                        available to sell.
                      </p>
                    </div>
                  </div>

                  <div className="ns-add-availability">
                    <label className="ns-add-radio-option">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={form.status === "Active"}
                        onChange={handleChange}
                      />

                      <span>
                        <strong>Active</strong>
                        <small>
                          Product is available in your listing.
                        </small>
                      </span>
                    </label>

                    <label className="ns-add-radio-option">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={form.status === "Inactive"}
                        onChange={handleChange}
                      />

                      <span>
                        <strong>Inactive</strong>
                        <small>
                          Keep the product hidden or disabled.
                        </small>
                      </span>
                    </label>
                  </div>
                </section>
              </div>

              <div className="ns-add-image-column">
                <section className="ns-add-card ns-add-image-card">
                  <div className="ns-add-section-heading">
                    <span className="ns-add-section-icon">
                      ▧
                    </span>

                    <div>
                      <h2>Product Image</h2>
                      <p>
                        Upload a clear photo of your product.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`ns-add-image-preview ${
                      imagePreview ? "has-image" : ""
                    }`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Selected product preview"
                      />
                    ) : (
                      <div className="ns-add-image-placeholder">
                        <span>🛍️</span>
                        <strong>Product Preview</strong>
                        <small>
                          Your image will appear here.
                        </small>
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="product-image"
                    className="ns-add-upload-button"
                  >
                    <span>↑</span>
                    Choose Product Image
                  </label>

                  <input
                    id="product-image"
                    className="ns-add-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <p className="ns-add-upload-help">
                    JPG, PNG, WEBP. Maximum original file size: 5 MB.
                  </p>

                  {errors.image && (
                    <small className="ns-add-error">
                      {errors.image}
                    </small>
                  )}

                  <div className="ns-add-image-tip">
                    <strong>Photo tips</strong>
                    <p>
                      Use a clear image with good lighting and
                      a simple background.
                    </p>
                  </div>
                </section>

                <section className="ns-add-publish-card">
                  <span className="ns-add-publish-icon">🌿</span>

                  <h3>Ready for NearShop?</h3>

                  <p>
                    Review your details before adding the
                    product to your local store.
                  </p>

                  <div className="ns-add-publish-note">
                    <span>✓</span>
                    Product details are saved in this browser.
                  </div>
                </section>
              </div>
            </div>

            <div className="ns-add-form-actions">
              <Link
                to="/seller/products"
                className="ns-add-cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="ns-add-submit-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "✓ Save Product"}
              </button>
            </div>
          </form>

          <footer className="ns-add-footer">
            <span>
              © 2026 NearShop. All rights reserved.
            </span>
            <span>
              Local Stores ♥ Stronger Communities
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
