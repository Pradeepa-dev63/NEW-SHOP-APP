
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Inventory.css";

const STORAGE_KEY = "nearshopSellerProducts";
const LOW_STOCK_LIMIT = 5;

function readProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read inventory:", error);
    return [];
  }
}

function getId(product) {
  return String(product.id ?? product._id ?? product.productId ?? "");
}

function getStock(product) {
  const stock = Number(product.stock ?? 0);
  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
}

function getStockStatus(stock) {
  if (stock === 0) return "Out of Stock";
  if (stock <= LOW_STOCK_LIMIT) return "Low Stock";
  return "In Stock";
}

export default function Seller_Inventory() {
  const [products, setProducts] = useState(readProducts);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [stockDrafts, setStockDrafts] = useState({});
  const [notice, setNotice] = useState("");

  const totalUnits = products.reduce(
    (total, product) => total + getStock(product),
    0
  );

  const lowStockCount = products.filter((product) => {
    const stock = getStock(product);
    return stock > 0 && stock <= LOW_STOCK_LIMIT;
  }).length;

  const outOfStockCount = products.filter(
    (product) => getStock(product) === 0
  ).length;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "").toLowerCase().includes(query) ||
        String(product.category || "").toLowerCase().includes(query) ||
        getId(product).toLowerCase().includes(query);

      const stock = getStock(product);
      const status = getStockStatus(stock);

      const matchesFilter =
        stockFilter === "All" || status === stockFilter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, stockFilter]);

  function refreshInventory() {
    setProducts(readProducts());
    setStockDrafts({});
    setNotice("Inventory refreshed from browser storage.");
  }

  function updateDraft(id, value) {
    setStockDrafts((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function saveStock(product) {
    const id = getId(product);
    const rawValue = stockDrafts[id] ?? String(getStock(product));

    if (
      String(rawValue).trim() === "" ||
      !Number.isInteger(Number(rawValue)) ||
      Number(rawValue) < 0
    ) {
      setNotice("Enter a valid whole-number stock quantity of 0 or more.");
      return;
    }

    const newStock = Number(rawValue);
    const updatedProducts = products.map((item) =>
      getId(item) === id
        ? {
            ...item,
            stock: newStock,
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProducts)
      );

      setProducts(updatedProducts);

      setStockDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      setNotice(`${product.name || "Product"} stock updated successfully.`);
    } catch (error) {
      console.error("Could not save stock:", error);
      setNotice("Stock could not be saved. Check your browser storage.");
    }
  }

  function adjustStock(product, amount) {
    const id = getId(product);
    const newStock = Math.max(0, getStock(product) + amount);

    const updatedProducts = products.map((item) =>
      getId(item) === id
        ? {
            ...item,
            stock: newStock,
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProducts)
      );

      setProducts(updatedProducts);

      setStockDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      setNotice(`${product.name || "Product"} stock updated to ${newStock}.`);
    } catch (error) {
      console.error("Could not update stock:", error);
      setNotice("Stock could not be saved. Check your browser storage.");
    }
  }

  return (
    <div className="nsi-page">
      <aside className="nsi-sidebar">
        <Link to="/seller/dashboard" className="nsi-brand">
          <span className="nsi-brand-icon">🌿</span>
          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nsi-navigation" aria-label="Seller navigation">
          <Link to="/seller/dashboard" className="nsi-nav-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link to="/seller/products" className="nsi-nav-link">
            <span>▣</span> Products
          </Link>

          <Link to="/seller/orders" className="nsi-nav-link">
            <span>🛒</span> Orders
          </Link>

          <Link
            to="/seller/inventory"
            className="nsi-nav-link active"
          >
            <span>▤</span> Inventory
          </Link>

          <Link to="/seller/reports" className="nsi-nav-link">
            <span>₹</span> Earnings
          </Link>

          <Link to="/seller/settings" className="nsi-nav-link">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nsi-promo">
          <span>🏪</span>
          <h3>Keep your store well stocked</h3>
          <p>Monitor quantities and restock products before they run out.</p>
          <Link to="/seller/products">Manage Products</Link>
        </div>

        <small className="nsi-sidebar-footer">© 2026 NearShop</small>
      </aside>

      <main className="nsi-main">
        <header className="nsi-topbar">
          <div className="nsi-store-profile">
            <span className="nsi-avatar">♙</span>
            <span>
              <strong>Fresh Basket Store</strong>
              <small>Seller account</small>
            </span>
          </div>

          <Link to="/seller/settings" className="nsi-account-link">
            ⚙ Store Settings
          </Link>
        </header>

        <div className="nsi-content">
          <section className="nsi-heading">
            <div>
              <p className="nsi-eyebrow">STOCK MANAGEMENT</p>
              <h1>Inventory Management</h1>
              <p>
                Monitor available stock and keep your products ready for
                customer orders.
              </p>
            </div>

            <div className="nsi-heading-actions">
              <button
                type="button"
                className="nsi-secondary-button"
                onClick={refreshInventory}
              >
                ↻ Refresh
              </button>

              <Link to="/seller/add-product" className="nsi-primary-button">
                ＋ Add Product
              </Link>
            </div>
          </section>

          {notice && (
            <div className="nsi-notice" role="status">
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

          <section className="nsi-stats">
            <article className="nsi-stat-card">
              <span className="nsi-stat-icon total">▣</span>
              <div>
                <small>Total Products</small>
                <strong>{products.length}</strong>
                <span>Products listed</span>
              </div>
            </article>

            <article className="nsi-stat-card">
              <span className="nsi-stat-icon units">▤</span>
              <div>
                <small>Total Stock Units</small>
                <strong>{totalUnits.toLocaleString("en-IN")}</strong>
                <span>Across all products</span>
              </div>
            </article>

            <article className="nsi-stat-card">
              <span className="nsi-stat-icon low">!</span>
              <div>
                <small>Low Stock</small>
                <strong>{lowStockCount}</strong>
                <span>1–{LOW_STOCK_LIMIT} units remaining</span>
              </div>
            </article>

            <article className="nsi-stat-card">
              <span className="nsi-stat-icon empty">×</span>
              <div>
                <small>Out of Stock</small>
                <strong>{outOfStockCount}</strong>
                <span>Restocking required</span>
              </div>
            </article>
          </section>

          <section className="nsi-panel">
            <div className="nsi-panel-heading">
              <div>
                <h2>Stock Overview</h2>
                <p>
                  {filteredProducts.length} of {products.length} products shown
                </p>
              </div>
            </div>

            <div className="nsi-filters">
              <div className="nsi-search">
                <span>⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product name, category or ID..."
                  aria-label="Search inventory"
                />
              </div>

              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                aria-label="Filter inventory by stock status"
              >
                <option value="All">All Stock Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="nsi-table-scroll">
              <table className="nsi-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Product ID</th>
                    <th>Category</th>
                    <th>Stock Quantity</th>
                    <th>Stock Status</th>
                    <th>Price</th>
                    <th>Quick Adjust</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product, index) => {
                    const id = getId(product) || `row-${index}`;
                    const stock = getStock(product);
                    const status = getStockStatus(stock);

                    return (
                      <tr key={id}>
                        <td>
                          <div className="nsi-product-cell">
                            <div className="nsi-product-thumb">
                              <span aria-hidden="true">🛒</span>
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt=""
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                            </div>

                            <div>
                              <strong>{product.name || "Unnamed Product"}</strong>
                              <small>
                                {product.unit || "units"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="nsi-product-id">{id || "—"}</td>

                        <td>{product.category || "Uncategorized"}</td>

                        <td>
                          <div className="nsi-stock-input">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                stockDrafts[id] !== undefined
                                  ? stockDrafts[id]
                                  : stock
                              }
                              onChange={(event) =>
                                updateDraft(id, event.target.value)
                              }
                              aria-label={`Stock quantity for ${product.name}`}
                            />
                            <span>{product.unit || "units"}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`nsi-stock-status ${
                              status === "In Stock"
                                ? "in-stock"
                                : status === "Low Stock"
                                ? "low-stock"
                                : "out-stock"
                            }`}
                          >
                            <span />
                            {status}
                          </span>
                        </td>

                        <td className="nsi-price">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>

                        <td>
                          <div className="nsi-adjust-buttons">
                            <button
                              type="button"
                              onClick={() => adjustStock(product, -1)}
                              disabled={stock === 0}
                              aria-label={`Decrease ${product.name} stock by one`}
                            >
                              −
                            </button>

                            <button
                              type="button"
                              onClick={() => adjustStock(product, 1)}
                              aria-label={`Increase ${product.name} stock by one`}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="nsi-save-row"
                            onClick={() => saveStock(product)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="8" className="nsi-empty">
                        <span>📦</span>
                        <strong>No inventory products found</strong>
                        <p>
                          Add a product first, or change your search filters.
                        </p>
                        <Link to="/seller/add-product">
                          ＋ Add Your First Product
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="nsi-table-footer">
              <span>{filteredProducts.length} products displayed</span>
              <Link to="/seller/products">View Product Management →</Link>
            </div>
          </section>

          <footer className="nsi-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
