
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Orders.css";

const STORAGE_KEY = "nearshopSellerOrders";

const statuses = [
  "Pending",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const trackingSteps = [
  {
    status: "Pending",
    title: "Order Received",
    description: "The customer placed the order.",
  },
  {
    status: "Processing",
    title: "Order Confirmed",
    description: "The seller is preparing the items.",
  },
  {
    status: "Packed",
    title: "Order Packed",
    description: "The products are packed and ready.",
  },
  {
    status: "Shipped",
    title: "Out for Delivery",
    description: "The order has been dispatched.",
  },
  {
    status: "Delivered",
    title: "Order Delivered",
    description: "The order has been marked as delivered.",
  },
];

const sampleOrders = [
  {
    id: "NS12345",
    trackingId: "NS-TRK-12345",
    customer: "Priya Sharma",
    phone: "98765 43210",
    date: "2026-10-19T09:00:00",
    items: [
      { name: "Fresh Tomatoes", quantity: 2, price: 40 },
      { name: "Bananas", quantity: 2, price: 50 },
      { name: "Fresh Milk", quantity: 1, price: 60 },
    ],
    address: "12 Gandhi Road, Chennai, Tamil Nadu",
    payment: "UPI",
    status: "Processing",
    trackingHistory: [
      {
        status: "Pending",
        timestamp: "2026-10-19T09:00:00",
      },
      {
        status: "Processing",
        timestamp: "2026-10-19T09:30:00",
      },
    ],
  },
  {
    id: "NS12346",
    trackingId: "NS-TRK-12346",
    customer: "Rohit Verma",
    phone: "98765 12345",
    date: "2026-10-19T09:15:00",
    items: [
      { name: "Brown Bread", quantity: 2, price: 45 },
      { name: "Fresh Milk", quantity: 3, price: 60 },
      { name: "Cooking Oil", quantity: 1, price: 140 },
    ],
    address: "25 Market Street, Chennai, Tamil Nadu",
    payment: "Cash on Delivery",
    status: "Pending",
    trackingHistory: [
      {
        status: "Pending",
        timestamp: "2026-10-19T09:15:00",
      },
    ],
  },
  {
    id: "NS12347",
    trackingId: "NS-TRK-12347",
    customer: "Anita Patel",
    phone: "98765 99887",
    date: "2026-10-18T11:00:00",
    items: [
      { name: "Fresh Tomatoes", quantity: 3, price: 40 },
      { name: "Bananas", quantity: 2, price: 50 },
    ],
    address: "8 Lake View Road, Chennai, Tamil Nadu",
    payment: "UPI",
    status: "Packed",
    trackingHistory: [
      {
        status: "Pending",
        timestamp: "2026-10-18T11:00:00",
      },
      {
        status: "Processing",
        timestamp: "2026-10-18T11:15:00",
      },
      {
        status: "Packed",
        timestamp: "2026-10-18T12:00:00",
      },
    ],
  },
  {
    id: "NS12348",
    trackingId: "NS-TRK-12348",
    customer: "Suresh Kumar",
    phone: "98765 66778",
    date: "2026-10-18T10:00:00",
    items: [
      { name: "Cooking Oil", quantity: 2, price: 140 },
      { name: "Brown Bread", quantity: 2, price: 45 },
      { name: "Fresh Milk", quantity: 2, price: 60 },
    ],
    address: "45 Anna Nagar, Chennai, Tamil Nadu",
    payment: "Card",
    status: "Shipped",
    trackingHistory: [
      {
        status: "Pending",
        timestamp: "2026-10-18T10:00:00",
      },
      {
        status: "Processing",
        timestamp: "2026-10-18T10:20:00",
      },
      {
        status: "Packed",
        timestamp: "2026-10-18T11:00:00",
      },
      {
        status: "Shipped",
        timestamp: "2026-10-18T12:00:00",
      },
    ],
  },
  {
    id: "NS12349",
    trackingId: "NS-TRK-12349",
    customer: "Neha Singh",
    phone: "98765 11223",
    date: "2026-10-17T14:00:00",
    items: [
      { name: "Fresh Milk", quantity: 4, price: 60 },
      { name: "Bananas", quantity: 2, price: 50 },
    ],
    address: "18 Main Road, Chennai, Tamil Nadu",
    payment: "Cash on Delivery",
    status: "Delivered",
    trackingHistory: [
      {
        status: "Pending",
        timestamp: "2026-10-17T14:00:00",
      },
      {
        status: "Processing",
        timestamp: "2026-10-17T14:10:00",
      },
      {
        status: "Packed",
        timestamp: "2026-10-17T15:00:00",
      },
      {
        status: "Shipped",
        timestamp: "2026-10-17T16:00:00",
      },
      {
        status: "Delivered",
        timestamp: "2026-10-17T17:30:00",
      },
    ],
  },
];

function readOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return sampleOrders;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid saved order list.");
    }

    return parsed;
  } catch (error) {
    console.error("Could not read orders:", error);
    return sampleOrders;
  }
}

function getOrderId(order) {
  return String(order.id || order.orderId || "");
}

function calculateTotal(order) {
  if (typeof order.total === "number") {
    return order.total;
  }

  return (order.items || []).reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(timestamp) {
  if (!timestamp) return "";

  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHistory(order) {
  if (
    Array.isArray(order.trackingHistory) &&
    order.trackingHistory.length > 0
  ) {
    return order.trackingHistory;
  }

  return [
    {
      status: order.status || "Pending",
      timestamp: order.date || new Date().toISOString(),
    },
  ];
}

export default function Seller_Orders() {
  const [orders, setOrders] = useState(readOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("Could not save orders:", error);
      setNotice("Could not save order changes in browser storage.");
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = getOrderId(order).toLowerCase();
      const tracking = String(order.trackingId || "").toLowerCase();
      const customer = String(order.customer || "").toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        tracking.includes(query) ||
        customer.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      let matchesDate = true;

      if (dateFilter === "Today") {
        const orderDate = new Date(order.date);

        matchesDate =
          !Number.isNaN(orderDate.getTime()) &&
          orderDate.toDateString() === new Date().toDateString();
      }

      if (dateFilter === "Last 7 Days") {
        const orderDate = new Date(order.date);
        const today = new Date();
        const sevenDaysAgo = new Date();

        sevenDaysAgo.setDate(today.getDate() - 7);

        matchesDate =
          !Number.isNaN(orderDate.getTime()) &&
          orderDate >= sevenDaysAgo &&
          orderDate <= today;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + calculateTotal(order), 0);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingCount = orders.filter((order) =>
    ["Processing", "Packed", "Shipped"].includes(order.status)
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  function updateOrderStatus(orderId, newStatus) {
    const timestamp = new Date().toISOString();

    const updateOne = (order) => {
      if (getOrderId(order) !== String(orderId)) {
        return order;
      }

      const history = getHistory(order);
      const lastEntry = history[history.length - 1];

      // Avoid recording the same status repeatedly.
      const nextHistory =
        lastEntry?.status === newStatus
          ? history
          : [
              ...history,
              {
                status: newStatus,
                timestamp,
              },
            ];

      return {
        ...order,
        status: newStatus,
        trackingHistory: nextHistory,
      };
    };

    setOrders((current) => current.map(updateOne));
    setSelectedOrder((current) =>
      current ? updateOne(current) : current
    );

    setNotice(`Order ${orderId} status updated to ${newStatus}.`);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("All");
  }

  function refreshOrders() {
    setOrders(readOrders());
    setNotice("Orders refreshed from browser storage.");
  }

  function handleExport() {
    const headers = [
      "Order ID",
      "Tracking ID",
      "Customer",
      "Date",
      "Total",
      "Payment",
      "Status",
    ];

    const rows = filteredOrders.map((order) => [
      getOrderId(order),
      order.trackingId || "",
      order.customer || "",
      formatDate(order.date),
      calculateTotal(order),
      order.payment || "",
      order.status || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nearshop-orders.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="nso-page">
      <aside className="nso-sidebar">
        <Link to="/seller/dashboard" className="nso-brand">
          <span className="nso-brand-icon">🌿</span>

          <span>
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav className="nso-navigation" aria-label="Seller navigation">
          <Link to="/seller/dashboard" className="nso-nav-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link to="/seller/products" className="nso-nav-link">
            <span>▣</span> Products
          </Link>

          <Link to="/seller/orders" className="nso-nav-link active">
            <span>🛒</span> Orders
          </Link>

          <Link to="/seller/inventory" className="nso-nav-link">
            <span>▤</span> Inventory
          </Link>

          <Link to="/seller/reports" className="nso-nav-link">
            <span>₹</span> Earnings
          </Link>

          <Link to="/seller/settings" className="nso-nav-link">
            <span>⚙</span> Store Settings
          </Link>
        </nav>

        <div className="nso-sidebar-promo">
          <span>🏪</span>
          <h3>Grow your business with NearShop</h3>
          <p>Manage local orders all in one place.</p>
          <Link to="/seller/settings">Store Settings</Link>
        </div>

        <small className="nso-sidebar-footer">© 2026 NearShop</small>
      </aside>

      <main className="nso-main">
        <header className="nso-topbar">
          <div className="nso-store-profile">
            <span className="nso-store-avatar">♙</span>

            <span>
              <strong>Fresh Basket Store</strong>
              <small>Seller account</small>
            </span>
          </div>

          <div className="nso-account-menu-wrapper">
            <button
              type="button"
              className="nso-account-button"
              onClick={() => setShowAccount((value) => !value)}
              aria-expanded={showAccount}
              aria-label="Open seller account menu"
            >
              <span className="nso-store-avatar">♙</span>

              <span className="nso-account-button-text">
                <strong>Fresh Basket Store</strong>
                <small>Seller Profile</small>
              </span>

              <span className="nso-account-chevron">⌄</span>
            </button>

            {showAccount && (
              <div className="nso-account-dropdown">
                <div className="nso-account-dropdown-heading">
                  <strong>Fresh Basket Store</strong>
                  <small>Seller account</small>
                </div>

                <Link
                  to="/seller/settings"
                  onClick={() => setShowAccount(false)}
                >
                  <span>♙</span> Account & Store Settings
                </Link>

                <Link
                  to="/seller/store-setup"
                  onClick={() => setShowAccount(false)}
                >
                  <span>🏪</span> Store Profile
                </Link>

                <Link
                  to="/seller/login"
                  onClick={() => setShowAccount(false)}
                >
                  <span>⇥</span> Login Page
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="nso-content">
          <section className="nso-heading">
            <div>
              <p className="nso-eyebrow">ORDER MANAGEMENT</p>
              <h1>Customer Orders</h1>
              <p>
                Manage orders, follow delivery progress, and update
                order statuses.
              </p>
            </div>

            <div className="nso-heading-actions">
              <button
                type="button"
                className="nso-secondary-button"
                onClick={refreshOrders}
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                className="nso-primary-button"
                onClick={handleExport}
              >
                ↓ Export CSV
              </button>
            </div>
          </section>

          {notice && (
            <div className="nso-notice" role="status">
              <span>{notice}</span>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}

          <section className="nso-stats">
            <article className="nso-stat-card">
              <span className="nso-stat-icon total">▣</span>
              <div>
                <small>Total Orders</small>
                <strong>{orders.length}</strong>
                <span>All order records</span>
              </div>
            </article>

            <article className="nso-stat-card">
              <span className="nso-stat-icon pending">◷</span>
              <div>
                <small>Pending Orders</small>
                <strong>{pendingCount}</strong>
                <span>Awaiting processing</span>
              </div>
            </article>

            <article className="nso-stat-card">
              <span className="nso-stat-icon processing">↻</span>
              <div>
                <small>In Progress</small>
                <strong>{processingCount}</strong>
                <span>Being prepared or shipped</span>
              </div>
            </article>

            <article className="nso-stat-card">
              <span className="nso-stat-icon revenue">₹</span>
              <div>
                <small>Delivered Revenue</small>
                <strong>
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </strong>
                <span>{deliveredCount} delivered orders</span>
              </div>
            </article>
          </section>

          <section className="nso-panel">
            <div className="nso-panel-heading">
              <div>
                <h2>All Orders</h2>
                <p>
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>
            </div>

            <div className="nso-filters">
              <div className="nso-search">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Search order ID, tracking ID, or customer..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search orders"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by order status"
              >
                <option value="All">All Statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by order date"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
              </select>

              <button
                type="button"
                className="nso-reset-button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>

            <div className="nso-table-scroll">
              <table className="nso-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={getOrderId(order)}>
                      <td className="nso-order-id">
                        #{getOrderId(order).replace(/^#/, "")}
                      </td>

                      <td>
                        <div className="nso-customer">
                          <span className="nso-customer-avatar">♙</span>
                          <span>{order.customer || "Customer"}</span>
                        </div>
                      </td>

                      <td>{formatDate(order.date)}</td>

                      <td>{(order.items || []).length} types</td>

                      <td className="nso-total">
                        ₹{calculateTotal(order).toLocaleString("en-IN")}
                      </td>

                      <td>{order.payment || "—"}</td>

                      <td>
                        <span
                          className={`nso-status nso-status-${String(
                            order.status || "Pending"
                          ).toLowerCase()}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="nso-view-button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAccount(false);
                          }}
                        >
                          View & Track
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="8" className="nso-empty">
                        <span>📦</span>
                        <strong>No orders found</strong>
                        <p>Try another search or reset the filters.</p>

                        <button
                          type="button"
                          onClick={resetFilters}
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="nso-table-footer">
              <span>{filteredOrders.length} orders displayed</span>
              <span>Tracking history is saved with each order.</span>
            </div>
          </section>

          <footer className="nso-footer">
            <span>© 2026 NearShop. All rights reserved.</span>
            <span>Local Stores ♥ Stronger Communities</span>
          </footer>
        </div>
      </main>

      {selectedOrder && (
        <div
          className="nso-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="nso-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nso-modal-title"
          >
            <div className="nso-modal-heading">
              <div>
                <small>ORDER DETAILS & TRACKING</small>

                <h2 id="nso-modal-title">
                  #{getOrderId(selectedOrder).replace(/^#/, "")}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="nso-modal-customer">
              <strong>{selectedOrder.customer || "Customer"}</strong>
              <span>{selectedOrder.phone || "Phone not provided"}</span>
              <span>
                {selectedOrder.address || "Address not provided"}
              </span>
            </div>

            <div className="nso-modal-meta">
              <span>
                Order date: {formatDate(selectedOrder.date)}
              </span>
              <span>
                Payment: {selectedOrder.payment || "—"}
              </span>
              <span>
                Tracking ID:{" "}
                <strong>
                  {selectedOrder.trackingId ||
                    `NS-TRK-${getOrderId(selectedOrder)}`}
                </strong>
              </span>
            </div>

            <div className="nso-modal-section">
              <h3>Order Items</h3>

              {(selectedOrder.items || []).map((item, index) => (
                <div
                  className="nso-modal-item"
                  key={`${item.name}-${index}`}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>

            <div className="nso-modal-total">
              <span>Order Total</span>
              <strong>
                ₹{calculateTotal(selectedOrder).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="nso-tracking">
              <div className="nso-tracking-heading">
                <h3>Delivery Tracking</h3>
                <p>Latest order status: {selectedOrder.status}</p>
              </div>

              {selectedOrder.status === "Cancelled" ? (
                <div className="nso-tracking-cancelled">
                  <strong>✕ Order Cancelled</strong>
                  <p>
                    This order is no longer progressing through delivery.
                  </p>
                </div>
              ) : (
                <div className="nso-tracking-timeline">
                  {trackingSteps.map((step, index) => {
                    const currentIndex = trackingSteps.findIndex(
                      (item) => item.status === selectedOrder.status
                    );

                    const completed =
                      currentIndex >= 0 && index <= currentIndex;

                    const current = index === currentIndex;

                    const historyEntry = getHistory(selectedOrder)
                      .filter(
                        (entry) => entry.status === step.status
                      )
                      .slice(-1)[0];

                    return (
                      <div
                        className={`nso-tracking-step ${
                          completed ? "completed" : ""
                        } ${current ? "current" : ""}`}
                        key={step.status}
                      >
                        <div className="nso-tracking-marker">
                          {completed ? "✓" : index + 1}
                        </div>

                        <div className="nso-tracking-step-content">
                          <strong>{step.title}</strong>
                          <p>{step.description}</p>

                          {historyEntry?.timestamp && (
                            <small>
                              {formatDateTime(historyEntry.timestamp)}
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="nso-status-editor">
              <label htmlFor="nso-change-status">
                Update Order Status
              </label>

              <select
                id="nso-change-status"
                value={selectedOrder.status || "Pending"}
                onChange={(event) =>
                  updateOrderStatus(
                    getOrderId(selectedOrder),
                    event.target.value
                  )
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <small>
                Status updates add a timestamp to the tracking history.
              </small>
            </div>

            <button
              type="button"
              className="nso-modal-done"
              onClick={() => setSelectedOrder(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
