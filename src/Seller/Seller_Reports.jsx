
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Reports.css";

const PRODUCT_KEY = "nearshopSellerProducts";
const ORDER_KEY = "nearshopSellerOrders";

const demoOrders = [
  {
    id: "NS12345",
    customer: "Priya Sharma",
    date: "2026-10-19T09:00:00",
    status: "Delivered",
    total: 480,
    items: [{ name: "Fresh Tomatoes", quantity: 2, price: 40 }],
  },
  {
    id: "NS12346",
    customer: "Rohit Verma",
    date: "2026-10-19T10:00:00",
    status: "Processing",
    total: 650,
    items: [{ name: "Fresh Milk", quantity: 3, price: 60 }],
  },
  {
    id: "NS12347",
    customer: "Anita Patel",
    date: "2026-10-18T11:00:00",
    status: "Delivered",
    total: 360,
    items: [{ name: "Bananas", quantity: 2, price: 50 }],
  },
  {
    id: "NS12348",
    customer: "Suresh Kumar",
    date: "2026-10-17T12:00:00",
    status: "Delivered",
    total: 750,
    items: [{ name: "Cooking Oil", quantity: 2, price: 140 }],
  },
  {
    id: "NS12349",
    customer: "Neha Singh",
    date: "2026-10-16T14:00:00",
    status: "Pending",
    total: 420,
    items: [{ name: "Fresh Milk", quantity: 4, price: 60 }],
  },
];

const demoProducts = [
  { id: "NSP001", name: "Fresh Tomatoes", price: 40, sold: 124 },
  { id: "NSP002", name: "Bananas", price: 50, sold: 98 },
  { id: "NSP003", name: "Fresh Milk", price: 60, sold: 87 },
  { id: "NSP004", name: "Brown Bread", price: 45, sold: 72 },
  { id: "NSP005", name: "Cooking Oil", price: 140, sold: 56 },
];

const reportPeriods = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

function readList(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) return fallback;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function getOrderId(order) {
  return String(order.id || order.orderId || "—");
}

function getOrderTotal(order) {
  if (Number.isFinite(Number(order.total))) {
    return Number(order.total);
  }

  return (Array.isArray(order.items) ? order.items : []).reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOrderDate(order) {
  const date = new Date(order.date || order.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function SalesChart({ orders, days }) {
  const buckets = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const bucketCount = 7;
    const bucketWidth = (days * 24 * 60 * 60 * 1000) / bucketCount;

    const result = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = new Date(
        start.getTime() + index * bucketWidth
      );

      return {
        start: bucketStart,
        revenue: 0,
      };
    });

    orders.forEach((order) => {
      if (order.status !== "Delivered") return;

      const date = getOrderDate(order);

      if (!date || date < start || date > now) return;

      const index = Math.min(
        bucketCount - 1,
        Math.floor((date.getTime() - start.getTime()) / bucketWidth)
      );

      result[index].revenue += getOrderTotal(order);
    });

    return result;
  }, [orders, days]);

  const maximum = Math.max(...buckets.map((item) => item.revenue), 100);
  const chartWidth = 620;
  const chartHeight = 220;
  const left = 44;
  const right = 12;
  const top = 15;
  const bottom = 43;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const barGap = 18;
  const barWidth = (plotWidth - barGap * 6) / 7;

  return (
    <div className="nsr-chart-wrap">
      <svg
        className="nsr-chart"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Delivered sales revenue chart for the selected period"
      >
        {[0, 1, 2, 3].map((index) => {
          const y = top + (plotHeight / 3) * index;
          const amount = maximum * (1 - index / 3);

          return (
            <g key={index}>
              <line
                x1={left}
                y1={y}
                x2={chartWidth - right}
                y2={y}
                className="nsr-chart-grid"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="nsr-chart-label"
              >
                {amount >= 1000
                  ? `${(amount / 1000).toFixed(1)}k`
                  : Math.round(amount)}
              </text>
            </g>
          );
        })}

        {buckets.map((bucket, index) => {
          const height = (bucket.revenue / maximum) * plotHeight;
          const x = left + index * (barWidth + barGap);
          const y = top + plotHeight - height;

          return (
            <g key={bucket.start.toISOString()}>
              <title>
                {formatDate(bucket.start)}: {formatMoney(bucket.revenue)}
              </title>

              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, 2)}
                rx="5"
                className="nsr-chart-bar"
              />

              <text
                x={x + barWidth / 2}
                y={chartHeight - 15}
                textAnchor="middle"
                className="nsr-chart-label"
              >
                {bucket.start.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="nsr-chart-legend">
        <span />
        Delivered revenue
      </div>
    </div>
  );
}

export default function Seller_Reports() {
  const [orders, setOrders] = useState(() =>
    readList(ORDER_KEY, demoOrders)
  );

  const [products] = useState(() =>
    readList(PRODUCT_KEY, demoProducts)
  );

  const [period, setPeriod] = useState("Last 7 Days");
  const [search, setSearch] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [notice, setNotice] = useState("");

  const days =
    reportPeriods.find((item) => item.label === period)?.days || 7;

  const rangeOrders = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    return orders.filter((order) => {
      const date = getOrderDate(order);
      return date && date >= start && date <= now;
    });
  }, [orders, days]);

  const deliveredOrders = rangeOrders.filter(
    (order) => order.status === "Delivered"
  );

  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );

  const averageOrderValue = deliveredOrders.length
    ? revenue / deliveredOrders.length
    : 0;

  const pendingOrders = rangeOrders.filter((order) =>
    ["Pending", "Processing", "Packed", "Shipped"].includes(order.status)
  ).length;

  const topProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...products]
      .filter((product) =>
        String(product.name || "").toLowerCase().includes(query)
      )
      .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
      .slice(0, 5);
  }, [products, search]);

  const recentOrders = useMemo(() => {
    return [...rangeOrders]
      .filter((order) =>
        `${getOrderId(order)} ${order.customer || ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        return (
          (getOrderDate(b)?.getTime() || 0) -
          (getOrderDate(a)?.getTime() || 0)
        );
      })
      .slice(0, 8);
  }, [rangeOrders, search]);

  function refreshReports() {
    setOrders(readList(ORDER_KEY, demoOrders));
    setNotice("Reports refreshed from browser storage.");
  }

  function exportReport() {
    const header = [
      "Order ID",
      "Customer",
      "Date",
      "Order Total",
      "Status",
    ];

    const rows = recentOrders.map((order) => [
      getOrderId(order),
      order.customer || "",
      formatDate(order.date || order.createdAt),
      getOrderTotal(order),
      order.status || "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nearshop-sales-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="nsr-page">
      <aside className="nsr-sidebar">
        <Link to="/seller/dashboard" className="nsr-brand">
          <span className="nsr-brand-icon">🌿</span>
          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nsr-navigation" aria-label="Seller navigation">
          <Link to="/seller/dashboard" className="nsr-nav-link">
            <span>⌂</span> Dashboard
          </Link>
          <Link to="/seller/products" className="nsr-nav-link">
            <span>▣</span> Products
          </Link>
          <Link to="/seller/orders" className="nsr-nav-link">
            <span>🛒</span> Orders
          </Link>
          <Link to="/seller/inventory" className="nsr-nav-link">
            <span>▤</span> Inventory
          </Link>
          <Link to="/seller/reports" className="nsr-nav-link active">
            <span>₹</span> Reports
          </Link>
          <Link to="/seller/settings" className="nsr-nav-link">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nsr-promo">
          <span>📈</span>
          <h3>Understand your store performance</h3>
          <p>Review sales, orders, and best-selling products.</p>
          <Link to="/seller/products">Manage Products</Link>
        </div>

        <small className="nsr-sidebar-footer">© 2026 NearShop</small>
      </aside>

      <main className="nsr-main">
        <header className="nsr-topbar">
          <div className="nsr-store-profile">
            <span className="nsr-avatar">♙</span>
            <span>
              <strong>Fresh Basket Store</strong>
              <small>Seller account</small>
            </span>
          </div>

          <div className="nsr-account-menu-wrapper">
            <button
              type="button"
              className="nsr-account-button"
              onClick={() => setShowAccount((value) => !value)}
              aria-expanded={showAccount}
            >
              <span className="nsr-avatar">♙</span>
              <span className="nsr-account-copy">
                <strong>Fresh Basket Store</strong>
                <small>Seller Profile</small>
              </span>
              <span>⌄</span>
            </button>

            {showAccount && (
              <div className="nsr-account-dropdown">
                <strong>Fresh Basket Store</strong>
                <Link
                  to="/seller/settings"
                  onClick={() => setShowAccount(false)}
                >
                  Account & Store Settings
                </Link>
                <Link
                  to="/seller/store-setup"
                  onClick={() => setShowAccount(false)}
                >
                  Store Profile
                </Link>
                <Link
                  to="/seller/login"
                  onClick={() => setShowAccount(false)}
                >
                  Login Page
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="nsr-content">
          <section className="nsr-heading">
            <div>
              <p className="nsr-eyebrow">BUSINESS ANALYTICS</p>
              <h1>Sales Reports</h1>
              <p>
                Understand revenue, order performance, and popular products.
              </p>
            </div>

            <div className="nsr-heading-actions">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Select reporting period"
              >
                {reportPeriods.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="nsr-primary-button"
                onClick={exportReport}
              >
                ↓ Export CSV
              </button>
            </div>
          </section>

          {notice && (
            <div className="nsr-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notice"
              >
                ×
              </button>
            </div>
          )}

          <div className="nsr-refresh-row">
            <span>
              Reporting period: <strong>{period}</strong>. Revenue counts
              delivered orders only.
            </span>
            <button type="button" onClick={refreshReports}>
              ↻ Refresh Reports
            </button>
          </div>

          <section className="nsr-stats">
            <article className="nsr-stat-card">
              <span className="nsr-stat-icon green">₹</span>
              <div>
                <small>Delivered Revenue</small>
                <strong>{formatMoney(revenue)}</strong>
                <span>For the selected period</span>
              </div>
            </article>

            <article className="nsr-stat-card">
              <span className="nsr-stat-icon blue">▣</span>
              <div>
                <small>Total Orders</small>
                <strong>{rangeOrders.length}</strong>
                <span>Orders in this period</span>
              </div>
            </article>

            <article className="nsr-stat-card">
              <span className="nsr-stat-icon purple">↗</span>
              <div>
                <small>Average Order Value</small>
                <strong>{formatMoney(averageOrderValue)}</strong>
                <span>Delivered orders only</span>
              </div>
            </article>

            <article className="nsr-stat-card">
              <span className="nsr-stat-icon orange">◷</span>
              <div>
                <small>Open Orders</small>
                <strong>{pendingOrders}</strong>
                <span>Awaiting completion</span>
              </div>
            </article>
          </section>

          <section className="nsr-main-grid">
            <article className="nsr-panel nsr-sales-panel">
              <div className="nsr-panel-heading">
                <div>
                  <h2>Revenue Overview</h2>
                  <p>Delivered sales over the selected period</p>
                </div>
                <span className="nsr-period-badge">{period}</span>
              </div>

              <SalesChart orders={orders} days={days} />
            </article>

            <article className="nsr-panel nsr-performance-panel">
              <div className="nsr-panel-heading">
                <div>
                  <h2>Order Performance</h2>
                  <p>Summary for the selected period</p>
                </div>
              </div>

              {[
                {
                  label: "Delivered",
                  count: deliveredOrders.length,
                  className: "delivered",
                },
                {
                  label: "Processing",
                  count: rangeOrders.filter(
                    (order) => order.status === "Processing"
                  ).length,
                  className: "processing",
                },
                {
                  label: "Packed",
                  count: rangeOrders.filter(
                    (order) => order.status === "Packed"
                  ).length,
                  className: "packed",
                },
                {
                  label: "Shipped",
                  count: rangeOrders.filter(
                    (order) => order.status === "Shipped"
                  ).length,
                  className: "shipped",
                },
                {
                  label: "Cancelled",
                  count: rangeOrders.filter(
                    (order) => order.status === "Cancelled"
                  ).length,
                  className: "cancelled",
                },
              ].map((item) => {
                const percentage = rangeOrders.length
                  ? (item.count / rangeOrders.length) * 100
                  : 0;

                return (
                  <div className="nsr-performance-row" key={item.label}>
                    <div className="nsr-performance-label">
                      <span className={`nsr-dot ${item.className}`} />
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </div>

                    <div className="nsr-progress-track">
                      <div
                        className={`nsr-progress-fill ${item.className}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="nsr-performance-footer">
                Total orders: <strong>{rangeOrders.length}</strong>
              </div>
            </article>
          </section>

          <section className="nsr-panel nsr-products-panel">
            <div className="nsr-panel-heading nsr-products-heading">
              <div>
                <h2>Top Selling Products</h2>
                <p>Ranked by the sold quantity recorded in your product list</p>
              </div>

              <Link to="/seller/products" className="nsr-view-all">
                Manage Products →
              </Link>
            </div>

            <div className="nsr-search-row">
              <input
                type="search"
                placeholder="Search top-selling products..."
                aria-label="Search top-selling products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {topProducts.length ? (
              <div className="nsr-products-list">
                {topProducts.map((product, index) => (
                  <div
                    className="nsr-product-row"
                    key={String(product.id || product._id || product.name)}
                  >
                    <span className="nsr-rank">{index + 1}</span>
                    <div className="nsr-product-thumb">🛒</div>

                    <div className="nsr-product-info">
                      <strong>{product.name || "Unnamed Product"}</strong>
                      <small>
                        Product ID: {product.id || product._id || "—"}
                      </small>
                    </div>

                    <div className="nsr-product-sold">
                      <strong>{Number(product.sold || 0)}</strong>
                      <small>Sold</small>
                    </div>

                    <div className="nsr-product-price">
                      {formatMoney(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="nsr-empty">
                No matching products found.
              </div>
            )}
          </section>

          <section className="nsr-panel nsr-orders-panel">
            <div className="nsr-panel-heading">
              <div>
                <h2>Recent Sales</h2>
                <p>Orders recorded during the selected reporting period</p>
              </div>
              <Link to="/seller/orders" className="nsr-view-all">
                View Orders →
              </Link>
            </div>

            <div className="nsr-table-scroll">
              <table className="nsr-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={getOrderId(order)}>
                      <td className="nsr-order-id">
                        #{getOrderId(order).replace(/^#/, "")}
                      </td>
                      <td>{order.customer || "Customer"}</td>
                      <td>{formatDate(order.date || order.createdAt)}</td>
                      <td className="nsr-table-amount">
                        {formatMoney(getOrderTotal(order))}
                      </td>
                      <td>
                        <span
                          className={`nsr-status nsr-status-${String(
                            order.status || "Pending"
                          ).toLowerCase()}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="nsr-empty">
                        No orders found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="nsr-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
