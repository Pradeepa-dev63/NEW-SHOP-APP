
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Seller_Sidebar.css";

const menuItems = [
  { name: "Dashboard", icon: "▦", path: "/seller/dashboard" },
  { name: "Products", icon: "▣", path: "/seller/products" },
  { name: "Orders", icon: "▤", path: "/seller/orders" },
  { name: "Inventory", icon: "▥", path: "/seller/inventory" },
  { name: "Reports", icon: "▥", path: "/seller/reports" },
  { name: "Settings", icon: "⚙", path: "/seller/settings" },
  {
  label: "My Profile",
  icon: "👤",
  path: "/seller/profile"
}
];

export default function Seller_Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/seller/login");
  };

  return (
    <aside className="seller-sidebar">
      <div className="seller-brand">
        <div className="seller-brand-logo">🌿</div>
        <div>
          <h2>NearShop</h2>
          <p>SELLER PORTAL</p>
        </div>
      </div>

      <div className="seller-menu-heading">WORKSPACE</div>

      <nav className="seller-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/seller/dashboard"}
            className={({ isActive }) =>
              `seller-menu-link ${isActive ? "active" : ""}`
            }
          >
            <span className="seller-menu-icon">{item.icon}</span>
            <span>{item.name}</span>
            {item.name === "Orders" && (
              <span className="seller-menu-count">4</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="seller-sidebar-bottom">
        <div className="seller-help-card">
          <div className="seller-help-icon">?</div>
          <h4>Need help?</h4>
          <p>We're here to help you grow your store.</p>
          <button
            type="button"
            onClick={() => navigate("/seller/settings")}
          >
            Get Support
          </button>
        </div>

        <button
          type="button"
          className="seller-logout"
          onClick={handleLogout}
        >
          <span>↪</span> Log out
        </button>
      </div>
    </aside>
  );
}
