
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Products.css";

import tomatoImage from "../Assets/seller_img/product-fresh-tomatoes.jpg";
import bananaImage from "../Assets/seller_img/product-banana.jpg";
import milkImage from "../Assets/seller_img/product-milk.jpg";
import breadImage from "../Assets/seller_img/product-brown-bread.jpg";
import oilImage from "../Assets/seller_img/product-cooking-oil.jpg";

const defaultProducts = [
  {
    id: "NSP001",
    name: "Fresh Tomatoes",
    category: "Fruits & Vegetables",
    price: 40,
    stock: 45,
    sold: 124,
    image: tomatoImage,
    status: "Active",
  },
  {
    id: "NSP002",
    name: "Fresh Bananas",
    category: "Fruits & Vegetables",
    price: 50,
    stock: 30,
    sold: 98,
    image: bananaImage,
    status: "Active",
  },
  {
    id: "NSP003",
    name: "Fresh Milk",
    category: "Dairy & Eggs",
    price: 60,
    stock: 3,
    sold: 87,
    image: milkImage,
    status: "Active",
  },
  {
    id: "NSP004",
    name: "Brown Bread",
    category: "Bakery & Snacks",
    price: 45,
    stock: 0,
    sold: 72,
    image: breadImage,
    status: "Inactive",
  },
  {
    id: "NSP005",
    name: "Cooking Oil",
    category: "Grocery & Staples",
    price: 140,
    stock: 22,
    sold: 56,
    image: oilImage,
    status: "Active",
  },
];

const categories = [
  "All Categories",
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Bakery & Snacks",
  "Grocery & Staples",
];

function getInitialProducts() {
  try {
    const saved = localStorage.getItem("nearshopSellerProducts");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load saved products:", error);
  }

  return defaultProducts;
}

export default function Seller_Products() {
  const [products, setProducts] = useState(getInitialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        "nearshopSellerProducts",
        JSON.stringify(products)
      );
    } catch (error) {
      console.error("Could not save products:", error);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(query) ||
        product.id?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Low Stock"
          ? Number(product.stock) > 0 &&
            Number(product.stock) <= 5
          : statusFilter === "Out of Stock"
          ? Number(product.stock) === 0
          : product.status === statusFilter);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, statusFilter]);

  const activeCount = products.filter(
    (product) => product.status === "Active"
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      Number(product.stock) <= 5
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  function toggleStatus(id) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              status:
                product.status === "Active" ? "Inactive" : "Active",
            }
          : product
      )
    );

    setNotice("Product status updated.");
  }

  function deleteProduct(id) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `Delete "${product.name}" from your product list?`
    );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter((item) => item.id !== id)
    );

    setNotice("Product deleted successfully.");
  }

  function resetFilters() {
    setSearch("");
    setCategory("All Categories");
    setStatusFilter("All");
  }

  return (
    <div className="nsp-page">
      <aside className="nsp-sidebar">
        <Link to="/seller/dashboard" className="nsp-logo">
          <span className="nsp-logo-icon">🌿</span>
          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nsp-navigation">
          <Link to="/seller/dashboard" className="nsp-nav-item">
            <span>⌂</span> Dashboard
          </Link>

          <Link
            to="/seller/products"
            className="nsp-nav-item nsp-nav-active"
          >
            <span>▣</span> Products
          </Link>

          <Link to="/seller/orders" className="nsp-nav-item">
            <span>🛒</span> Orders
          </Link>

          <Link to="/seller/inventory" className="nsp-nav-item">
            <span>▤</span> Inventory
          </Link>

          <Link to="/seller/reports" className="nsp-nav-item">
            <span>₹</span> Earnings
          </Link>

          <Link to="/seller/settings" className="nsp-nav-item">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nsp-sidebar-promo">
          <span>🏪</span>
          <h3>Grow your business with NearShop</h3>
          <p>Reach more customers with your local store.</p>
          <Link to="/seller/settings">Explore Settings</Link>
        </div>

        <small className="nsp-sidebar-footer">
          © 2026 NearShop
        </small>
      </aside>

      <main className="nsp-main">
        <header className="nsp-header">
          <div className="nsp-mobile-brand">🌿 NearShop</div>

          <div className="nsp-header-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="nsp-account">
            <span className="nsp-account-avatar">♙</span>
            <span>
              <strong>Fresh Basket Store</strong>
              <small>Seller account</small>
            </span>
          </div>
        </header>

        <div className="nsp-content">
          <div className="nsp-page-heading">
            <div>
              <h1>Product Management</h1>
              <p>Manage your products, prices, availability and stock.</p>
            </div>

            <Link
              to="/seller/add-product"
              className="nsp-add-button"
            >
              <span>＋</span> Add New Product
            </Link>
          </div>

          {notice && (
            <div className="nsp-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          <section className="nsp-summary-grid">
            <article className="nsp-summary-card">
              <div className="nsp-summary-icon summary-green">▣</div>
              <div>
                <span>Total Products</span>
                <strong>{products.length}</strong>
                <small>Products in your list</small>
              </div>
            </article>

            <article className="nsp-summary-card">
              <div className="nsp-summary-icon summary-blue">✓</div>
              <div>
                <span>Active Products</span>
                <strong>{activeCount}</strong>
                <small>Currently enabled</small>
              </div>
            </article>

            <article className="nsp-summary-card">
              <div className="nsp-summary-icon summary-orange">!</div>
              <div>
                <span>Low Stock</span>
                <strong>{lowStockCount}</strong>
                <small>5 units or fewer</small>
              </div>
            </article>

            <article className="nsp-summary-card">
              <div className="nsp-summary-icon summary-red">×</div>
              <div>
                <span>Out of Stock</span>
                <strong>{outOfStockCount}</strong>
                <small>Restocking required</small>
              </div>
            </article>
          </section>

          <section className="nsp-product-panel">
            <div className="nsp-panel-heading">
              <div>
                <h2>Your Products</h2>
                <p>
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>
            </div>

            <div className="nsp-filters">
              <div className="nsp-filter-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search by name or product ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter by product status"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button
                className="nsp-reset-button"
                type="button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>

            <div className="nsp-table-scroll">
              <table className="nsp-product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Product ID</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sold</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="nsp-product-cell">
                          <img
                            src={product.image || tomatoImage}
                            alt={product.name}
                            className="nsp-product-image"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />
                          <strong>{product.name}</strong>
                        </div>
                      </td>

                      <td className="nsp-product-id">{product.id}</td>

                      <td>{product.category}</td>

                      <td className="nsp-price">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span
                          className={`nsp-stock ${
                            Number(product.stock) === 0
                              ? "stock-empty"
                              : Number(product.stock) <= 5
                              ? "stock-low"
                              : "stock-good"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      <td>{product.sold ?? 0}</td>

                      <td>
                        <button
                          type="button"
                          className={`nsp-status-button ${
                            product.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                          onClick={() => toggleStatus(product.id)}
                          title="Click to change status"
                        >
                          <span />
                          {product.status}
                        </button>
                      </td>

                      <td>
                        <div className="nsp-row-actions">
                          <Link
                            to={`/seller/products/edit/${product.id}`}
                            className="nsp-edit-button"
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                          >
                            ✎
                          </Link>

                          <button
                            type="button"
                            className="nsp-delete-button"
                            onClick={() => deleteProduct(product.id)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="8" className="nsp-no-products">
                        <span>📦</span>
                        <strong>No products found</strong>
                        <p>Try changing your search or filters.</p>
                        <button onClick={resetFilters} type="button">
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="nsp-table-footer">
              <span>{filteredProducts.length} products displayed</span>
              <Link to="/seller/add-product">＋ Add another product</Link>
            </div>
          </section>

          <footer className="nsp-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
