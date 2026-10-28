
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Seller_Home.css";

import categoryFruits from "../Assets/seller_img/category-fruits-vegetables.jpg";
import categoryDairy from "../Assets/seller_img/category-dairy-eggs.jpg";
import categoryBakery from "../Assets/seller_img/category-bakery-snacks.jpg";
import categoryBeverages from "../Assets/seller_img/category-beverages.jpg";
import categoryHousehold from "../Assets/seller_img/category-household-essentials.jpg";
import categoryPersonalCare from "../Assets/seller_img/category-personal-care.jpg";
import categoryGrains from "../Assets/seller_img/category-grains-pulses.jpg";
import categoryFrozen from "../Assets/seller_img/category-frozen-foods.jpg";
import categorySnacks from "../Assets/seller_img/category-snacks-biscuits.jpg";
import categoryOrganic from "../Assets/seller_img/category-organic-products.jpg";
import categoryBaby from "../Assets/seller_img/category-baby-care.jpg";
import categoryOthers from "../Assets/seller_img/category-others.jpg";
import productFreshTomatoes from "../Assets/seller_img/product-fresh-tomatoes.jpg";
import productBanana from "../Assets/seller_img/product-banana.jpg";
import productMilk from "../Assets/seller_img/product-milk.jpg";
import productBrownBread from "../Assets/seller_img/product-brown-bread.jpg";
import productCookingOil from "../Assets/seller_img/product-cooking-oil.jpg";


const menuItems = [
  { label: "Dashboard", icon: "⌂", path: "/seller/dashboard" },
  { label: "Products", icon: "▣", path: "/seller/products" },
  { label: "Orders", icon: "🛒", path: "/seller/orders", badge: 3 },
  { label: "Customers", icon: "♙", path: "/seller/orders" },
  { label: "Inventory", icon: "▤", path: "/seller/inventory" },
  { label: "Earnings", icon: "₹", path: "/seller/reports" },
  { label: "Store Settings", icon: "⚙", path: "/seller/settings" },
];

const salesStats = [
  {
    title: "Total Sales",
    value: "₹12,540",
    growth: "12%",
    icon: "♧",
    color: "green",
  },
  {
    title: "Total Orders",
    value: "48",
    growth: "8%",
    icon: "▣",
    color: "purple",
  },
  {
    title: "Active Products",
    value: "56",
    growth: "5%",
    icon: "▧",
    color: "orange",
  },
  {
    title: "Total Customers",
    value: "42",
    growth: "10%",
    icon: "♙",
    color: "blue",
  },
];

const categories = [
  { name: "Fruits & Vegetables", image: categoryFruits, color: "mint" },
  { name: "Dairy & Eggs", image: categoryDairy, color: "blue" },
  { name: "Bakery & Snacks", image: categoryBakery, color: "cream" },
  { name: "Beverages", image: categoryBeverages, color: "blue" },
  { name: "Household Essentials", image: categoryHousehold, color: "mint" },
  { name: "Personal Care", image: categoryPersonalCare, color: "pink" },
  { name: "Grains & Pulses", image: categoryGrains, color: "cream" },
  { name: "Frozen Foods", image: categoryFrozen, color: "blue" },
  { name: "Snacks & Biscuits", image: categorySnacks, color: "pink" },
  { name: "Organic Products", image: categoryOrganic, color: "mint" },
  { name: "Baby Care", image: categoryBaby, color: "blue" },
  { name: "Others", image: categoryOthers, color: "cream" },
];

const initialOrders = [
  {
    id: "#NS12345",
    customer: "Priya Sharma",
    items: 3,
    amount: 480,
    status: "Delivered",
  },
  {
    id: "#NS12346",
    customer: "Rohit Verma",
    items: 5,
    amount: 920,
    status: "Processing",
  },
  {
    id: "#NS12347",
    customer: "Anita Patel",
    items: 2,
    amount: 360,
    status: "Packed",
  },
  {
    id: "#NS12348",
    customer: "Suresh Kumar",
    items: 4,
    amount: 750,
    status: "Shipped",
  },
  {
    id: "#NS12349",
    customer: "Neha Singh",
    items: 6,
    amount: 1240,
    status: "Pending",
  },
];

const topProducts = [
  {
    name: "Fresh Tomatoes",
    sold: 124,
    price: "₹40/kg",
    image: productFreshTomatoes,
    color: "pink",
  },
  {
    name: "Banana",
    sold: 98,
    price: "₹50/kg",
    image: productBanana,
    color: "cream",
  },
  {
    name: "Milk (1L)",
    sold: 87,
    price: "₹60",
    image: productMilk,
    color: "blue",
  },
  {
    name: "Brown Bread",
    sold: 72,
    price: "₹45",
    image: productBrownBread,
    color: "cream",
  },
  {
    name: "Cooking Oil (1L)",
    sold: 56,
    price: "₹140",
    image: productCookingOil,
    color: "mint",
  },
];

const quickActions = [
  {
    title: "Add Product",
    description: "List a new product",
    icon: "+",
    color: "green",
    path: "/seller/add-product",
  },
  {
    title: "Manage Orders",
    description: "View & update orders",
    icon: "🛒",
    color: "blue",
    path: "/seller/orders",
  },
  {
    title: "View Earnings",
    description: "Check your revenue",
    icon: "₹",
    color: "purple",
    path: "/seller/reports",
  },
  {
    title: "Store Settings",
    description: "Update store details",
    icon: "⚙",
    color: "orange",
    path: "/seller/settings",
  },
];

function SalesChart() {
  const points = [
    [30, 151],
    [122, 113],
    [215, 103],
    [308, 117],
    [402, 82],
    [495, 98],
    [590, 43],
  ];

  const pointString = points.map((point) => point.join(",")).join(" ");

  const areaPath =
    `M ${points[0][0]} ${points[0][1]} ` +
    points
      .slice(1)
      .map((point) => `L ${point[0]} ${point[1]}`)
      .join(" ") +
    " L 590 174 L 30 174 Z";

  const dayLabels = [
    "Apr 21",
    "Apr 22",
    "Apr 23",
    "Apr 24",
    "Apr 25",
    "Apr 26",
    "Apr 27",
  ];

  return (
    <div className="ns-chart-wrap">
      <svg
        className="ns-sales-chart"
        viewBox="0 0 620 205"
        role="img"
        aria-label="Sample sales overview for seven days"
      >
        <defs>
          <linearGradient
            id="nsSalesFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#159b65"
              stopOpacity="0.24"
            />
            <stop
              offset="100%"
              stopColor="#159b65"
              stopOpacity="0.015"
            />
          </linearGradient>
        </defs>

        {[20, 55, 90, 125, 160].map((y, index) => (
          <g key={y}>
            <line
              x1="30"
              y1={y}
              x2="600"
              y2={y}
              className="ns-chart-grid"
            />
            <text
              x="3"
              y={y + 4}
              className="ns-chart-y-label"
            >
              {["8K", "6K", "4K", "2K", "0"][index]}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#nsSalesFill)" />

        <polyline
          points={pointString}
          fill="none"
          stroke="#149b62"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#149b62"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}

        {dayLabels.map((day, index) => (
          <text
            key={day}
            x={points[index][0]}
            y="194"
            textAnchor="middle"
            className="ns-chart-x-label"
          >
            {day}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function Seller_Home() {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("Last 7 Days");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return initialOrders;

    return initialOrders.filter((order) =>
      `${order.id} ${order.customer} ${order.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return topProducts;

    return topProducts.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div className="ns-dashboard">
      <aside className="ns-sidebar">
        <Link to="/seller/dashboard" className="ns-brand">
          <span className="ns-brand-icon">🌿</span>

          <span className="ns-brand-copy">
            <strong>NearShop</strong>
            <small>Seller Panel</small>
          </span>
        </Link>

        <nav
          className="ns-sidebar-nav"
          aria-label="Seller navigation"
        >
          {menuItems.map((item, index) => (
            <Link
              to={item.path}
              key={item.label}
              className={`ns-nav-link ${
                index === 0 ? "active" : ""
              }`}
            >
              <span className="ns-nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.badge && (
                <span className="ns-nav-badge">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="ns-upgrade-card">
          <div className="ns-upgrade-emoji">🏪</div>

          <h3>Grow your business with NearShop</h3>

          <p>
            More customers. More orders. More growth.
          </p>

          <Link
            to="/seller/settings"
            className="ns-upgrade-button"
          >
            Upgrade Plan
          </Link>
        </div>

        <div className="ns-sidebar-footer">
          © 2026 NearShop
        </div>
      </aside>

      <div className="ns-dashboard-main">
        <header className="ns-topbar">
          <div className="ns-search-box">
            <span className="ns-search-icon">⌕</span>

            <input
              type="search"
              aria-label="Search products, orders, or customers"
              placeholder="Search products, orders, or customers..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                className="ns-clear-search"
                onClick={() => setSearch("")}
                type="button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="ns-topbar-right">
            <div className="ns-popover-holder">
              <button
                className="ns-icon-button ns-notification-button"
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
              >
                ♧
                <span className="ns-notification-count">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="ns-popover-menu">
                  <strong>Notifications</strong>
                  <p>You have 3 new order notifications.</p>
                  <Link to="/seller/orders">
                    View orders
                  </Link>
                </div>
              )}
            </div>

            <div className="ns-popover-holder">
              <button
                type="button"
                className="ns-profile-button"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
              >
                <span className="ns-profile-avatar">♙</span>

                <span className="ns-profile-copy">
                  <strong>Fresh Basket Store</strong>
                  <small>Seller</small>
                </span>

                <span className="ns-chevron">⌄</span>
              </button>

              {showProfile && (
                <div className="ns-popover-menu ns-profile-menu">
                  <strong>Fresh Basket Store</strong>
                  <Link to="/seller/settings">
                    Store settings
                  </Link>
                  <Link to="/seller/store-setup">
                    Store information
                  </Link>
                  <Link to="/seller/login">
                    Login page
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ns-content">
          <section className="ns-welcome">
  <div className="ns-welcome-text">
    <h1>
      Good Morning, Seller! <span>👋</span>
    </h1>

    <p>
      Here's what's happening with your store today.
    </p>
  </div>

  <Link
    to="/seller/add-product"
    className="ns-add-product-button"
  >
    <span>+</span>
    Add Product
  </Link>
</section>

          <section
            className="ns-stats-grid"
            aria-label="Store statistics"
          >
            {salesStats.map((stat) => (
              <article
                className="ns-stat-card"
                key={stat.title}
              >
                <div className={`ns-stat-icon ${stat.color}`}>
                  {stat.icon}
                </div>

                <div className="ns-stat-details">
                  <p>{stat.title}</p>
                  <h2>{stat.value}</h2>
                  <span className="ns-growth">
                    ↑ {stat.growth}
                  </span>
                  <small>vs. last week</small>
                </div>
              </article>
            ))}
          </section>

          <section className="ns-overview-grid">
            <article className="ns-panel ns-sales-panel">
              <div className="ns-panel-header">
                <h2>Sales Overview</h2>

                <select
                  value={range}
                  onChange={(event) =>
                    setRange(event.target.value)
                  }
                  aria-label="Sales chart date range"
                  className="ns-range-select"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>

              <SalesChart />
            </article>

            <article className="ns-panel ns-actions-panel">
              <div className="ns-panel-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="ns-actions-grid">
                {quickActions.map((action) => (
                  <Link
                    to={action.path}
                    className={`ns-action-card ${action.color}`}
                    key={action.title}
                  >
                    <span
                      className={`ns-action-icon ${action.color}`}
                    >
                      {action.icon}
                    </span>

                    <span className="ns-action-text">
                      <strong>{action.title}</strong>
                      <small>{action.description}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </article>
          </section>

          <section className="ns-panel ns-category-panel">
            <div className="ns-panel-header">
              <h2>Shop by Category</h2>

              <Link
                to="/seller/products"
                className="ns-view-all"
              >
                View All <span>→</span>
              </Link>
            </div>

            <div className="ns-category-grid">
              {categories.map((category) => (
                <Link
                  to="/seller/products"
                  className="ns-category-card"
                  key={category.name}
                >
                  <div
                    className={`ns-category-image ${category.color}`}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                    />
                  </div>

                  <span className="ns-category-name">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="ns-bottom-grid">
            <article className="ns-panel ns-orders-panel">
              <div className="ns-panel-header">
                <h2>Recent Orders</h2>

                <Link
                  to="/seller/orders"
                  className="ns-view-all"
                >
                  View All <span>→</span>
                </Link>
              </div>

              <div className="ns-table-scroll">
                <table className="ns-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th aria-label="Open order"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="ns-order-id">
                          {order.id}
                        </td>

                        <td>
                          <span className="ns-customer-cell">
                            <span className="ns-customer-icon">
                              ♙
                            </span>
                            {order.customer}
                          </span>
                        </td>

                        <td>{order.items} items</td>

                        <td>
                          ₹{order.amount.toLocaleString("en-IN")}
                        </td>

                        <td>
                          <span
                            className={`ns-status ${order.status.toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>
                          <Link
                            to="/seller/orders"
                            className="ns-row-arrow"
                            aria-label={`View order ${order.id}`}
                          >
                            ›
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="ns-empty-state"
                        >
                          No matching orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="ns-panel ns-products-panel">
              <div className="ns-panel-header">
                <h2>Top Selling Products</h2>

                <Link
                  to="/seller/products"
                  className="ns-view-all"
                >
                  View All <span>→</span>
                </Link>
              </div>

              <div className="ns-top-products">
                {filteredProducts.map((product) => (
                  <div
                    className="ns-top-product"
                    key={product.name}
                  >
                    <div
                      className={`ns-product-thumb ${product.color}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="ns-product-info">
                      <strong>{product.name}</strong>
                      <small>{product.sold} sold</small>
                    </div>

                    <strong className="ns-product-price">
                      {product.price}
                    </strong>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <p className="ns-empty-state">
                    No matching products found.
                  </p>
                )}
              </div>
            </article>
          </section>

          <footer className="ns-page-footer">
            <span>
              © 2026 NearShop. All rights reserved.
            </span>
            <span>
              Local Stores ♥ Stronger Communities
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
