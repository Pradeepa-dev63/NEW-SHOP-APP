import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";
import { customer_card_product } from "../components/All_Images/Images";
import "./Wishlist.css";

const WISHLIST_KEY = "nearshop-wishlist";
const CART_KEY = "nearshop-cart";

function getProductId(product) {
  return String(
    product?.id ??
      product?._id ??
      product?.slug ??
      String(product?.name || "product")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
  );
}

function getImage(product) {
  return (
    product?.image ||
    product?.img ||
    product?.src ||
    product?.thumbnail ||
    product?.imageUrl ||
    ""
  );
}

function getPrice(product) {
  return Math.max(0, Number(product?.price || 0));
}

function getOldPrice(product) {
  return Math.max(
    getPrice(product),
    Number(
      product?.oldPrice ??
        product?.old_price ??
        product?.mrp ??
        product?.price ??
        0
    )
  );
}

function readWishlist() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(WISHLIST_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function readCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) ||
        localStorage.getItem("nearshop_cart") ||
        "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(readWishlist);
  const [notice, setNotice] = useState("");

  const availableProducts = Array.isArray(customer_card_product)
    ? customer_card_product
    : [];

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  const wishlistIds = new Set(
    wishlist.map((product) => getProductId(product))
  );

  const recommendations = availableProducts
    .filter(
      (product) => !wishlistIds.has(getProductId(product))
    )
    .slice(0, 8);

  function addToWishlist(product) {
    const productId = getProductId(product);

    setWishlist((previous) => {
      if (
        previous.some(
          (item) => getProductId(item) === productId
        )
      ) {
        return previous;
      }

      return [
        ...previous,
        {
          ...product,
          id: productId,
          image: getImage(product),
        },
      ];
    });

    setNotice(`${product.name || "Product"} added to your Wishlist.`);
  }

  function removeFromWishlist(productId) {
    setWishlist((previous) =>
      previous.filter(
        (product) =>
          getProductId(product) !== String(productId)
      )
    );

    setNotice("Product removed from your Wishlist.");
  }

  function clearWishlist() {
    setWishlist([]);
    setNotice("Your Wishlist has been cleared.");
  }

  function openProduct(product) {
    const productId = getProductId(product);

    const selectedProduct = {
      ...product,
      id: productId,
      image: getImage(product),
    };

    sessionStorage.setItem(
      "nearshop_selected_product",
      JSON.stringify(selectedProduct)
    );

    navigate(
      `/product/${encodeURIComponent(productId)}`,
      {
        state: {
          product: selectedProduct,
        },
      }
    );
  }

  function addToCart(product) {
    const productId = getProductId(product);

    const cartProduct = {
      ...product,
      id: productId,
      image: getImage(product),
      quantity: 1,
    };

    const cart = readCart();

    const existing = cart.find(
      (item) => String(item.id) === productId
    );

    const updatedCart = existing
      ? cart.map((item) =>
          String(item.id) === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + 1,
              }
            : item
        )
      : [...cart, cartProduct];

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("nearshop-cart-updated")
    );

    setNotice(`${product.name || "Product"} added to your cart.`);
  }

  function renderProduct(product, isSaved) {
    const productId = getProductId(product);
    const image = getImage(product);
    const price = getPrice(product);
    const oldPrice = getOldPrice(product);

    const discount =
      oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    return (
      <article
        className="ns-wishlist-product"
        key={productId}
      >
        <div className="ns-wishlist-product-visual">
          <button
            type="button"
            className="ns-wishlist-image-button"
            onClick={() => openProduct(product)}
            aria-label={`View ${product.name} details`}
          >
            {image ? (
              <img
                src={image}
                alt={product.name || "Grocery product"}
                loading="lazy"
              />
            ) : (
              <span className="ns-wishlist-no-image">
                No image
              </span>
            )}
          </button>

          {discount > 0 && (
            <span className="ns-wishlist-discount">
              {discount}% OFF
            </span>
          )}

          {isSaved ? (
            <button
              type="button"
              className="ns-wishlist-heart is-saved"
              onClick={() =>
                removeFromWishlist(productId)
              }
              aria-label={`Remove ${product.name} from Wishlist`}
              title="Remove from Wishlist"
            >
              ♥
            </button>
          ) : (
            <button
              type="button"
              className="ns-wishlist-heart"
              onClick={() => addToWishlist(product)}
              aria-label={`Add ${product.name} to Wishlist`}
              title="Add to Wishlist"
            >
              ♡
            </button>
          )}
        </div>

        <div className="ns-wishlist-product-info">
          <button
            type="button"
            className="ns-wishlist-product-name"
            onClick={() => openProduct(product)}
          >
            {product.name || "Grocery Product"}
          </button>

          <span className="ns-wishlist-unit">
            {product.weight || product.unit || "1 kg"}
          </span>

          <div className="ns-wishlist-price">
            <strong>₹{price.toFixed(0)}</strong>

            {oldPrice > price && (
              <del>₹{oldPrice.toFixed(0)}</del>
            )}
          </div>

          <div className="ns-wishlist-card-actions">
            <button
              type="button"
              className="ns-wishlist-add-button"
              onClick={() => addToCart(product)}
            >
              + Add to Cart
            </button>

            <button
              type="button"
              className="ns-wishlist-view-button"
              onClick={() => openProduct(product)}
            >
              View
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="ns-wishlist-page">
    <Common_navbar />

      <main className="ns-wishlist-main">
        <header className="ns-wishlist-header">
          <div>
            <span className="ns-wishlist-eyebrow">
              YOUR NEARSHOP ACCOUNT
            </span>

            <h1>
              My Wishlist
              <span> ({wishlist.length})</span>
            </h1>

            <p>
              Keep your favourite groceries in one place
              and add them to your cart whenever you need them.
            </p>
          </div>

          <Link
            to="/customer"
            className="ns-wishlist-continue"
          >
            ← Continue Shopping
          </Link>
        </header>

        {notice && (
          <div
            className="ns-wishlist-notice"
            role="status"
          >
            <span>✓</span>
            {notice}

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <div className="ns-wishlist-layout">
          {/* Account navigation */}
          <aside className="ns-wishlist-sidebar">
            <div className="ns-wishlist-account-title">
              <div className="ns-wishlist-account-avatar">
                ♙
              </div>

              <div>
                <strong>My Account</strong>
                <span>Manage your account</span>
              </div>
            </div>

            <nav className="ns-wishlist-nav">
              <Link to="/profile">
                <span>♙</span> My Profile
              </Link>

              <Link to="/orders">
                <span>▤</span> My Orders
              </Link>

              <Link to="/profile#saved-address">
                <span>⌖</span> My Addresses
              </Link>

              <Link
                to="/wishlist"
                className="active"
              >
                <span>♡</span> Wishlist
                <b>{wishlist.length}</b>
              </Link>

              <Link to="/customer">
                <span>◇</span> Offers & Coupons
              </Link>
            </nav>

            <div className="ns-wishlist-side-banner">
              <span aria-hidden="true">🌿</span>

              <strong>Fresh choices, close to home</strong>

              <p>
                Support local shops while shopping for your
                daily essentials.
              </p>

              <Link to="/customer">
                Explore Products →
              </Link>
            </div>
          </aside>

          {/* Wishlist content */}
          <section className="ns-wishlist-content">
            <div className="ns-wishlist-section-heading">
              <div>
                <h2>Saved Products</h2>
                <p>
                  {wishlist.length} saved{" "}
                  {wishlist.length === 1 ? "item" : "items"}
                </p>
              </div>

              {wishlist.length > 0 && (
                <button
                  type="button"
                  className="ns-wishlist-clear"
                  onClick={clearWishlist}
                >
                  ♲ Clear Wishlist
                </button>
              )}
            </div>

            {wishlist.length > 0 ? (
              <div className="ns-wishlist-grid">
                {wishlist.map((product) =>
                  renderProduct(product, true)
                )}
              </div>
            ) : (
              <div className="ns-wishlist-empty">
                <div className="ns-wishlist-empty-icon">
                  ♡
                </div>

                <h2>Your Wishlist is empty</h2>

                <p>
                  Save the products you love by pressing
                  the heart icon on a product card.
                </p>

                <Link to="/customer">
                  Browse Groceries →
                </Link>
              </div>
            )}

          </section>
          
        </div>
      </main>

      <Common_Footer />
    </div>
  );
}
