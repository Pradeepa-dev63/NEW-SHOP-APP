import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";
import "./Checkout.css";

const CART_KEY = "nearshop-cart";
const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_FEE = 30;
const EXPRESS_DELIVERY_FEE = 49;

function readCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem(CART_KEY) ||
        localStorage.getItem("nearshop_cart") ||
        "[]"
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function readAddress() {
  try {
    return JSON.parse(
      localStorage.getItem("nearshop_checkout_address") || "{}"
    );
  } catch {
    return {};
  }
}

function priceOf(item) {
  return Math.max(0, Number(item.price || 0));
}

function mrpOf(item) {
  return Math.max(
    priceOf(item),
    Number(item.oldPrice ?? item.old_price ?? item.price ?? 0)
  );
}

function imageOf(item) {
  return item.image || item.img || item.src || "";
}

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(readCart);

  const [address, setAddress] = useState(() => ({
    fullName: "",
    phone: "",
    pincode: "",
    house: "",
    locality: "",
    landmark: "",
    city: "",
    state: "Tamil Nadu",
    saveAddress: true,
    ...readAddress(),
  }));

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  // Keep the current cart saved when quantities or items change.
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("nearshop-cart-updated"));
  }, [cart]);

  // Load address values previously saved from Checkout.
  function updateAddress(event) {
    const { name, value, checked, type } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  // Edit quantities directly from Checkout.
  function changeQuantity(id, amount) {
    setCart((previous) =>
      previous.map((item) =>
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
  }

  // Remove a product directly from the order summary.
  function removeItem(id) {
    setCart((previous) =>
      previous.filter((item) => String(item.id) !== String(id))
    );
  }

  const itemCount = cart.reduce(
    (sum, item) =>
      sum + Math.max(1, Number(item.quantity || 1)),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      priceOf(item) * Math.max(1, Number(item.quantity || 1)),
    0
  );

  const totalMRP = cart.reduce(
    (sum, item) =>
      sum +
      mrpOf(item) * Math.max(1, Number(item.quantity || 1)),
    0
  );

  const discount = Math.max(0, totalMRP - subtotal);

  const deliveryFee =
    deliveryMethod === "express"
      ? EXPRESS_DELIVERY_FEE
      : subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0
        ? 0
        : STANDARD_DELIVERY_FEE;

  const couponDiscount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.percent) / 100)
    : 0;

  const grandTotal = Math.max(
    0,
    subtotal - couponDiscount + deliveryFee
  );

  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - subtotal
  );

  function applyCoupon(event) {
    event.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (!cart.length) {
      setCouponMessage("Add products to your cart first.");
      setAppliedCoupon(null);
      return;
    }

    const coupons = {
      NEAR10: 10,
      FRESH20: 20,
    };

    if (!coupons[code]) {
      setAppliedCoupon(null);
      setCouponMessage("Invalid code. Try NEAR10 or FRESH20.");
      return;
    }

    setAppliedCoupon({
      code,
      percent: coupons[code],
    });

    setCouponMessage(`${code} applied successfully.`);
    setError("");
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty. Add products before checking out.");
      return;
    }

    const requiredFields = [
      ["fullName", "Please enter your full name."],
      ["phone", "Please enter your phone number."],
      ["pincode", "Please enter your PIN code."],
      ["house", "Please enter your house or building."],
      ["locality", "Please enter your area or locality."],
      ["city", "Please enter your city."],
      ["state", "Please select your state."],
    ];

    for (const [field, message] of requiredFields) {
      if (!String(address[field] || "").trim()) {
        setError(message);
        return;
      }
    }

    if (!/^[0-9]{10}$/.test(address.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    const order = {
      orderId: `NS${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: cart,
      deliveryAddress: { ...address },
      deliveryMethod,
      paymentMethod,
      coupon: appliedCoupon,
      itemCount,
      subtotal,
      totalMRP,
      discount,
      couponDiscount,
      deliveryFee,
      grandTotal,
      status: "Placed",
    };

    try {
      const previousOrders = JSON.parse(
        localStorage.getItem("nearshop-orders") || "[]"
      );

      const orders = Array.isArray(previousOrders)
        ? previousOrders
        : [];

      localStorage.setItem(
        "nearshop-orders",
        JSON.stringify([order, ...orders])
      );

      if (address.saveAddress) {
        localStorage.setItem(
          "nearshop_checkout_address",
          JSON.stringify(address)
        );
      }

      localStorage.removeItem(CART_KEY);
      localStorage.removeItem("nearshop_cart");

      window.dispatchEvent(new Event("nearshop-cart-updated"));
      setCart([]);
      setPlacedOrder(order);
    } catch (saveError) {
      console.error("Unable to save order:", saveError);
      setError("Could not save your order. Please try again.");
    }
  }

  if (placedOrder) {
    return (
      <div className="ns-checkout-page">
      <Common_navbar />

        <main className="ns-checkout-main">
          <section className="ns-checkout-success">
            <div className="ns-checkout-success-icon">✓</div>
            <h1>Order placed successfully!</h1>
            <p>Your order has been saved in NearShop.</p>

            <div className="ns-checkout-success-details">
              <span>Order ID</span>
              <strong>{placedOrder.orderId}</strong>

              <span>Grand Total</span>
              <strong>₹{placedOrder.grandTotal.toFixed(2)}</strong>
            </div>

            <p className="ns-checkout-demo-note">
              This is a frontend demo. No online payment was processed.
            </p>

            <div className="ns-checkout-success-actions">
              <button
                type="button"
                onClick={() => navigate("/customer")}
              >
                Continue Shopping
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders")}
              >
                My Orders
              </button>
            </div>
          </section>
        </main>

        <Common_Footer />
      </div>
    );
  }

  return (
    <div className="ns-checkout-page">
      <Common_navbar />

      <main className="ns-checkout-main">
        {/* Checkout progress */}
        <div className="ns-checkout-steps">
          <div className="ns-checkout-step is-active">
            <span>1</span>
            <div>
              <strong>Delivery Address</strong>
              <small>Enter your address</small>
            </div>
          </div>

          <div className="ns-checkout-step-line" />

          <div className="ns-checkout-step is-current">
            <span>2</span>
            <div>
              <strong>Payment Method</strong>
              <small>Choose how to pay</small>
            </div>
          </div>

          <div className="ns-checkout-step-line" />

          <div className="ns-checkout-step">
            <span>3</span>
            <div>
              <strong>Review & Place Order</strong>
              <small>Confirm and place order</small>
            </div>
          </div>
        </div>

        {error && (
          <div className="ns-checkout-error" role="alert">
            {error}
          </div>
        )}

        {!cart.length ? (
          <section className="ns-checkout-empty">
            <h1>Your cart is empty</h1>
            <p>Add groceries before proceeding to checkout.</p>
            <Link to="/customer">Continue Shopping</Link>
          </section>
        ) : (
          <form
            className="ns-checkout-layout"
            onSubmit={handlePlaceOrder}
          >
            {/* LEFT: DELIVERY ADDRESS */}
            <section className="ns-checkout-panel ns-checkout-address">
              <div className="ns-checkout-panel-heading">
                <span className="ns-checkout-heading-icon">⌖</span>

                <div>
                  <h1>Delivery Address</h1>
                  <p>Enter your complete delivery details</p>
                </div>

                <button
                  type="button"
                  className="ns-checkout-use-saved"
                  onClick={() => {
                    const saved = readAddress();

                    if (saved && saved.fullName) {
                      setAddress((previous) => ({
                        ...previous,
                        ...saved,
                      }));
                      setError("");
                    } else {
                      setError("No saved address found yet.");
                    }
                  }}
                >
                  + Use Saved Address
                </button>
              </div>

              <div className="ns-checkout-address-grid">
                <label>
                  Full Name <span>*</span>
                  <input
                    name="fullName"
                    value={address.fullName}
                    onChange={updateAddress}
                    placeholder="Enter full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Phone Number <span>*</span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={address.phone}
                    onChange={updateAddress}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </label>

                <label>
                  PIN Code <span>*</span>
                  <input
                    name="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={updateAddress}
                    placeholder="6-digit PIN"
                    autoComplete="postal-code"
                    required
                  />
                </label>

                <label className="ns-checkout-field-wide">
                  House No. / Building Name <span>*</span>
                  <input
                    name="house"
                    value={address.house}
                    onChange={updateAddress}
                    placeholder="House number, building, street"
                    autoComplete="address-line1"
                    required
                  />
                </label>

                <label className="ns-checkout-field-wide">
                  Area / Locality <span>*</span>
                  <input
                    name="locality"
                    value={address.locality}
                    onChange={updateAddress}
                    placeholder="Enter your locality"
                    autoComplete="address-line2"
                    required
                  />
                </label>

                <label className="ns-checkout-field-wide">
                  Landmark (Optional)
                  <input
                    name="landmark"
                    value={address.landmark}
                    onChange={updateAddress}
                    placeholder="Nearby landmark"
                  />
                </label>

                <label>
                  City <span>*</span>
                  <input
                    name="city"
                    value={address.city}
                    onChange={updateAddress}
                    placeholder="Enter city"
                    autoComplete="address-level2"
                    required
                  />
                </label>

                <label>
                  State <span>*</span>
                  <select
                    name="state"
                    value={address.state}
                    onChange={updateAddress}
                    autoComplete="address-level1"
                    required
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <label className="ns-checkout-save-address">
                <input
                  type="checkbox"
                  name="saveAddress"
                  checked={address.saveAddress}
                  onChange={updateAddress}
                />
                <span>Save this address for future orders</span>
              </label>

              <div className="ns-checkout-location-banner">
                <span className="ns-checkout-location-icon">⌖</span>
                <div>
                  <strong>
                    Delivering to {address.city || "your city"}
                    {address.pincode ? ` - ${address.pincode}` : ""}
                  </strong>
                  <p>
                    {deliveryMethod === "express"
                      ? "Estimated delivery: Today, 2 PM - 4 PM"
                      : "Estimated delivery: Today, 4 PM - 6 PM"}
                  </p>
                </div>
              </div>
            </section>

            {/* MIDDLE: DELIVERY + PAYMENT OPTIONS */}
            <div className="ns-checkout-middle">
              <section className="ns-checkout-panel ns-checkout-delivery-panel">
                <div className="ns-checkout-panel-heading">
                  <span className="ns-checkout-heading-icon">↗</span>
                  <div>
                    <h2>Delivery Options</h2>
                    <p>Choose your preferred delivery option</p>
                  </div>
                </div>

                <div className="ns-checkout-option-list">
                  <label
                    className={`ns-checkout-choice ${
                      deliveryMethod === "standard" ? "is-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={deliveryMethod === "standard"}
                      onChange={(event) =>
                        setDeliveryMethod(event.target.value)
                      }
                    />

                    <span className="ns-checkout-custom-radio" />

                    <span className="ns-checkout-choice-copy">
                      <strong>Standard Delivery</strong>
                      <small>Today, 4 PM - 6 PM</small>
                    </span>

                    <span className="ns-checkout-choice-price">
                      {subtotal >= FREE_DELIVERY_THRESHOLD
                        ? "FREE"
                        : `₹${STANDARD_DELIVERY_FEE}`}
                    </span>
                  </label>

                  <label
                    className={`ns-checkout-choice ${
                      deliveryMethod === "express" ? "is-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="express"
                      checked={deliveryMethod === "express"}
                      onChange={(event) =>
                        setDeliveryMethod(event.target.value)
                      }
                    />

                    <span className="ns-checkout-custom-radio" />

                    <span className="ns-checkout-choice-copy">
                      <strong>Express Delivery</strong>
                      <small>Today, 2 PM - 4 PM</small>
                    </span>

                    <span className="ns-checkout-choice-price">
                      ₹{EXPRESS_DELIVERY_FEE}
                    </span>
                  </label>
                </div>
              </section>

              <section className="ns-checkout-panel ns-checkout-payment-panel">
                <div className="ns-checkout-panel-heading">
                  <span className="ns-checkout-heading-icon">▤</span>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Choose a payment method</p>
                  </div>
                </div>

                <div className="ns-checkout-option-list">
                  {[
                    {
                      id: "cod",
                      name: "Cash on Delivery (COD)",
                      description: "Pay when you receive your order",
                      icon: "₹",
                    },
                    {
                      id: "upi",
                      name: "UPI Payment",
                      description: "Google Pay, PhonePe, Paytm & more",
                      icon: "UPI",
                    },
                    {
                      id: "card",
                      name: "Credit / Debit Card",
                      description: "Visa, Mastercard, RuPay & more",
                      icon: "CARD",
                    },
                    {
                      id: "netbanking",
                      name: "Net Banking",
                      description: "All major banks supported",
                      icon: "BANK",
                    },
                    {
                      id: "wallet",
                      name: "Wallets",
                      description: "Paytm, Amazon Pay, PhonePe, Mobikwik",
                      icon: "WALLET",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`ns-checkout-choice ns-checkout-payment-choice ${
                        paymentMethod === method.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                      />

                      <span className="ns-checkout-custom-radio" />

                      <span className="ns-checkout-choice-copy">
                        <strong>{method.name}</strong>
                        <small>{method.description}</small>
                      </span>

                      <span className="ns-checkout-payment-mark">
                        {method.icon}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="ns-checkout-secure">
                  <span>✓</span>
                  <div>
                    <strong>100% Secure Checkout</strong>
                    <small>
                      Online payment processing requires a configured gateway.
                    </small>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <aside className="ns-checkout-panel ns-checkout-summary">
              <div className="ns-checkout-summary-heading">
                <div>
                  <h2>Order Summary</h2>
                  <p>{itemCount} items in your cart</p>
                </div>

                <Link to="/Add_to_card">Edit Cart</Link>
              </div>

              <div className="ns-checkout-products">
                {cart.map((item) => {
                  const quantity = Math.max(
                    1,
                    Number(item.quantity || 1)
                  );

                  const price = priceOf(item);
                  const oldPrice = mrpOf(item);
                  const image = imageOf(item);

                  return (
                    <article
                      className="ns-checkout-product"
                      key={item.id}
                    >
                      <button
                        type="button"
                        className="ns-checkout-product-image"
                        onClick={() =>
                          navigate(
                            `/product/${encodeURIComponent(
                              String(item.id ?? item.name)
                            )}`,
                            { state: { product: item } }
                          )
                        }
                        aria-label={`View ${item.name} details`}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={item.name || "Grocery product"}
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </button>

                      <div className="ns-checkout-product-info">
                        <strong>{item.name || "Grocery Product"}</strong>

                        <span>
                          {item.weight || item.unit || "1 item"}
                        </span>

                        {oldPrice > price && (
                          <div className="ns-checkout-product-discount">
                            <span>
                              {Math.round(
                                ((oldPrice - price) / oldPrice) * 100
                              )}% OFF
                            </span>
                            <del>₹{oldPrice.toFixed(0)}</del>
                          </div>
                        )}

                        <div className="ns-checkout-mini-quantity">
                          <button
                            type="button"
                            disabled={quantity <= 1}
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="ns-checkout-product-end">
                        <strong>
                          ₹{(price * quantity).toFixed(0)}
                        </strong>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          title="Remove product"
                        >
                          ×
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <form
                className="ns-checkout-coupon"
                onSubmit={applyCoupon}
              >
                <label htmlFor="ns-checkout-coupon-code">
                  <span>％</span>
                  Have a coupon code?
                </label>

                <div className="ns-checkout-coupon-entry">
                  <input
                    id="ns-checkout-coupon-code"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);
                      setCouponMessage("");
                    }}
                    placeholder="Enter coupon code"
                  />

                  <button type="submit">Apply →</button>
                </div>

                {couponMessage && (
                  <p className="ns-checkout-coupon-message" role="status">
                    {couponMessage}
                  </p>
                )}

                {appliedCoupon && (
                  <button
                    type="button"
                    className="ns-checkout-remove-coupon"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                      setCouponMessage("Coupon removed.");
                    }}
                  >
                    Remove {appliedCoupon.code}
                  </button>
                )}
              </form>

              <div className="ns-checkout-summary-row">
                <span>Total Items ({itemCount})</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>

              <div className="ns-checkout-summary-row">
                <span>Total MRP</span>
                <del>₹{totalMRP.toFixed(0)}</del>
              </div>

              <div className="ns-checkout-summary-row ns-checkout-discount-row">
                <span>Product Discount</span>
                <strong>− ₹{discount.toFixed(0)}</strong>
              </div>

              <hr />

              <div className="ns-checkout-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>

              <div className="ns-checkout-summary-row">
                <span>Delivery Fee</span>
                <strong>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </strong>
              </div>

              {appliedCoupon && (
                <div className="ns-checkout-summary-row ns-checkout-discount-row">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <strong>− ₹{couponDiscount.toFixed(0)}</strong>
                </div>
              )}

              {deliveryMethod === "standard" &&
                remainingForFreeDelivery > 0 && (
                  <div className="ns-checkout-delivery-banner">
                    <span>🚚</span>
                    <strong>
                      Add ₹{remainingForFreeDelivery.toFixed(0)} more
                      for FREE delivery
                    </strong>
                  </div>
                )}

              <div className="ns-checkout-grand-total">
                <strong>Grand Total</strong>
                <strong>₹{grandTotal.toFixed(0)}</strong>
              </div>

              <button
                type="submit"
                className="ns-checkout-place-order"
              >
                Place Order <span>→</span>
              </button>

              <p className="ns-checkout-terms">
                🔒 Secure Checkout | Your information is safe with us.
              </p>
            </aside>
          </form>
        )}

        {/* Bottom trust banners */}
        <section className="ns-checkout-trust">
          <div>
            <span>🚚</span>
            <p>
              <strong>Fast & Reliable Delivery</strong>
              <small>Delivery in 2–6 hours</small>
            </p>
          </div>

          <div>
            <span>✓</span>
            <p>
              <strong>100% Safe Payments</strong>
              <small>Secure payment options</small>
            </p>
          </div>

          <div>
            <span>♧</span>
            <p>
              <strong>Easy Returns</strong>
              <small>7-day return policy</small>
            </p>
          </div>

          <div>
            <span>♧</span>
            <p>
              <strong>Customer Support</strong>
              <small>We are here to help</small>
            </p>
          </div>
        </section>
      </main>

      <Common_Footer />
    </div>
  );
}
