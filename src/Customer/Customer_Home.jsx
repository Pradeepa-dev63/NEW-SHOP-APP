import { useState, useEffect } from "react";
import "./Customer_Home.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { customer_carosal, customer_categories, customer_card_product, categoryData } from "../components/All_Images/Images";
import Common_Footer from "../components/Footer/Common_Footer";

export default function Customer_Home() {
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState("");
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = Array.isArray(customer_carosal) ? customer_carosal : [];
  const navigate = useNavigate();


  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);



  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setToast(""), 2300);
  }

  function chooseCategory(name) {
    setSelectedCategory(name);
    notify(name === "All" ? "Showing all products" : `Showing ${name}`);
  }

  function toggleFavorite(id) {
    const isFavorite = favorites.includes(id);

    setFavorites((current) =>
      isFavorite
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

    notify(isFavorite ? "Removed from favorites" : "Added to favorites");
  }

  const visibleProducts =
    selectedCategory === "All"
      ? customer_card_product
      : customer_card_product.filter(
        (product) => product.category === selectedCategory
      );

  function addToCart(product) {
    const CART_KEY = "nearshop-cart";

    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      const cart = Array.isArray(savedCart) ? savedCart : [];

      const cartProduct = {
        id: `home-${product.category}-${product.id}`,
        productId: product.id,
        category: product.category,
        name: product.name,
        unit: product.weight || "1 item",
        seller: product.seller || "NearShop Seller",
        price: Number(product.price) || 0,
        mrp: Number(product.oldPrice ?? product.price) || 0,
        image: product.image,
        quantity: 1,
      };

      const existing = cart.find(
        (item) => item.id === cartProduct.id
      );

      const updatedCart = existing
        ? cart.map((item) =>
          item.id === cartProduct.id
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
  }


  function makeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, "")
      .replace(/\s+/g, "-");
  }

  function openProduct(product) {
    // Find the matching detailed product using its image.
    for (const [slug, category] of Object.entries(categoryData)) {
      const detailProduct = category.products?.find(
        (item) => item.image === product.image
      );

      if (detailProduct) {
        navigate(`/category/${slug}/product/${detailProduct.id}`);
        return;
      }
    }

    // Fallback for Home products that aren't in categoryData.
    const slug = makeSlug(product.category);
    navigate(`/category/${slug}/product/${product.id}`);
  }

  return (
    <div className="customer-home">
      <Navbar />

      <main id="top">

        {/* ======== CAROSAL BAR  ============ */}

        <section className="customer-hero" aria-label="Featured offers">
          <div
            className="customer-hero-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((image, index) => (
              <div className="customer-hero-slide" key={image}>
                <img
                  className="customer-hero-image"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  src={image}
                  alt={`Grocery offer ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            className="customer-hero-arrow customer-hero-arrow--left"
            onClick={() =>
              setCurrentSlide((current) =>
                (current - 1 + heroSlides.length) % heroSlides.length
              )
            }
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            className="customer-hero-arrow customer-hero-arrow--right"
            onClick={() =>
              setCurrentSlide((current) => (current + 1) % heroSlides.length)
            }
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="customer-hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`customer-hero-dot ${currentSlide === index ? "is-active" : ""
                  }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentSlide === index ? "true" : undefined}
              />
            ))}
          </div>
        </section>

        {/* ======== ALL CATEGORY TAB ============ */}

        <section className="customer-section" id="categories">
          <div className="customer-section-heading">
            <h2>Shop by Category</h2>

            <button
              type="button"
              className="customer-text-button"
              onClick={() => navigate("/Category_product")}
            >
              View all →
            </button>

          </div>

          <div className="customer-categories">
            {customer_categories.map((category) => (
              <button
                type="button"
                className={`customer-category ${selectedCategory === category.name ? "is-selected" : ""
                  }`}
                key={category.name}
                onClick={() => chooseCategory(category.name)}
                aria-pressed={selectedCategory === category.name}
              >
                <img
                  className="customer-category-image"
                  src={category.image}
                  alt=""
                />
                <span className="customer-category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/*----------- VIWE ALL --------------*/}

        <section className="customer-section" id="products">

          <div className="customer-section-heading">
            <div>
              <h2>Popular Products</h2>
              {selectedCategory !== "All" && (
                <p className="customer-filter-note">
                  Showing {selectedCategory}
                </p>
              )}
            </div>
          </div>

          {/*----------- ALL CARD --------------*/}

          <div className="customer-products">
            {visibleProducts.length ? (
              visibleProducts.map((product) => {
                const isFavorite = favorites.includes(product.id);

                return (
                  <article className="customer-product" key={product.id}>
                    <div className="customer-product-visual">
                      <span className="customer-discount">
                        {product.discount}
                      </span>

                      <button
                        className={`customer-heart ${isFavorite ? "is-favorite" : ""
                          }`}
                        aria-label={`Toggle ${product.name} favorite`}
                        aria-pressed={isFavorite}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                      <img
                        className="customer-product-image"
                        src={product.image}
                        alt={product.name}
                        onClick={() => openProduct(product)}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openProduct(product);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      />

                    </div>

                    <div className="customer-product-info">

                      <h3>{product.name}</h3>
                      <div className="customer-rating">
                        <b>★</b> {product.rating}
                      </div>

                      <div className="customer-price-row">
                        <strong>₹{product.price}</strong>
                        <del>₹{product.oldPrice}</del>
                        <span>{product.weight}</span>
                      </div>

                      <button
                        className="customer-add-button"
                        onClick={() => addToCart(product)}
                      >
                        <svg className="pd-cart-icon" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
                          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>

                        Add to Cart
                      </button>

                    </div>
                  </article>
                );
              })
            ) : (
              <p className="customer-empty">
                No products in this category yet.
              </p>
            )}
          </div>

        </section>

        {/*----------- CUSTOMER PROMISE TAG  --------------*/}

        <section className="customer-promises" id="offers">
          <div>
            <span>✿</span>
            <p>
              <b>Freshness Guaranteed</b>
              <small>Farm to your doorstep</small>
            </p>
          </div>
          <div>
            <span>🚚</span>
            <p>
              <b>Fast, Reliable Delivery</b>
              <small>On time, every time</small>
            </p>
          </div>
          <div>
            <span>✓</span>
            <p>
              <b>Safe &amp; Secure Payments</b>
              <small>Checkout with confidence</small>
            </p>
          </div>
          <div>
            <span>♡</span>
            <p>
              <b>Support Local Farmers</b>
              <small>A healthier community</small>
            </p>
          </div>
        </section>
      </main>

      <Common_Footer />

    </div>
  );
}