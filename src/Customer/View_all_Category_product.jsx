import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import {
  customer_all_categories,
  customer_categories,
} from "../components/All_Images/Images";
import "./View_all_Category_product.css";
import Common_Footer from "../components/Footer/Common_Footer";

export default function Category_product() {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("popular");

  const groups = [
    ...new Set(customer_all_categories.map((category) => category.group)),
  ];

  const visibleCategories = useMemo(() => {
    let results = customer_all_categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesGroup =
        groupFilter === "All" || category.group === groupFilter;

      return matchesSearch && matchesGroup;
    });

    if (sortOrder === "name") {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [search, groupFilter, sortOrder]);

  return (
    <div className="all-category-page">
      <Navbar />

      <main className="all-category-main">
        <header className="all-category-toolbar">
          <div className="all-category-title">
            <h1>Shop by Category</h1>
            <span className="all-category-title-mark" />
            <p>Fresh finds from stores around your neighbourhood</p>
          </div>

          <div className="all-category-controls">
            <label className="all-category-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search for categories, products or brands..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search categories"
              />
            </label>

          </div>
        </header>

        <section className="all-category-grid" aria-label="All categories">
          {visibleCategories.map((category) => (
            <Link
              className="all-category-card"
              key={category.name}
              to={category.target || `/products?category=${encodeURIComponent(category.name)}`}
            >
              <div className="all-category-card-image">
                <img src={category.image} alt="" loading="lazy" />
              </div>

              <div className="all-category-card-info">
                <div>
                  <h2>{category.name}</h2>
                  <p>{category.count}</p>
                </div>
                <span className="all-category-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}

          {visibleCategories.length === 0 && (
            <p className="all-category-empty">
              No categories match “{search}”.
            </p>
          )}
        </section>

        <section className="popular-category-strip">
          <div className="popular-category-intro">
            <span className="popular-category-star" aria-hidden="true">★</span>
            <h2>Popular categories</h2>
            <p>Most loved by NearShop customers</p>
            <a href="#all-categories">View all categories →</a>
          </div>

          <div className="popular-category-items">
            {customer_categories.slice(0, 6).map((category) => (
              <Link
                className="popular-category-item"
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <img src={category.image} alt="" loading="lazy" />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <div id="all-categories" />
      </main>

          <Common_Footer />
    </div>
  );
}