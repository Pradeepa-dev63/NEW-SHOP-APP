
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";

import { customer_card_product } from "../components/All_Images/Images";

import "./Add_to_card.css";

const CART_KEY = "nearshop-cart";
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 30;

function readCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function makeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getProductId(product) {
  return String(
    product?.id ??
      product?._id ??
      product?.slug ??
      makeSlug(product?.name || "product")
  );
}

function getProductImage(product) {
  return (
    product?.image ||
    product?.img ||
    product?.src ||
    product?.thumbnail ||
    ""
  );
}

function getPrice(product) {
  return Math.max(0, Number(product?.price || 0));
}

function getMRP(product) {
  return Math.max(
    getPrice(product),
    Number(product?.oldPrice ?? product?.old_price ?? product?.price ?? 0)
  );
}

export default function Add_to_card() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(readCart);

  const [selectedIds, setSelectedIds] = useState(() =>
    readCart().map((item) => String(item.id))
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Persist cart changes and notify the navbar.
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    window.dispatchEvent(
      new Event("nearshop-cart-updated")
    );
  }, [cart]);

  // Existing quantity-change behavior.
  const changeQuantity = (id, amount) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              quantity: Math.max(
                1,
                Number(item.quantity || 1) + amount
              ),
            }
          : item
      )
    );
  };

  // Remove a single cart product.
  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => String(item.id) !== String(id)
      )
    );

    setSelectedIds((previous) =>
      previous.filter((selectedId) => selectedId !== String(id))
    );
  };

  // Clear all cart products.
  const clearCart = () => {
    setCart([]);
    setSelectedIds([]);
    setAppliedCoupon(null);
    setCouponMessage("");
  };

  // Select or deselect one product.
  const toggleSelected = (id) => {
    const key = String(id);

    setSelectedIds((previous) =>
      previous.includes(key)
        ? previous.filter((selectedId) => selectedId !== key)
        : [...previous, key]
    );
  };

  // The checkbox in the header selects or deselects every item.
  const allSelected =
    cart.length > 0 &&
    cart.every((item) =>
      selectedIds.includes(String(item.id))
    );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        cart.map((item) => String(item.id))
      );
    }
  };

  // Remove only selected items.
  const removeSelected = () => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          !selectedIds.includes(String(item.id))
      )
    );

    setSelectedIds([]);
  };

  // Only selected items count toward the order summary.
  const selectedCart = cart.filter((item) =>
    selectedIds.includes(String(item.id))
  );

  const totalItems = selectedCart.reduce(
    (sum, item) =>
      sum + Math.max(1, Number(item.quantity || 1)),
    0
  );

  const totalMRP = selectedCart.reduce(
    (sum, item) =>
      sum +
      getMRP(item) *
        Math.max(1, Number(item.quantity || 1)),
    0
  );

  const total = selectedCart.reduce(
    (sum, item) =>
      sum +
      getPrice(item) *
        Math.max(1, Number(item.quantity || 1)),
    0
  );

  const productDiscount = Math.max(0, totalMRP - total);

  const deliveryFee =
    selectedCart.length === 0 ||
    total >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;

  const couponDiscount = appliedCoupon
    ? Math.round(
        (total * appliedCoupon.percent) / 100
      )
    : 0;

  const grandTotal = Math.max(
    0,
    total - couponDiscount + deliveryFee
  );

  const amountForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - total
  );

  // Example demo coupons: NEAR10 and FRESH20.
  const applyCoupon = (event) => {
    event.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (selectedCart.length === 0) {
      setCouponMessage("Select a product before applying a coupon.");
      setAppliedCoupon(null);
      return;
    }

    const demoCoupons = {
      NEAR10: { percent: 10 },
      FRESH20: { percent: 20 },
    };

    if (!demoCoupons[code]) {
      setAppliedCoupon(null);
      setCouponMessage(
        "Invalid code. Try NEAR10 or FRESH20."
      );
      return;
    }

    setAppliedCoupon({
      code,
      percent: demoCoupons[code].percent,
    });

    setCouponMessage(`${code} applied successfully.`);
  };

  // Open Product Details from a cart or recommendation image.
  const openProduct = (product) => {
    const productId = getProductId(product);

    const selectedProduct = {
      ...product,
      id: productId,
      image: getProductImage(product),
    };

    try {
      sessionStorage.setItem(
        "nearshop_selected_product",
        JSON.stringify(selectedProduct)
      );

      navigate(
        `/product/${encodeURIComponent(productId)}`,
        {
          state: { product: selectedProduct },
        }
      );
    } catch (error) {
      console.error("Unable to open product details:", error);
    }
  };

  // Add a recommendation to the cart.
  const addSuggestedProduct = (product) => {
    const productId = getProductId(product);

    const newProduct = {
      ...product,
      id: productId,
      image: getProductImage(product),
      quantity: 1,
    };

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => String(item.id) === productId
      );

      if (existing) {
        return previousCart.map((item) =>
          String(item.id) === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [...previousCart, newProduct];
    });

    // Newly added recommendation is selected by default.
    setSelectedIds((previous) =>
      previous.includes(productId)
        ? previous
        : [...previous, productId]
    );
  };

  // Filter recommendations against products already in the cart.
  const recommendations = Array.isArray(customer_card_product)
    ? customer_card_product
        .filter(
          (product) =>
            !cart.some(
              (item) =>
                String(item.id) === getProductId(product)
            )
        )
        .slice(0, 6)
    : [];

  return (
    <div className="ns-cart-page">
      <Common_navbar />

      <main className="ns-cart-main">
        {/* Page heading */}
        <div className="ns-cart-heading">
          <h1>
            <span className="ns-cart-heading-icon" aria-hidden="true">
              🛒
            </span>
            My Cart{" "}
            <span className="ns-cart-item-count">
              ({totalItems} items)
            </span>
          </h1>
        </div>

        {cart.length === 0 ? (
          <section className="ns-cart-empty">
            <div className="ns-cart-empty-icon" aria-hidden="true">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Discover fresh groceries from local stores
              and add your favourites to your basket.
            </p>

            <Link
              to="/customer"
              className="ns-cart-empty-button"
            >
              ← Continue Shopping
            </Link>
          </section>
        ) : (
          <div className="ns-cart-layout">
            {/* LEFT SIDE: CART ITEMS */}
            <section className="ns-cart-items">
              <div className="ns-cart-items-header">
                <div className="ns-cart-items-title">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all cart products"
                  />

                  <h2>
                    My Cart ({totalItems} items)
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="ns-cart-clear-link"
                >
                  <span aria-hidden="true">♲</span>
                  Clear Cart
                </button>
              </div>

              {cart.map((item) => {
                const quantity = Math.max(
                  1,
                  Number(item.quantity || 1)
                );

                const price = getPrice(item);
                const oldPrice = getMRP(item);
                const image = getProductImage(item);
                const selected = selectedIds.includes(
                  String(item.id)
                );

                const lineTotal = price * quantity;

                return (
                  <article
                    className="ns-cart-item"
                    key={item.id}
                  >
                    {/* Product selection */}
                    <input
                      className="ns-cart-select"
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelected(item.id)}
                      aria-label={`Select ${item.name}`}
                    />

                    {/* Clickable product image */}
                    <button
                      type="button"
                      className="ns-cart-image"
                      onClick={() => openProduct(item)}
                      aria-label={`View ${item.name} details`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={item.name || "Grocery product"}
                        />
                      ) : (
                        <span>No image available</span>
                      )}
                    </button>

                    {/* Product information */}
                    <div className="ns-cart-product-info">
                      <button
                        type="button"
                        className="ns-cart-product-name"
                        onClick={() => openProduct(item)}
                      >
                        {item.name || "Grocery Product"}
                      </button>

                      <p className="ns-cart-unit">
                        {item.weight || item.unit || "1 item"}
                      </p>

                      {item.seller && (
                        <p className="ns-cart-seller">
                          Sold by {item.seller}
                        </p>
                      )}

                      <div className="ns-cart-price-line">
                        {oldPrice > price && (
                          <>
                            <span className="ns-cart-discount">
                              {Math.round(
                                ((oldPrice - price) / oldPrice) * 100
                              )}
                              % OFF
                            </span>

                            <del>₹{oldPrice.toFixed(0)}</del>
                          </>
                        )}

                        <strong>₹{price.toFixed(0)}</strong>
                      </div>
                    </div>

                    {/* Quantity control */}
                    <div className="ns-cart-quantity">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() =>
                          changeQuantity(item.id, -1)
                        }
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(item.id, 1)
                        }
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>

                    {/* Line total and remove */}
                    <strong className="ns-cart-line-total">
                      ₹{lineTotal.toFixed(0)}
                    </strong>

                    <button
                      type="button"
                      className="ns-cart-remove-icon"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      title="Remove product"
                    >
                      ♲
                    </button>
                  </article>
                );
              })}

              {/* Bottom cart actions */}
              <div className="ns-cart-bottom-actions">
                <Link
                  to="/customer"
                  className="ns-cart-continue"
                >
                  <span aria-hidden="true">←</span>
                  Continue Shopping
                </Link>

                <button
                  type="button"
                  className="ns-cart-remove-all"
                  disabled={selectedIds.length === 0}
                  onClick={removeSelected}
                >
                  <span aria-hidden="true">♲</span>
                  Remove Selected
                </button>
              </div>
            </section>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <aside className="ns-cart-summary">
              <h2>Order Summary</h2>

              <div className="ns-cart-total-row">
                <span>Total Items ({totalItems})</span>
                <strong>₹{total.toFixed(0)}</strong>
              </div>

              <div className="ns-cart-total-row">
                <span>Total MRP</span>
                <del>₹{totalMRP.toFixed(0)}</del>
              </div>

              <div className="ns-cart-total-row ns-cart-savings-row">
                <span>Product Discount</span>
                <strong>− ₹{productDiscount.toFixed(0)}</strong>
              </div>

              <hr />

              <div className="ns-cart-total-row">
                <span>Subtotal</span>
                <strong>₹{total.toFixed(0)}</strong>
              </div>

              <div className="ns-cart-total-row">
                <span>Delivery Fee</span>
                <strong>
                  {deliveryFee === 0
                    ? "FREE"
                    : `₹${deliveryFee}`}
                </strong>
              </div>

              {/* Functional demo coupon */}
              <form
                className="ns-cart-coupon"
                onSubmit={applyCoupon}
              >
                <label htmlFor="ns-cart-coupon">
                  <span aria-hidden="true">％</span>
                  Have a coupon code?
                </label>

                <div className="ns-cart-coupon-input">
                  <input
                    id="ns-cart-coupon"
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);
                      setCouponMessage("");
                    }}
                  />

                  <button type="submit">Apply</button>
                </div>

                {couponMessage && (
                  <p className="ns-cart-coupon-message" role="status">
                    {couponMessage}
                  </p>
                )}

                {appliedCoupon && (
                  <button
                    type="button"
                    className="ns-cart-remove-coupon"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                      setCouponMessage("Coupon removed.");
                    }}
                  >
                    Remove coupon
                  </button>
                )}
              </form>

              {/* Delivery banner */}
              <div className="ns-cart-free-delivery">
                <span aria-hidden="true">🚚</span>

                <div>
                  {amountForFreeDelivery > 0 ? (
                    <>
                      <strong>
                        Add ₹{amountForFreeDelivery.toFixed(0)} more
                        for FREE delivery
                      </strong>

                      <div className="ns-cart-delivery-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              (total / FREE_DELIVERY_THRESHOLD) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <strong>You qualify for FREE delivery!</strong>
                  )}
                </div>
              </div>

              <hr />

              {appliedCoupon && (
                <div className="ns-cart-total-row ns-cart-savings-row">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <strong>
                    − ₹{couponDiscount.toFixed(0)}
                  </strong>
                </div>
              )}

              <div className="ns-cart-grand-total">
                <strong>Grand Total</strong>
                <strong>₹{grandTotal.toFixed(0)}</strong>
              </div>

              <button
                type="button"
                className="ns-cart-checkout"
                disabled={selectedCart.length === 0}
                onClick={() => navigate("/checkout")
                }
              >
                Proceed to Checkout
                <span aria-hidden="true">→</span>
              </button>

              <Link
                to="/customer"
                className="ns-cart-summary-continue"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}

        {/* RECOMMENDED PRODUCTS */}
        {recommendations.length > 0 && (
          <section className="ns-cart-recommendations">
            <div className="ns-cart-recommendations-heading">
              <h2>You may also like</h2>

              <Link to="/customer">
                View All <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="ns-cart-suggestion-grid">
              {recommendations.map((product, index) => {
                const productId = getProductId(product);
                const image = getProductImage(product);
                const price = getPrice(product);
                const oldPrice = getMRP(product);

                return (
                  <article
                    className="ns-cart-suggestion-card"
                    key={productId || index}
                  >
                    <button
                      type="button"
                      className="ns-cart-suggestion-image"
                      onClick={() => openProduct(product)}
                      aria-label={`View ${product.name} details`}
                    >
                      {image && (
                        <img
                          src={image}
                          alt={product.name || "Grocery product"}
                          loading="lazy"
                        />
                      )}
                    </button>

                    <div className="ns-cart-suggestion-info">
                      <button
                        type="button"
                        className="ns-cart-suggestion-name"
                        onClick={() => openProduct(product)}
                      >
                        {product.name}
                      </button>

                      <span>
                        {product.weight ||
                          product.unit ||
                          "1 kg"}
                      </span>

                      <div className="ns-cart-suggestion-price">
                        <strong>₹{price.toFixed(0)}</strong>

                        {oldPrice > price && (
                          <del>₹{oldPrice.toFixed(0)}</del>
                        )}
                      </div>

                      <button
                        type="button"
                        className="ns-cart-suggestion-add"
                        onClick={() => addSuggestedProduct(product)}
                      >
                        + Add
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Common_Footer />
    </div>
  );
}
