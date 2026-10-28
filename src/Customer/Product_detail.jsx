import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { categoryData, customer_card_product, } from "../components/All_Images/Images";
import "./Product_detail.css";
import Common_Footer from "../components/Footer/Common_Footer";


export default function Product_detail() {

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const category = categoryData[slug];

  // First look in the detailed category data.
  const detailedProduct = category?.products?.find(
    (item) => String(item.id) === String(id)
  );

  // If the product isn't in categoryData, look in the Home products.
  const homeProduct = customer_card_product.find((item) => {
    const productSlug = item.category
      .toLowerCase()
      .trim()
      .replace(/&/g, "")
      .replace(/\s+/g, "-");

    return (
      productSlug === slug &&
      String(item.id) === String(id)
    );
  });

  const product = detailedProduct || homeProduct;


  // reset when another product is opened
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    window.scrollTo(0, 0);
  }, [slug, id]);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const images = product.apple_views?.length
    ? product.apple_views
    : product.images?.length
      ? product.images
      : [product.image].filter(Boolean); const inStock = product.inStock !== false;

  const handleAddToCart = () => {
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
        image: product.image || images[0],
        quantity,
      };

      const existing = cart.find(
        (item) => String(item.id) === String(cartProduct.id)
      );

      const updatedCart = existing
        ? cart.map((item) =>
          String(item.id) === String(cartProduct.id)
            ? {
              ...item,
              quantity: Number(item.quantity || 1) + quantity,
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

  const handleBuyNow = () => {
    navigate("/Add_to_card");
  };


  return (
    <div className="pd-page">
      <Navbar />

      <main className="pd-main">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/category/${slug}`}>
            {category?.title || product.category || slug}
          </Link>
          <span>/</span>
          <span className="pd-current">{product.name}</span>
        </nav>

        <div className="pd-layout">

          {/* LEFT: gallery */}

          <section className="pd-gallery">
            <div className="pd-main-image">
              <img src={images[activeImage]} alt={product.name} />
              <button
                type="button"
                className="pd-zoom"
                onClick={() => setZoomOpen(true)}
                aria-label="Zoom image"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                  stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M15.5 15.5L21 21" />
                </svg>
              </button>
            </div>

            {zoomOpen && (
              <div className="pd-lightbox" onClick={() => setZoomOpen(false)}>
                <img src={images[activeImage]} alt={product.name} />
              </div>
            )}

            <div className="pd-thumbs">
              {images.map((img, index) => (
                <button
                  type="button"
                  key={img}
                  className={`pd-thumb ${index === activeImage ? "active" : ""}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT: info */}

          <section className="pd-info">
            <div className="pd-card">
              <h1>{product.name}</h1>

              <div className="pd-rating">
                <span
                  className="pd-stars"
                  style={{ "--rating": Math.round(product.rating * 2) / 2 }}
                  aria-hidden="true"
                >
                  ★★★★★
                </span>

                <strong>
                  {Number.isFinite(Number(product.rating))
                    ? Number(product.rating).toFixed(1)
                    : "4.5"}
                </strong>

                <span>
                  ({product.reviews ?? 120} reviews)
                </span>

              </div>

              <div className="pd-price-row">
                <strong className="pd-price">₹{product.price}</strong>
                <del>₹{product.oldPrice}</del>
                <span className="pd-discount">{product.discount}</span>
              </div>

              <p className="pd-description">
                {product.description || "Fresh and delivered from shops near you."}
              </p>

              <hr />

              <p className={`pd-stock ${inStock ? "" : "out"}`}>
                <span className="pd-dot" />
                {inStock ? "In stock, delivered fresh." : "Currently out of stock."}
              </p>

              <div className="pd-actions">
                <div className="pd-qty-wrap">
                  <span className="Quantity">Quantity</span>
                  <div className="pd-qty">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="pd-btn pd-btn-primary"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <svg className="pd-cart-icon" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  Add to Cart
                </button>

                <button
                  type="button"
                  className="pd-btn pd-btn-outline"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="pd-card">
              <h2>Product details</h2>
              <dl className="pd-details">
                <div>
                  <dt>Origin</dt>
                  <dd>{product.origin || "Local farms"}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{product.weight}</dd>
                </div>
                <div>
                  <dt>Storage</dt>
                  <dd>{product.storage || "Store in a cool, dry place."}</dd>
                </div>
              </dl>
            </div>
          </section>

        </div>
      </main>

      <Common_Footer />

    </div>
  );
}
