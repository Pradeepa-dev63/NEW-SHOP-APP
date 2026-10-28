import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { categoryData } from "../components/All_Images/Images";
import "./Categoty_Product_types.css";
import Common_Footer from "../components/Footer/Common_Footer";


export default function Product_types() {
  const { slug } = useParams();
  const category = categoryData[slug];
  const [activeType, setActiveType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();



  const handleAddToCart = (product) => {
    const CART_KEY = "nearshop-cart";

    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      const cart = Array.isArray(savedCart) ? savedCart : [];

      const cartProduct = {
        id: `${slug}-${product.id}`,
        productId: product.id,
        category: slug,
        name: product.name,
        unit: product.weight || "1 item",
        seller: product.seller || "NearShop Seller",
        price: Number(product.price) || 0,
        mrp: Number(product.oldPrice ?? product.price) || 0,
        image: product.image,
        quantity: 1,
      };

      const existing = cart.find(
        (item) => String(item.id) === String(cartProduct.id)
      );

      const updatedCart = existing
        ? cart.map((item) =>
          String(item.id) === String(cartProduct.id)
            ? {
              ...item,
              quantity: Number(item.quantity || 1) + 1,
            }
            : item
        )
        : [...cart, cartProduct];

      localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));

      navigate("/Add_to_card");
    } catch (error) {
      console.error("Unable to add product to cart:", error);
    }
  };


  useEffect(() => {
    setActiveType("All");
    setMaxPrice(500);
    setMinRating(0);
    setSortBy("recommended");
  }, [slug]);


  const visibleProducts = useMemo(() => {
    if (!category) return [];
    const filtered = category.products.filter(
      (p) =>
        (activeType === "All" || p.type === activeType) &&
        p.price <= maxPrice &&
        p.rating >= minRating
    );
    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [category, activeType, maxPrice, minRating, sortBy]);

  if (!category) {
    return (
      <div className="fruit-page">
        <Navbar />
        <main className="fruit-page-main">
          <p className="fruit-empty">Category not found.</p>
          <Link to="/customer">Back to home</Link>
        </main>
      </div>
    );
  }

  const typeOptions = ["All", ...category.types];

  return (
    <div className="fruit-page">
      <Navbar />

      <main className="fruit-page-main">
        <nav className="fruit-breadcrumb" aria-label="Breadcrumb">
          <Link to="/Category_product" className="fruit-breadcrumb__link">
            <span className="back_arrow" aria-hidden="true">←</span>
            <span className="back-text">View All </span>
          </Link>

          <span className="fruit-breadcrumb__separator" aria-hidden="true"> / </span>
          <span className="fruit-breadcrumb__current" aria-current="page">
            {category.title}
          </span>
        </nav>

        <header className="fruit-heading">
          <div className="fruit-heading__copy">
            <h1>{category.title}</h1>
            <p>{category.subtitle}</p>
          </div>

          <div className="fruit-promo">
            <div className="fruit-promo__copy">
              <span>FRESH DEALS</span>
              <strong>Save up to 20% this week</strong>
            </div>

            {category.products[0]?.bar_img && (
              <img
                src={category.products[0].bar_img}
                alt=""
                className="fruit-promo__image"
              />
            )}
          </div>
        </header>

        <div className="fruit-layout">
          <aside className="fruit-filters">
            <h2>Filter products</h2>

            <fieldset>
              <legend>Type</legend>
              {typeOptions.map((type) => (
                <label className="fruit-filter-option" key={type}>
                  <input
                    type="radio"
                    name="product-type"
                    checked={activeType === type}
                    onChange={() => setActiveType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Maximum price: ₹{maxPrice}</legend>
              <input
                className="fruit-price-slider"
                type="range"
                min="50"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Maximum price"
              />
            </fieldset>

            <fieldset>
              <legend>Minimum rating</legend>
              {[0, 4, 4.5].map((rating) => (
                <label className="fruit-filter-option" key={rating}>
                  <input
                    type="radio"
                    name="product-rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                  />
                  <span>{rating === 0 ? "All ratings" : `${rating}+ stars`}</span>
                </label>
              ))}
            </fieldset>
          </aside>

          <section className="fruit-results" id="products">
            <div className="fruit-results-heading">
              <div>
                <h2>Popular in {category.title}</h2>
                <p>{visibleProducts.length} products available</p>
              </div>

              <label className="fruit-sort">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </label>
            </div>

            {visibleProducts.length > 0 ? (

              <div className="fruit-product-grid">
                {visibleProducts.map((product) => (
                  <article className="fruit-product-card" key={product.id}>
                    {/* <div className="fruit-product-image">
                      <span className="fruit-discount">{product.discount}</span>
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </div> */}

                    <Link
                      to={`/category/${slug}/product/${product.id}`}
                      className="fruit-product-image"
                      aria-label={`View ${product.name} details`}
                    >
                      <span className="fruit-discount">
                        {product.discount}
                      </span>

                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>

                    <div className="fruit-product-info">
                      <span className="fruit-product-type">{product.type}</span>
                      <h3>{product.name}</h3>
                      <p className="fruit-rating">
                        <span aria-hidden="true">★</span> {product.rating} ({product.reviews})
                      </p>
                      <p className="fruit-weight">{product.weight}</p>

                      <div className="fruit-price-row">
                        <strong>₹{product.price}</strong>
                        <del>₹{product.oldPrice}</del>
                      </div>

                      <button
                        className="fruit-add-button"
                        type="button"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>

                    </div>
                  </article>

                ))}
              </div>
            ) : (
              <p className="fruit-empty">No products match these filters.</p>
            )}
          </section>
        </div>
      </main>

      {/* <div className="fruit-cart-count" role="status">
        Cart: {cartCount}
      </div> */}

      <Common_Footer />

    </div>
  );

}









