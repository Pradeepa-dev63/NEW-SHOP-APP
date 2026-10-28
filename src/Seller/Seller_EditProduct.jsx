
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Seller_EditProduct.css";

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

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Choose an image smaller than 5 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the image."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Could not open the image."));

      image.onload = () => {
        const maxSize = 600;
        const scale = Math.min(
          1,
          maxSize / image.width,
          maxSize / image.height
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not process the image."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  const parsed = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error("The saved product list is invalid.");
  }

  return parsed;
}

export default function Seller_EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "Fruits & Vegetables",
    price: "",
    stock: "",
    unit: "kg",
    description: "",
    status: "Active",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const products = loadProducts();
      const found = products.find(
        (item) => String(item.id) === String(id)
      );

      if (found) {
        setProduct(found);
        setForm({
          name: found.name || "",
          category: found.category || "Fruits & Vegetables",
          price: String(found.price ?? ""),
          stock: String(found.stock ?? ""),
          unit: found.unit || "kg",
          description: found.description || "",
          status: found.status || "Active",
        });
        setImagePreview(found.image || "");
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Could not load product:", error);
      setNotice("Could not read the saved products in this browser.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setErrors((current) => ({ ...current, image: "" }));
      setNotice("");
    } catch (error) {
      setErrors((current) => ({
        ...current,
        image: error.message || "Unable to upload this image.",
      }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Product name is required.";
    }

    if (!form.category) {
      nextErrors.category = "Choose a category.";
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      nextErrors.price = "Enter a price greater than ₹0.";
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      nextErrors.stock = "Enter a whole number of 0 or more.";
    }

    if (errors.image) {
      nextErrors.image = errors.image;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const existingProducts = loadProducts();
      const productIndex = existingProducts.findIndex(
        (item) => String(item.id) === String(id)
      );

      if (productIndex === -1) {
        throw new Error(
          "This product could not be found in saved products."
        );
      }

      const updatedProduct = {
        ...existingProducts[productIndex],
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        unit: form.unit,
        description: form.description.trim(),
        status: form.status,
        image: imagePreview,
        updatedAt: new Date().toISOString(),
      };

      const updatedProducts = [...existingProducts];
      updatedProducts[productIndex] = updatedProduct;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProducts)
      );

      const verification = loadProducts();
      const savedProduct = verification.find(
        (item) => String(item.id) === String(id)
      );

      if (
        !savedProduct ||
        savedProduct.name !== updatedProduct.name
      ) {
        throw new Error("Could not verify the saved changes.");
      }

      navigate("/seller/products", {
        replace: true,
        state: {
          notice: "Product updated successfully!",
        },
      });
    } catch (error) {
      console.error("Product update failed:", error);
      setNotice(
        error.message ||
          "Unable to update this product. Check your browser storage."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="nse-message">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="nse-message">
        <h2>Product not found</h2>
        <p>This product may have been deleted or is not saved in this browser.</p>
        <Link to="/seller/products" className="nse-primary-button">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="nse-page">
      <aside className="nse-sidebar">
        <Link to="/seller/dashboard" className="nse-brand">
          <span className="nse-brand-icon">🌿</span>
          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nse-navigation" aria-label="Seller navigation">
          <Link to="/seller/dashboard" className="nse-nav-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link
            to="/seller/products"
            className="nse-nav-link nse-active"
          >
            <span>▣</span> Products
          </Link>

          <Link to="/seller/orders" className="nse-nav-link">
            <span>🛒</span> Orders
          </Link>

          <Link to="/seller/inventory" className="nse-nav-link">
            <span>▤</span> Inventory
          </Link>

          <Link to="/seller/reports" className="nse-nav-link">
            <span>₹</span> Earnings
          </Link>

          <Link to="/seller/settings" className="nse-nav-link">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nse-promo">
          <span>🏪</span>
          <h3>Grow your business with NearShop</h3>
          <p>Manage products, orders, and your local store.</p>
          <Link to="/seller/settings">Store Settings</Link>
        </div>

        <small className="nse-sidebar-footer">© 2026 NearShop</small>
      </aside>

      <main className="nse-main">
        <header className="nse-topbar">
          <div>
            <strong>Fresh Basket Store</strong>
            <small>Seller account</small>
          </div>

          <Link to="/seller/products" className="nse-back-link">
            ← Back to Products
          </Link>
        </header>

        <div className="nse-content">
          <div className="nse-heading">
            <div>
              <p className="nse-eyebrow">PRODUCT MANAGEMENT</p>
              <h1>Edit Product</h1>
              <p>Update your product information and save your changes.</p>
            </div>
            <span className="nse-id-badge">{product.id}</span>
          </div>

          {notice && (
            <div className="nse-notice" role="alert">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="nse-form-layout">
              <div className="nse-form-column">
                <section className="nse-card">
                  <div className="nse-card-heading">
                    <span className="nse-heading-icon">▤</span>
                    <div>
                      <h2>Basic Information</h2>
                      <p>Update the details shown to customers.</p>
                    </div>
                  </div>

                  <div className="nse-field">
                    <label htmlFor="edit-name">Product Name *</label>
                    <input
                      id="edit-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Enter product name"
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && (
                      <small className="nse-error">{errors.name}</small>
                    )}
                  </div>

                  <div className="nse-two-columns">
                    <div className="nse-field">
                      <label htmlFor="edit-category">Category *</label>
                      <select
                        id="edit-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      >
                        {!categories.includes(form.category) && (
                          <option value={form.category}>
                            {form.category}
                          </option>
                        )}

                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="nse-field">
                      <label htmlFor="edit-unit">Selling Unit</label>
                      <select
                        id="edit-unit"
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

                  <div className="nse-field">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      maxLength={1000}
                      placeholder="Describe your product..."
                    />
                    <small className="nse-character-count">
                      {form.description.length}/1000 characters
                    </small>
                  </div>
                </section>

                <section className="nse-card">
                  <div className="nse-card-heading">
                    <span className="nse-heading-icon">₹</span>
                    <div>
                      <h2>Pricing & Inventory</h2>
                      <p>Change your product price and stock.</p>
                    </div>
                  </div>

                  <div className="nse-two-columns">
                    <div className="nse-field">
                      <label htmlFor="edit-price">Price (₹) *</label>
                      <input
                        id="edit-price"
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.price)}
                      />
                      {errors.price && (
                        <small className="nse-error">{errors.price}</small>
                      )}
                    </div>

                    <div className="nse-field">
                      <label htmlFor="edit-stock">Stock Quantity *</label>
                      <input
                        id="edit-stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.stock)}
                      />
                      {errors.stock && (
                        <small className="nse-error">{errors.stock}</small>
                      )}
                    </div>
                  </div>
                </section>

                <section className="nse-card">
                  <div className="nse-card-heading">
                    <span className="nse-heading-icon">✓</span>
                    <div>
                      <h2>Product Status</h2>
                      <p>Choose whether this product is active.</p>
                    </div>
                  </div>

                  <div className="nse-status-options">
                    <label>
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={form.status === "Active"}
                        onChange={handleChange}
                      />
                      <span>
                        <strong>Active</strong>
                        <small>Available for customers.</small>
                      </span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={form.status === "Inactive"}
                        onChange={handleChange}
                      />
                      <span>
                        <strong>Inactive</strong>
                        <small>Not currently available.</small>
                      </span>
                    </label>
                  </div>
                </section>
              </div>

              <div className="nse-image-column">
                <section className="nse-card">
                  <div className="nse-card-heading">
                    <span className="nse-heading-icon">▧</span>
                    <div>
                      <h2>Product Image</h2>
                      <p>Keep the current photo or upload another.</p>
                    </div>
                  </div>

                  <div className="nse-image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt={form.name || "Product"} />
                    ) : (
                      <div className="nse-no-image">
                        <span>🛍️</span>
                        <strong>No image selected</strong>
                      </div>
                    )}
                  </div>

                  <label htmlFor="edit-image" className="nse-upload-button">
                    ↑ Change Product Image
                  </label>

                  <input
                    id="edit-image"
                    className="nse-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {errors.image && (
                    <small className="nse-error">{errors.image}</small>
                  )}

                  <p className="nse-upload-help">
                    JPG, PNG, or WEBP. Maximum size: 5 MB.
                  </p>
                </section>

                <section className="nse-tip-card">
                  <span>🌿</span>
                  <h3>Keep your listing accurate</h3>
                  <p>
                    Make sure your price, stock, description, and image
                    reflect the product you are selling.
                  </p>
                </section>
              </div>
            </div>

            <div className="nse-form-actions">
              <Link to="/seller/products" className="nse-cancel-button">
                Cancel
              </Link>

              <button
                type="submit"
                className="nse-save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "✓ Save Changes"}
              </button>
            </div>
          </form>

          <footer className="nse-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
