import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";
import "./Orders.css";

const ORDERS_KEY = "nearshop-orders";
const CART_KEY = "nearshop-cart";

function readOrders() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ORDERS_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getOrderKey(order, index = 0) {
  return String(
    order.orderId ||
      order._id ||
      order.createdAt ||
      `ORDER-${index + 1}`
  );
}

function getImage(item) {
  return item?.image || item?.img || item?.src || "";
}

function getQuantity(item) {
  return Math.max(1, Number(item?.quantity || 1));
}

function getLineTotal(item) {
  return Math.max(0, Number(item?.price || 0)) * getQuantity(item);
}

function getOrderTotal(order) {
  if (order.grandTotal != null) {
    return Math.max(0, Number(order.grandTotal || 0));
  }

  return (
    (order.items || []).reduce(
      (sum, item) => sum + getLineTotal(item),
      0
    ) + Math.max(0, Number(order.deliveryFee || 0))
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(order) {
  const status = String(order?.status || "Placed")
    .trim()
    .toLowerCase();

  if (status === "delivered") return "Delivered";

  if (status === "cancelled" || status === "canceled") {
    return "Cancelled";
  }

  if (
    [
      "confirmed",
      "processing",
      "shipped",
      "out for delivery",
    ].includes(status)
  ) {
    return "In Progress";
  }

  return "Placed";
}

function getTrackingStep(order) {
  const status = String(order?.status || "Placed")
    .trim()
    .toLowerCase();

  if (status === "delivered") return 3;

  if (
    status === "shipped" ||
    status === "out for delivery"
  ) {
    return 2;
  }

  if (
    status === "confirmed" ||
    status === "processing"
  ) {
    return 1;
  }

  return 0;
}

function getPaymentName(method) {
  const names = {
    cod: "Cash on Delivery",
    upi: "UPI Payment",
    card: "Credit / Debit Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "Pay Later / EMI",
  };

  return names[method] || method || "Not specified";
}

function getProfile() {
  try {
    return JSON.parse(
      localStorage.getItem("nearshop-profile") || "{}"
    );
  } catch {
    return {};
  }
}

function getSavedAddress() {
  try {
    return JSON.parse(
      localStorage.getItem("nearshop_checkout_address") || "{}"
    );
  } catch {
    return {};
  }
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState(readOrders);

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    const initialOrders = readOrders();

    return initialOrders.length
      ? getOrderKey(initialOrders[0], 0)
      : null;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [user, setUser] = useState(() => {
    const profile = getProfile();
    const address = getSavedAddress();

    return {
      name:
        profile.fullName ||
        address.fullName ||
        "NearShop Customer",
      phone: profile.phone || address.phone || "",
    };
  });

  // Refresh saved orders when the page regains focus.
  useEffect(() => {
    const refreshOrders = () => {
      setOrders(readOrders());

      const profile = getProfile();
      const address = getSavedAddress();

      setUser({
        name:
          profile.fullName ||
          address.fullName ||
          "NearShop Customer",
        phone: profile.phone || address.phone || "",
      });
    };

    window.addEventListener("focus", refreshOrders);
    window.addEventListener("storage", refreshOrders);

    return () => {
      window.removeEventListener("focus", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
    };
  }, []);

  const filteredOrders = orders.filter((order, index) => {
    const orderId = getOrderKey(order, index);
    const itemNames = (order.items || [])
      .map((item) => item.name || "")
      .join(" ");

    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      orderId.toLowerCase().includes(query) ||
      itemNames.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" ||
      getStatus(order) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Select the first visible order if filters hide the selection.
  useEffect(() => {
    const currentSelectionIsVisible = filteredOrders.some(
      (order, index) =>
        getOrderKey(order, orders.indexOf(order)) === selectedOrderId
    );

    if (!currentSelectionIsVisible) {
      setSelectedOrderId(
        filteredOrders.length
          ? getOrderKey(
              filteredOrders[0],
              orders.indexOf(filteredOrders[0])
            )
          : null
      );
    }
  }, [filteredOrders, orders, selectedOrderId]);

  const selectedOrder = orders.find(
    (order, index) =>
      getOrderKey(order, index) === selectedOrderId
  );

  const deliveredCount = orders.filter(
    (order) => getStatus(order) === "Delivered"
  ).length;

  const inProgressCount = orders.filter(
    (order) => getStatus(order) === "In Progress"
  ).length;

  const cancelledCount = orders.filter(
    (order) => getStatus(order) === "Cancelled"
  ).length;

  function selectOrder(order, index) {
    setSelectedOrderId(getOrderKey(order, index));
  }

  // Add a previously ordered product to the current cart.
  function buyAgain(order) {
    try {
      let savedCart;

      try {
        savedCart = JSON.parse(
          localStorage.getItem(CART_KEY) ||
            localStorage.getItem("nearshop_cart") ||
            "[]"
        );
      } catch {
        savedCart = [];
      }

      const cart = Array.isArray(savedCart)
        ? [...savedCart]
        : [];

      (order.items || []).forEach((product) => {
        const id = String(
          product.id ??
            product._id ??
            product.slug ??
            String(product.name || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
        );

        const existing = cart.find(
          (item) => String(item.id) === id
        );

        if (existing) {
          existing.quantity =
            Number(existing.quantity || 1) +
            getQuantity(product);
        } else {
          cart.push({
            ...product,
            id,
            image: getImage(product),
            quantity: getQuantity(product),
          });
        }
      });

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      window.dispatchEvent(
        new Event("nearshop-cart-updated")
      );

      navigate("/Add_to_card");
    } catch (error) {
      console.error("Unable to reorder products:", error);
    }
  }

  // Download a text invoice containing the saved order information.
  function downloadInvoice(order) {
    const address = order.deliveryAddress || {};

    const lines = [
      "NEARSHOP - ORDER INVOICE",
      "========================================",
      `Order ID: ${order.orderId || "N/A"}`,
      `Order Date: ${formatDateTime(order.createdAt)}`,
      `Status: ${order.status || "Placed"}`,
      "",
      "DELIVERY ADDRESS",
      `Name: ${address.fullName || "N/A"}`,
      `Phone: ${address.phone || "N/A"}`,
      [
        address.house,
        address.locality,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", "),
      "",
      "ORDER ITEMS",
      "----------------------------------------",
      ...(order.items || []).map(
        (item) =>
          `${item.name || "Product"} | Qty ${getQuantity(
            item
          )} | ₹${getLineTotal(item).toFixed(2)}`
      ),
      "",
      `Subtotal: ₹${Number(
        order.subtotal ??
          (order.items || []).reduce(
            (sum, item) => sum + getLineTotal(item),
            0
          )
      ).toFixed(2)}`,
      `Discount: ₹${Number(order.discount || 0).toFixed(2)}`,
      `Delivery Fee: ₹${Number(order.deliveryFee || 0).toFixed(2)}`,
      `Grand Total: ₹${getOrderTotal(order).toFixed(2)}`,
      `Payment: ${getPaymentName(order.paymentMethod)}`,
      "",
      "Generated from your saved NearShop order.",
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `NearShop-${order.orderId || "Invoice"}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const address = selectedOrder?.deliveryAddress || {};

  const selectedItems = selectedOrder?.items || [];

  const selectedItemCount = selectedItems.reduce(
    (sum, item) => sum + getQuantity(item),
    0
  );

  const trackingStep = selectedOrder
    ? getTrackingStep(selectedOrder)
    : 0;

  const selectedStatus = selectedOrder
    ? getStatus(selectedOrder)
    : "";

  return (
    <div className="ns-orders-page">
      <Common_navbar />

      <main className="ns-orders-main">
        <div className="ns-orders-dashboard">
          {/* LEFT ACCOUNT SIDEBAR */}
          <aside className="ns-orders-sidebar">
            <div className="ns-orders-user">
              <div className="ns-orders-avatar">
                {(user.name || "C")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="ns-orders-user-info">
                <strong>{user.name}</strong>
                <span>{user.phone || "NearShop Customer"}</span>
              </div>
            </div>

            <nav className="ns-orders-nav">
              <Link
                to="/profile"
                className="ns-orders-nav-link"
              >
                <span>♙</span> My Profile
              </Link>

              <Link
                to="/orders"
                className="ns-orders-nav-link active"
              >
                <span>▤</span> My Orders
              </Link>

              <Link
                to="/profile#saved-address"
                className="ns-orders-nav-link"
              >
                <span>⌖</span> My Addresses
              </Link>

              <Link
                to="/customer"
                className="ns-orders-nav-link"
              >
                <span>♡</span> Wishlist
              </Link>

              <Link
                to="/customer"
                className="ns-orders-nav-link"
              >
                <span>◇</span> Offers & Coupons
              </Link>

              <Link
                to="/customer"
                className="ns-orders-nav-link"
              >
                <span>?</span> Help & Support
              </Link>

              <button
                type="button"
                className="ns-orders-nav-link"
                onClick={() => navigate("/customer")}
              >
                <span>↪</span> Continue Shopping
              </button>
            </nav>

            <div className="ns-orders-shop-card">
              <div className="ns-orders-shop-art" aria-hidden="true">
                🛒
              </div>

              <strong>Your favourites are waiting!</strong>

              <p>
                Reorder from your past orders in just one click.
              </p>

              <button
                type="button"
                onClick={() => navigate("/customer")}
              >
                Shop Now <span>→</span>
              </button>
            </div>
          </aside>

          {/* CENTER + RIGHT CONTENT */}
          <div className="ns-orders-workspace">
            {/* CENTER: ORDERS LIST */}
            <section className="ns-orders-center">
              <header className="ns-orders-header">
                <div>
                  <h1>My Orders</h1>
                  <p>
                    View, track and manage all your orders in one place.
                  </p>
                </div>

                <div className="ns-orders-toolbar">
                  <label className="ns-orders-search">
                    <span aria-hidden="true">⌕</span>

                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Search orders by ID or product..."
                      aria-label="Search orders by ID or product"
                    />
                  </label>

                  <select
                    className="ns-orders-date-filter"
                    aria-label="Date filter"
                    defaultValue="all"
                  >
                    <option value="all">All Time</option>
                    <option value="recent" disabled>
                      Recent Orders
                    </option>
                  </select>
                </div>
              </header>

              {/* Status filter tabs */}
              <div className="ns-orders-tabs">
                <button
                  type="button"
                  className={
                    statusFilter === "All" ? "active all-tab" : "all-tab"
                  }
                  onClick={() => setStatusFilter("All")}
                >
                  <span>▣</span>
                  All Orders
                  <b>{orders.length}</b>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "Delivered"
                      ? "active delivered-tab"
                      : "delivered-tab"
                  }
                  onClick={() => setStatusFilter("Delivered")}
                >
                  <span>✓</span>
                  Delivered
                  <b>{deliveredCount}</b>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "In Progress"
                      ? "active progress-tab"
                      : "progress-tab"
                  }
                  onClick={() => setStatusFilter("In Progress")}
                >
                  <span>↗</span>
                  In Progress
                  <b>{inProgressCount}</b>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "Cancelled"
                      ? "active cancelled-tab"
                      : "cancelled-tab"
                  }
                  onClick={() => setStatusFilter("Cancelled")}
                >
                  <span>×</span>
                  Cancelled
                  <b>{cancelledCount}</b>
                </button>
              </div>

              <div className="ns-orders-list-heading">
                <h2>Recent Orders</h2>
                <span>{filteredOrders.length} found</span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="ns-orders-empty">
                  <div className="ns-orders-empty-icon">🛒</div>

                  <h2>
                    {orders.length === 0
                      ? "No orders yet"
                      : "No matching orders"}
                  </h2>

                  <p>
                    {orders.length === 0
                      ? "Your orders will appear here after checkout."
                      : "Try a different search or status filter."}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/customer")}
                  >
                    Explore Groceries →
                  </button>
                </div>
              ) : (
                <div className="ns-orders-list">
                  {filteredOrders.map((order) => {
                    const originalIndex = orders.indexOf(order);
                    const key = getOrderKey(order, originalIndex);
                    const items = order.items || [];
                    const status = getStatus(order);
                    const isSelected = selectedOrderId === key;

                    const count = items.reduce(
                      (sum, item) => sum + getQuantity(item),
                      0
                    );

                    return (
                      <button
                        type="button"
                        className={`ns-orders-card ${
                          isSelected ? "selected" : ""
                        }`}
                        key={key}
                        onClick={() => selectOrder(order, originalIndex)}
                        aria-pressed={isSelected}
                      >
                        <div className="ns-orders-card-bag">
                          {items[0] && getImage(items[0]) ? (
                            <img
                              src={getImage(items[0])}
                              alt=""
                            />
                          ) : (
                            <span>🛍</span>
                          )}
                        </div>

                        <div className="ns-orders-card-main">
                          <span className="ns-orders-card-label">
                            Order ID
                          </span>

                          <strong className="ns-orders-card-id">
                            {order.orderId || key}
                          </strong>

                          <span className="ns-orders-card-date">
                            {formatDateTime(order.createdAt)}
                          </span>

                          <span className="ns-orders-card-count">
                            {count} items
                          </span>
                        </div>

                        <div className="ns-orders-card-money">
                          <strong>
                            ₹{getOrderTotal(order).toFixed(2)}
                          </strong>

                          <span>
                            {getPaymentName(order.paymentMethod)}
                          </span>

                          <div className="ns-orders-mini-images">
                            {items.slice(0, 4).map((item, index) => (
                              <span key={`${item.name}-${index}`}>
                                {getImage(item) ? (
                                  <img
                                    src={getImage(item)}
                                    alt=""
                                  />
                                ) : (
                                  "G"
                                )}
                              </span>
                            ))}

                            {items.length > 4 && (
                              <span className="ns-orders-more">
                                +{items.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ns-orders-card-status">
                          <span className={`ns-orders-status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
                            <i />
                            {status}
                          </span>
                        </div>

                        <span className="ns-orders-card-chevron">
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* RIGHT: SELECTED ORDER DETAILS */}
            <aside className="ns-orders-detail-panel">
              {!selectedOrder ? (
                <div className="ns-orders-detail-empty">
                  <span>▤</span>
                  <h2>Select an order</h2>
                  <p>
                    Select an order on the left to view its details.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ns-orders-detail-header">
                    <div className="ns-orders-detail-topline">
                      <h2>
                        Order #{
                          selectedOrder.orderId ||
                          selectedOrderId
                        }
                      </h2>

                      <span className={`ns-orders-status ${selectedStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                        <i />
                        {selectedStatus}
                      </span>
                    </div>

                    <p>
                      Placed on {formatDateTime(selectedOrder.createdAt)}
                    </p>

                    <div className="ns-orders-detail-actions">
                      <button
                        type="button"
                        className="ns-orders-invoice"
                        onClick={() => downloadInvoice(selectedOrder)}
                      >
                        ▤ Download Invoice
                      </button>

                      <button
                        type="button"
                        className="ns-orders-buy-again"
                        onClick={() => buyAgain(selectedOrder)}
                      >
                        🛒 Buy Again
                      </button>
                    </div>
                  </div>

                  {/* Tracking timeline */}
                  <section className="ns-orders-tracking">
                    <h3>Order Tracking</h3>

                    {selectedStatus === "Cancelled" ? (
                      <div className="ns-orders-cancelled-note">
                        This order is marked as cancelled.
                      </div>
                    ) : (
                      <div className="ns-orders-timeline">
                        {[
                          {
                            name: "Order Placed",
                            icon: "🛒",
                          },
                          {
                            name: "Confirmed",
                            icon: "✓",
                          },
                          {
                            name: "Out for Delivery",
                            icon: "🚚",
                          },
                          {
                            name: "Delivered",
                            icon: "✓",
                          },
                        ].map((step, index) => (
                          <div
                            className={`ns-orders-timeline-step ${
                              index <= trackingStep ? "complete" : ""
                            }`}
                            key={step.name}
                          >
                            <span>{step.icon}</span>
                            <strong>{step.name}</strong>
                            <small>
                              {index === 0
                                ? formatDate(selectedOrder.createdAt)
                                : index <= trackingStep
                                  ? "Status recorded"
                                  : "Pending"}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Item details */}
                  <section className="ns-orders-detail-items">
                    <div className="ns-orders-detail-section-heading">
                      <h3>Items ({selectedItemCount})</h3>
                    </div>

                    {selectedItems.map((item, index) => (
                      <div
                        className="ns-orders-detail-item"
                        key={`${item.id || item.name}-${index}`}
                      >
                        <div className="ns-orders-detail-item-image">
                          {getImage(item) ? (
                            <img
                              src={getImage(item)}
                              alt={item.name || "Ordered product"}
                            />
                          ) : (
                            <span>G</span>
                          )}
                        </div>

                        <div className="ns-orders-detail-item-info">
                          <strong>{item.name || "Grocery Product"}</strong>

                          <span>
                            {item.weight || item.unit || "1 item"}
                          </span>
                        </div>

                        <span className="ns-orders-detail-qty">
                          Qty: {getQuantity(item)}
                        </span>

                        <strong className="ns-orders-detail-item-total">
                          ₹{getLineTotal(item).toFixed(0)}
                        </strong>
                      </div>
                    ))}
                  </section>

                  {/* Address and payment summary */}
                  <div className="ns-orders-detail-bottom">
                    <section
                      className="ns-orders-address-box"
                      id="order-delivery-address"
                    >
                      <h3>
                        <span>⌖</span> Delivery Address
                      </h3>

                      <strong>
                        {address.fullName || "Customer"}
                      </strong>

                      <p>
                        {[
                          address.house,
                          address.locality,
                          address.landmark,
                          address.city,
                          address.pincode,
                          address.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address not available"}
                      </p>

                      {address.phone && (
                        <p>Phone: {address.phone}</p>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate("/profile#saved-address")}
                      >
                        ⌖ View Address
                      </button>
                    </section>

                    <section className="ns-orders-payment-box">
                      <h3>
                        <span>▤</span> Payment Summary
                      </h3>

                      <div>
                        <span>Item Total</span>
                        <strong>
                          ₹{Number(
                            selectedOrder.subtotal ??
                              selectedItems.reduce(
                                (sum, item) => sum + getLineTotal(item),
                                0
                              )
                          ).toFixed(0)}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery Fee</span>
                        <strong>
                          ₹{Number(
                            selectedOrder.deliveryFee || 0
                          ).toFixed(0)}
                        </strong>
                      </div>

                      {Number(selectedOrder.discount || 0) > 0 && (
                        <div className="ns-orders-payment-discount">
                          <span>Discount</span>
                          <strong>
                            − ₹{Number(
                              selectedOrder.discount
                            ).toFixed(0)}
                          </strong>
                        </div>
                      )}

                      <div className="ns-orders-payment-grand">
                        <strong>Grand Total</strong>
                        <strong>
                          ₹{getOrderTotal(selectedOrder).toFixed(0)}
                        </strong>
                      </div>

                      <h4>Payment Method</h4>
                      <p className="ns-orders-payment-method">
                        <span>₹</span>
                        {getPaymentName(selectedOrder.paymentMethod)}
                      </p>
                    </section>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Common_Footer />
    </div>
  );
}
